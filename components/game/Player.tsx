'use client'

import { useFrame, useGraph, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'
import * as THREE from 'three'
import { useGLTF, useAnimations, ContactShadows, Html } from '@react-three/drei'
import { useRef, useMemo, useEffect, useState } from 'react'
import { SkeletonUtils } from 'three-stdlib'
import { CHARACTER_DATA, CharacterType } from '@/config/characterConfig'

interface PlayerProps {
    rigidBodyRef: React.RefObject<RapierRigidBody | null>
}

export function Player({ rigidBodyRef }: PlayerProps) {
    const characterKey = useGameStore((state) => state.character) as CharacterType
    const config = CHARACTER_DATA[characterKey] || CHARACTER_DATA.girl

    const { scene, animations } = useGLTF(config.model)
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
    const { nodes } = useGraph(clone)
    const characterGroupRef = useRef<THREE.Group>(null)
    const { actions } = useAnimations(animations, clone)

    // State Tracking
    const currentAction = useRef<string>('IDLE')
    // Removed debugState to clean up UI

    // Material enhancement
    useMemo(() => {
        clone.traverse((child: any) => {
            if (child.isMesh && child.material) {
                if (child.material.isMeshStandardMaterial) {
                    child.material.emissive = new THREE.Color(0x222222)
                    child.material.emissiveIntensity = 0.3
                    child.material.envMapIntensity = 1.5
                }
            }
        })
    }, [clone])

    // Scale calculation
    const autoScale = useMemo(() => {
        const box = new THREE.Box3().setFromObject(clone)
        const size = new THREE.Vector3()
        box.getSize(size)
        const height = size.y
        if (height === 0) return 1
        const targetHeight = 1.8
        return targetHeight / height
    }, [clone])

    const finalScale = useMemo(() => {
        return autoScale * config.scale
    }, [autoScale, config.scale])

    // Hot-Swap Safe Reset
    useEffect(() => {
        if (!actions) return

        // Stop all actions
        Object.values(actions).forEach((action: any) => action.stop())

        // Reset state
        currentAction.current = 'IDLE'

        // Play Idle immediately
        const idleName = config.animations.IDLE
        const idleClip = actions[idleName]
        if (idleClip) idleClip.reset().play()

    }, [characterKey, actions, config])

    useFrame((state) => {
        if (!rigidBodyRef.current || !actions) return

        // 1. Read Inputs
        const { forward, turn, active } = useGameStore.getState().controls
        const magnitude = Math.sqrt(forward * forward + turn * turn)
        const isJoystickActive = active && magnitude > 0.01

        // 2. Determine Target State (Input Based)
        let targetState = 'IDLE'
        if (isJoystickActive) {
            if (magnitude >= 0.8) {
                targetState = 'RUN'
            } else {
                targetState = 'WALK'
            }
        }

        // 3. The Guardian (State Transition)
        if (currentAction.current !== targetState) {
            const oldAnimName = config.animations[currentAction.current as keyof typeof config.animations]
            const newAnimName = config.animations[targetState as keyof typeof config.animations]

            const oldClip = actions[oldAnimName]
            const newClip = actions[newAnimName]

            if (oldClip) oldClip.fadeOut(0.2)

            if (newClip) {
                newClip.reset().fadeIn(0.2).play()

                // TimeScale Logic
                if (targetState === 'RUN') {
                    // If Girl (Walk reused as Run), speed it up
                    if (config.animations.WALK === config.animations.RUN) {
                        newClip.setEffectiveTimeScale(1.5)
                    } else {
                        newClip.setEffectiveTimeScale(1.2)
                    }
                } else if (targetState === 'WALK') {
                    // If Wolf (Run reused as Walk), slow it down
                    if (config.animations.WALK === config.animations.RUN) {
                        newClip.setEffectiveTimeScale(0.5)
                    } else {
                        newClip.setEffectiveTimeScale(1.0)
                    }
                } else {
                    newClip.setEffectiveTimeScale(1.0)
                }
            }

            currentAction.current = targetState
        }

        // 4. Physics & Rotation
        const MOVESPEED = config.physics.speed
        const RUN_MULTIPLIER = 1.8

        // Sync position to store
        const currentPos = rigidBodyRef.current.translation()
        useGameStore.getState().setPlayerPosition(currentPos)

        if (isJoystickActive) {
            const camera = state.camera

            const forwardVec = new THREE.Vector3()
            camera.getWorldDirection(forwardVec)
            forwardVec.y = 0
            forwardVec.normalize()

            const rightVec = new THREE.Vector3()
            rightVec.crossVectors(forwardVec, new THREE.Vector3(0, 1, 0))

            const moveDir = new THREE.Vector3()
                .addVectors(
                    forwardVec.multiplyScalar(forward),
                    rightVec.multiplyScalar(turn)
                )
                .normalize()

            // Adjusted multiplier to 35 as requested by user
            let currentSpeed = MOVESPEED * 35
            if (targetState === 'RUN') {
                // Boost for non-girl characters (Soldier, Wolf, Businessman)
                const isGirl = characterKey === 'girl'
                const extraRunBoost = isGirl ? 1.0 : 1.8 // Increased to 80% extra speed
                currentSpeed = MOVESPEED * RUN_MULTIPLIER * 35 * extraRunBoost
            }

            const moveImpulse = moveDir.multiplyScalar(currentSpeed)
            rigidBodyRef.current.applyImpulse({ x: moveImpulse.x, y: 0, z: moveImpulse.z }, true)

            // Smooth Rotation
            const targetAngle = Math.atan2(moveDir.x, moveDir.z)
            if (characterGroupRef.current) {
                const currentRotation = characterGroupRef.current.rotation.y
                let angleDiff = targetAngle - currentRotation

                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

                characterGroupRef.current.rotation.y = THREE.MathUtils.lerp(
                    currentRotation,
                    currentRotation + angleDiff,
                    0.2
                )
            }
        }
    })

    return (
        <RigidBody
            ref={rigidBodyRef}
            name="PlayerBody"
            position={[0, 5, 0]}
            enabledRotations={[false, false, false]}
            linearDamping={10.0}
            angularDamping={10.0}
        >
            <CapsuleCollider args={[0.8, 0.4]} />

            <ContactShadows
                position={[0, -0.9, 0]}
                opacity={0.6}
                scale={10}
                blur={2}
                far={4}
            />

            <group>
                <group ref={characterGroupRef}>
                    <primitive key={config.model} object={clone} position={[0, -0.9, 0]} scale={finalScale} />
                </group>
            </group>
        </RigidBody>
    )
}

useGLTF.preload('/girlanimated.glb')
useGLTF.preload('/soldier.glb')
useGLTF.preload('/wolf.glb')
useGLTF.preload('/businessman.glb')
