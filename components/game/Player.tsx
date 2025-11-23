'use client'

import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier'
import { useControlsStore } from '@/store/controlsStore'
import * as THREE from 'three'
import { NavigationArrow } from './NavigationArrow'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef, useEffect } from 'react'

interface PlayerProps {
    rigidBodyRef: React.RefObject<RapierRigidBody | null>
}

export function Player({ rigidBodyRef }: PlayerProps) {
    // Load 3D model (no bag for now)
    const characterModel = useGLTF('/girlanimated.glb')

    // Character ref for animations
    const characterRef = useRef<THREE.Group>(null)
    const characterGroupRef = useRef<THREE.Group>(null)

    // Load animations
    const { actions, names } = useAnimations(characterModel.animations, characterRef)

    // Start with Idle animation
    useEffect(() => {
        if (actions && names.length > 0) {
            const idleAction = actions['Idle']
            if (idleAction) {
                idleAction.play()
            }
        }
    }, [actions, names])

    useFrame(() => {
        if (!rigidBodyRef.current) return

        const { movement } = useControlsStore.getState()

        // Walking Physics Constants
        const acceleration = 8
        const turnSpeed = 12

        // Get current velocity for animation
        const vel = rigidBodyRef.current.linvel()
        const speed = Math.sqrt(vel.x ** 2 + vel.z ** 2)

        // Animation switching
        if (actions) {
            if (speed > 0.5) {
                const walkAction = actions['Walking']
                const idleAction = actions['Idle']

                if (walkAction && !walkAction.isRunning()) {
                    walkAction.reset().fadeIn(0.2).play()
                }
                if (idleAction && idleAction.isRunning()) {
                    idleAction.fadeOut(0.2)
                }
            } else {
                const idleAction = actions['Idle']
                const walkAction = actions['Walking']

                if (idleAction && !idleAction.isRunning()) {
                    idleAction.reset().fadeIn(0.2).play()
                }
                if (walkAction && walkAction.isRunning()) {
                    walkAction.fadeOut(0.2)
                }
            }
        }

        // Physics
        // Isometric Camera Basis (approximate for [12, 12, 12] offset)
        // Forward (Up on screen) -> (-1, 0, -1)
        // Right (Right on screen) -> (1, 0, -1)

        const moveX = movement.x - movement.y
        const moveZ = -movement.x - movement.y

        const moveDir = new THREE.Vector3(moveX, 0, moveZ).normalize()
        const moveImpulse = moveDir.multiplyScalar(acceleration)

        rigidBodyRef.current.wakeUp()

        // Apply movement
        if (movement.x !== 0 || movement.y !== 0) {
            const vel = rigidBodyRef.current.linvel()
            // Apply impulse to reach desired velocity, but keep it physics-based
            // Simple impulse for now:
            rigidBodyRef.current.applyImpulse({ x: moveImpulse.x, y: 0, z: moveImpulse.z }, true)

            // Rotate character to face movement
            const targetAngle = Math.atan2(moveDir.x, moveDir.z)

            // Smooth rotation
            if (characterGroupRef.current) {
                const currentRotation = characterGroupRef.current.rotation.y
                // Shortest path rotation
                let angleDiff = targetAngle - currentRotation
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

                characterGroupRef.current.rotation.y += angleDiff * 0.15
            }
        }

        // Apply drag manually if needed, or rely on damping
    })

    return (
        <RigidBody
            ref={rigidBodyRef}
            name="PlayerBody"
            position={[0, 5, 0]} // Spawn higher to avoid clipping
            enabledRotations={[false, false, false]} // Lock physics rotation
            linearDamping={4.0} // Reduced damping for snappier movement
            angularDamping={10.0}
        >
            <CapsuleCollider args={[0.8, 0.4]} />

            <group>
                <NavigationArrow />

                <group ref={characterGroupRef}>
                    <primitive ref={characterRef} object={characterModel.scene} position={[0, -1, 0]} />
                </group>
            </group>
        </RigidBody>
    )
}
