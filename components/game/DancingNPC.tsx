'use client'

import { useGLTF, useAnimations } from '@react-three/drei'
import { useControls } from 'leva'
import { useEffect, useMemo } from 'react'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

interface DancingNPCProps {
    position: [number, number, number]
}

export function DancingNPC({ position }: DancingNPCProps) {
    const { scene, animations } = useGLTF('/girldancing.glb')

    // Clone scene for independent instance
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

    // Leva controls for scale
    const { scale } = useControls('NPC', {
        scale: { value: 1.0, min: 0.1, max: 5, step: 0.1 }
    })

    // Setup animations
    const { actions, names } = useAnimations(animations, clone)

    // Auto-play first animation
    useEffect(() => {
        if (actions && names.length > 0) {
            const firstAction = actions[names[0]]
            if (firstAction) {
                firstAction.play()
            }
        }
    }, [actions, names])

    // Force scale reduction
    useEffect(() => {
        if (clone) {
            // FORÇA BRUTA: Reduz o modelo para 1% do tamanho original.
            const BASE_SCALE = 0.02
            clone.scale.set(BASE_SCALE, BASE_SCALE, BASE_SCALE)
            // Apply Leva scale on top
            clone.scale.multiplyScalar(scale)
        }
    }, [clone, scale])

    return (
        <group position={position}>
            {/* Pink/Purple spotlight on dancer */}
            <spotLight
                position={[0, 5, 0]}
                angle={0.6}
                penumbra={0.5}
                intensity={10}
                color="#ff00ff"
                castShadow={false}
            />
            <pointLight position={[0, 1, 0]} distance={8} intensity={3} color="#ff00ff" />

            <primitive object={clone} castShadow={false} />
        </group>
    )
}

// Preload
useGLTF.preload('/girldancing.glb')
