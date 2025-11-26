'use client'

import { useGLTF } from '@react-three/drei'
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier'
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGameStore, useGameActions } from '@/store/gameStore'
import { useControls } from 'leva'
import { SkeletonUtils } from 'three-stdlib'

interface CarPlayerProps {
    rigidBodyRef: React.RefObject<RapierRigidBody | null>
    position: [number, number, number]
}

export function CarPlayer({ rigidBodyRef, position }: CarPlayerProps) {
    const { scene } = useGLTF('/sedan.glb')
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

    const controls = useGameStore((state) => state.controls)
    const { exitCar } = useGameActions()

    // Leva Controls
    const { scale, maxSpeed, acceleration, turnSpeed, drift } = useControls('Car Player', {
        scale: { value: 3.0, min: 0.5, max: 5.0, step: 0.1 },
        maxSpeed: { value: 80, min: 20, max: 200, step: 5 },
        acceleration: { value: 50, min: 10, max: 100, step: 5 },
        turnSpeed: { value: 2.0, min: 0.5, max: 5.0, step: 0.1 },
        drift: { value: 0.8, min: 0.1, max: 5.0, step: 0.1 }
    })

    useFrame((state, delta) => {
        if (!rigidBodyRef.current) return

        const { forward, turn, active } = controls

        if (active) {
            // Acceleration (Impulse)
            const impulse = { x: 0, y: 0, z: 0 }
            const rotation = rigidBodyRef.current.rotation()
            const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)

            const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion)

            // Apply force based on forward input
            impulse.x = forwardDir.x * forward * acceleration * delta * 50
            impulse.z = forwardDir.z * forward * acceleration * delta * 50

            // Speed Limit Check
            const vel = rigidBodyRef.current.linvel()
            const currentSpeed = Math.sqrt(vel.x ** 2 + vel.z ** 2)
            if (currentSpeed < maxSpeed) {
                rigidBodyRef.current.applyImpulse(impulse, true)
            }

            // Turning (Torque)
            if (currentSpeed > 1) {
                const torque = { x: 0, y: -turn * turnSpeed * delta * 50, z: 0 }
                // Reverse turning when going backward for natural feel
                if (forward < 0) torque.y *= -1

                rigidBodyRef.current.applyTorqueImpulse(torque, true)
            }
        }
    })

    // Keyboard listener for exiting
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'b' || e.key === 'Escape') {
                if (rigidBodyRef.current) {
                    const pos = rigidBodyRef.current.translation()
                    exitCar({ x: pos.x, y: pos.y, z: pos.z })
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [exitCar, rigidBodyRef])

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={position}
            colliders={false} // Custom collider
            mass={500} // Heavy car
            linearDamping={drift} // Drift feel
            angularDamping={2.0} // Stable turning
            type="dynamic"
        >
            <CuboidCollider args={[1 * scale * 0.3, 0.5 * scale * 0.3, 2 * scale * 0.3]} position={[0, 0.5, 0]} />
            <primitive object={clone} scale={scale} castShadow receiveShadow />
        </RigidBody>
    )
}
