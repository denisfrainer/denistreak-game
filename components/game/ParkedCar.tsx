'use client'

import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useGameStore, useGameActions } from '@/store/gameStore'
import { InteractionCue } from './InteractionCue'
import { useControls } from 'leva'

interface ParkedCarProps {
    position: [number, number, number]
    rotation?: [number, number, number]
}

export function ParkedCar({ position, rotation = [0, 0, 0] }: ParkedCarProps) {
    const { nodes } = useGLTF('/cars.glb') as any
    const { enterCar } = useGameActions()
    const setInteractionTarget = useGameStore((state) => state.setInteractionTarget)
    const playerPosition = useGameStore((state) => state.playerPosition)
    const isDriving = useGameStore((state) => state.isDriving)

    // Leva Controls
    const { scale, cueHeight, interactionDist } = useControls('Parked Car', {
        scale: { value: 3.0, min: 0.5, max: 5.0, step: 0.1 },
        cueHeight: { value: 10.0, min: 2.0, max: 15.0, step: 0.5 },
        interactionDist: { value: 15.0, min: 2.0, max: 20.0, step: 0.5 }
    })

    const carMesh = useMemo(() => {
        // Using Object_24 (Sedan)
        const node = nodes['Object_24'] as THREE.Mesh
        if (node) {
            const clone = node.clone()
            clone.position.set(0, -0.5, 0)
            clone.rotation.set(0, Math.PI, 0)
            return clone
        }
        return null
    }, [nodes])

    // Interaction Logic
    const isClose = useMemo(() => {
        if (!playerPosition) return false
        const dx = playerPosition.x - position[0]
        const dz = playerPosition.z - position[2]
        const dist = Math.sqrt(dx * dx + dz * dz)

        // Debug Log (Throttle this in real app, but useful for now)
        if (Math.random() < 0.05) {
            console.log('ParkedCar Debug:', {
                playerX: playerPosition.x.toFixed(2),
                playerZ: playerPosition.z.toFixed(2),
                carX: position[0],
                carZ: position[2],
                dist: dist.toFixed(2),
                isClose: dist < interactionDist,
                interactionDist
            })
        }

        return dist < interactionDist
    }, [playerPosition, position, interactionDist])

    useEffect(() => {
        if (isClose && !isDriving) {
            setInteractionTarget({
                type: 'car',
                label: 'DIRIGIR',
                onInteract: () => enterCar()
            })
        } else if (!isClose && !isDriving) {
            // Optional: Clear interaction if we walk away
        }
    }, [isClose, isDriving, setInteractionTarget, enterCar])

    if (!carMesh) return null

    return (
        <group>
            <RigidBody
                type="fixed"
                colliders="hull"
                position={position}
                rotation={rotation}
            >
                <primitive object={carMesh} scale={scale} castShadow receiveShadow />
            </RigidBody>

            {/* Interaction Cue */}
            <group position={position}>
                <InteractionCue visible={isClose && !isDriving} label="DIRIGIR" height={cueHeight} />
            </group>
        </group>
    )
}
