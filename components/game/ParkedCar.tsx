'use client'

import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useGameStore, useGameActions } from '@/store/gameStore'
import { InteractionCue } from './InteractionCue'
import { useControls } from 'leva'
import { SkeletonUtils } from 'three-stdlib'

interface ParkedCarProps {
    position: [number, number, number]
    rotation?: [number, number, number]
}

export function ParkedCar({ position, rotation = [0, 0, 0] }: ParkedCarProps) {
    const { scene } = useGLTF('/sedan.glb')
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

    const { enterCar } = useGameActions()
    const setInteractionTarget = useGameStore((state) => state.setInteractionTarget)
    const playerPosition = useGameStore((state) => state.playerPosition)
    const isDriving = useGameStore((state) => state.isDriving)

    // Leva Controls
    const { scale, cueHeight, interactionDist } = useControls('Parked Car', {
        scale: { value: 3.0, min: 0.5, max: 5.0, step: 0.1 },
        cueHeight: { value: 3.5, min: 2.0, max: 15.0, step: 0.5 },
        interactionDist: { value: 15.0, min: 2.0, max: 20.0, step: 0.5 }
    })

    // Interaction Logic
    const isClose = useMemo(() => {
        if (!playerPosition) return false
        const dx = playerPosition.x - position[0]
        const dz = playerPosition.z - position[2]
        const dist = Math.sqrt(dx * dx + dz * dz)

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

    return (
        <group>
            <RigidBody
                type="fixed"
                colliders="hull"
                position={position}
                rotation={rotation}
            >
                <primitive object={clone} scale={scale} castShadow receiveShadow />
            </RigidBody>

            {/* Interaction Cue */}
            <group position={position}>
                <InteractionCue visible={isClose && !isDriving} label="DIRIGIR" height={cueHeight} />
            </group>
        </group>
    )
}
