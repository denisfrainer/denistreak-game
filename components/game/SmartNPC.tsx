'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { RigidBody, RapierRigidBody, vec3 } from '@react-three/rapier'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { useGameStore } from '@/store/gameStore'
import { InteractionCue } from './InteractionCue'

interface SmartNPCProps {
    npcId: string
    modelPath: string
    initialPosition: [number, number, number]
    scale?: number
}

type NPCState = 'IDLE' | 'PATROL' | 'TALKING'

export function SmartNPC({ npcId, modelPath, initialPosition, scale = 1 }: SmartNPCProps) {
    const rigidBodyRef = useRef<RapierRigidBody>(null)
    const groupRef = useRef<THREE.Group>(null)

    // Load model and animations
    const { scene, animations } = useGLTF(modelPath)
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
    const { actions, names } = useAnimations(animations, groupRef)

    // State
    const [state, setState] = useState<NPCState>('IDLE')
    const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null)
    const [dialogue, setDialogue] = useState<string | null>(null)
    const [isThinking, setIsThinking] = useState(false)
    const [showCue, setShowCue] = useState(false)

    // Stuck Detection State
    const lastPosRef = useRef<THREE.Vector3>(new THREE.Vector3(initialPosition[0], initialPosition[1], initialPosition[2]))
    const lastCheckTimeRef = useRef<number>(0)

    // Store
    const playerPosition = useGameStore((state) => state.playerPosition)
    const setInteraction = useGameStore((state) => state.setInteraction)
    const clearInteraction = useGameStore((state) => state.clearInteraction)
    const setInteractionTarget = useGameStore((state) => state.setInteractionTarget)
    const interactionTarget = useGameStore((state) => state.interactionTarget)

    // Constants
    const PATROL_RADIUS = 10
    const MOVE_SPEED = 2
    const IDLE_TIME_MIN = 2000
    const IDLE_TIME_MAX = 5000
    const STUCK_CHECK_INTERVAL = 2.0 // Check every 2 seconds
    const STUCK_THRESHOLD = 0.5 // Minimum distance to move to not be considered stuck

    // Initialize position
    useEffect(() => {
        if (rigidBodyRef.current) {
            rigidBodyRef.current.setTranslation({ x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] }, true)
        }
    }, [initialPosition])

    // Animation Logic
    useEffect(() => {
        const idleAction = actions[names.find(n => /idle|breath/i.test(n)) || names[0]]
        const walkAction = actions[names.find(n => /walk|run|move/i.test(n)) || names[0]]

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
    }, [state, actions, names])

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

        // Stuck Detection
        if (state === 'PATROL') {
            const time = rootState.clock.elapsedTime
            if (time - lastCheckTimeRef.current > STUCK_CHECK_INTERVAL) {
                const distMoved = currentVec.distanceTo(lastPosRef.current)
                if (distMoved < STUCK_THRESHOLD) {
                    // Stuck! Reset to IDLE to pick a new target
                    // console.log(`NPC ${npcId} stuck! Resetting.`)
                    setState('IDLE')
                    rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
                }
                lastPosRef.current.copy(currentVec)
                lastCheckTimeRef.current = time
            }
        }

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

        // Fallback "Bobbing" animation if no animations exist
        if (names.length === 0) {
            groupRef.current.position.y = Math.sin(rootState.clock.elapsedTime * 5) * 0.1
        }

        // Interaction Proximity Check
        if (playerPosition && state !== 'TALKING') {
            const dist = currentVec.distanceTo(new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z))
            const isClose = dist < 3 // Interaction radius
            const isCueVisible = dist < 8 // Cue visibility radius (larger than interaction)

            if (isCueVisible !== showCue) {
                setShowCue(isCueVisible)
            }

            if (isClose) {
                if (interactionTarget?.id !== npcId) {
                    setInteractionTarget({
                        type: 'npc',
                        id: npcId,
                        label: 'TROVAR',
                        onInteract: () => handleInteract()
                    })
                }
            } else {
                if (interactionTarget?.id === npcId) {
                    setInteractionTarget(null)
                }
            }
        }
    })

    // Interaction Handler
    const handleInteract = async (messageOverride?: string) => {
        if (state === 'TALKING' && !messageOverride) return

        setState('TALKING')
        setIsThinking(true)

        const playerStatus = 'Wolf' // TODO: Get real status

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    npcId,
                    playerStatus,
                    message: messageOverride || "(Player greets you)"
                })
            })
            const data = await res.json()

            const replyText = data.reply || data.text || "..."
            const options = data.options || []

            setDialogue(replyText)

            setInteraction({
                type: 'dialogue',
                data: {
                    npcId,
                    text: replyText,
                    options: options,
                    onReply: (msg) => handleInteract(msg),
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
            mass={5}
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
                <primitive object={clone} scale={[scale, scale, scale]} />

                {/* Interaction Cue */}
                <InteractionCue visible={showCue && state !== 'TALKING'} />

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
