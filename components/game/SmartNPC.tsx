'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { RigidBody, RapierRigidBody, vec3 } from '@react-three/rapier'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { useGameStore } from '@/store/gameStore'

interface SmartNPCProps {
    npcId: string
    modelPath: string
    initialPosition: [number, number, number]
}

type NPCState = 'IDLE' | 'PATROL' | 'TALKING'

export function SmartNPC({ npcId, modelPath, initialPosition }: SmartNPCProps) {
    const rigidBodyRef = useRef<RapierRigidBody>(null)
    const groupRef = useRef<THREE.Group>(null)

    // Load model and animations
    const { scene, animations } = useGLTF(modelPath)
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
    const { actions } = useAnimations(animations, groupRef)

    // State
    const [state, setState] = useState<NPCState>('IDLE')
    const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null)
    const [dialogue, setDialogue] = useState<string | null>(null)
    const [isThinking, setIsThinking] = useState(false)

    // Store
    const playerPosition = useGameStore((state) => state.playerPosition)
    const setInteraction = useGameStore((state) => state.setInteraction)
    const clearInteraction = useGameStore((state) => state.clearInteraction)

    // Constants
    const PATROL_RADIUS = 10
    const MOVE_SPEED = 2
    const IDLE_TIME_MIN = 2000
    const IDLE_TIME_MAX = 5000

    // Initialize position
    useEffect(() => {
        if (rigidBodyRef.current) {
            rigidBodyRef.current.setTranslation({ x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] }, true)
        }
    }, [initialPosition])

    // Animation Logic
    useEffect(() => {
        const idleAction = actions['Idle'] || actions['idle'] || actions['mixamo.com']
        const walkAction = actions['Walk'] || actions['walk'] || actions['Run'] || actions['run']

        if (state === 'PATROL') {
            idleAction?.fadeOut(0.2)
            walkAction?.reset().fadeIn(0.2).play()
        } else {
            walkAction?.fadeOut(0.2)
            idleAction?.reset().fadeIn(0.2).play()
        }

        return () => {
            idleAction?.stop()
            walkAction?.stop()
        }
    }, [state, actions])

    // State Machine Logic
    useEffect(() => {
        let timeout: NodeJS.Timeout

        if (state === 'IDLE') {
            const delay = Math.random() * (IDLE_TIME_MAX - IDLE_TIME_MIN) + IDLE_TIME_MIN
            timeout = setTimeout(() => {
                // Pick random point
                const angle = Math.random() * Math.PI * 2
                const radius = Math.random() * PATROL_RADIUS
                const x = initialPosition[0] + Math.cos(angle) * radius
                const z = initialPosition[2] + Math.sin(angle) * radius
                setTargetPosition(new THREE.Vector3(x, initialPosition[1], z))
                setState('PATROL')
            }, delay)
        }

        return () => clearTimeout(timeout)
    }, [state, initialPosition])

    // Movement & Rotation Loop
    useFrame((rootState, delta) => {
        if (!rigidBodyRef.current || !groupRef.current) return

        const currentPos = rigidBodyRef.current.translation()
        const currentVec = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z)

        if (state === 'PATROL' && targetPosition) {
            const direction = new THREE.Vector3().subVectors(targetPosition, currentVec).normalize()
            const distance = currentVec.distanceTo(targetPosition)

            if (distance < 0.5) {
                // Reached destination
                rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
                setState('IDLE')
            } else {
                // Move
                const velocity = direction.multiplyScalar(MOVE_SPEED)
                rigidBodyRef.current.setLinvel({ x: velocity.x, y: 0, z: velocity.z }, true)

                // Rotate to face movement
                const lookAtTarget = new THREE.Vector3(targetPosition.x, currentPos.y, targetPosition.z)
                groupRef.current.lookAt(lookAtTarget)
            }
        } else if (state === 'TALKING' && playerPosition) {
            // Stop moving
            rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)

            // Look at player
            const lookAtTarget = new THREE.Vector3(playerPosition.x, currentPos.y, playerPosition.z)
            groupRef.current.lookAt(lookAtTarget)
        }
    })

    // Interaction Handler
    const handleInteract = async () => {
        if (state === 'TALKING') return // Already talking

        setState('TALKING')
        setIsThinking(true)

        // Determine player status (mock for now, should come from store)
        // Assuming we can get player status from store or just mock it as 'Wolf' for now if not available
        const playerStatus = 'Wolf' // TODO: Get real status

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    npcId,
                    playerStatus,
                    message: "(Player greets you)"
                })
            })
            const data = await res.json()
            setDialogue(data.reply)

            // Show dialogue in global UI (or local bubble for now)
            // For this step, we'll just log it or set local state. 
            // The request asked for a DialogueSystem UI component.
            // We should probably trigger that via the store.
            setInteraction({
                type: 'dialogue',
                data: {
                    npcId,
                    text: data.reply,
                    onClose: () => {
                        setDialogue(null)
                        setState('IDLE')
                        clearInteraction()
                    }
                }
            })

        } catch (err) {
            console.error("Failed to chat", err)
            setState('IDLE')
        } finally {
            setIsThinking(false)
        }
    }

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={initialPosition}
            colliders="hull"
            lockRotations
            type="dynamic"
            linearDamping={0.5}
            angularDamping={0.5}
        >
            <group
                ref={groupRef}
                onClick={(e) => {
                    e.stopPropagation()
                    handleInteract()
                }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <primitive object={clone} scale={[1, 1, 1]} />

                {/* Simple interaction indicator */}
                {state !== 'TALKING' && (
                    <Html position={[0, 2, 0]} center>
                        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 hover:opacity-100 transition-opacity">
                            Talk (Click)
                        </div>
                    </Html>
                )}

                {/* Thinking indicator */}
                {isThinking && (
                    <Html position={[0, 2.2, 0]} center>
                        <div className="animate-bounce text-2xl">💬</div>
                    </Html>
                )}
            </group>
        </RigidBody>
    )
}
