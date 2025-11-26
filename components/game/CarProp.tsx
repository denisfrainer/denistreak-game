'use client'

import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'
import { useControls } from 'leva'
import { SkeletonUtils } from 'three-stdlib'

interface CarPropProps {
    modelPath: string
    position: [number, number, number]
    rotation?: [number, number, number]
    scale?: number
}

export function CarProp({ modelPath, position, rotation = [0, 0, 0], scale: initialScale = 3.0 }: CarPropProps) {
    const { scene } = useGLTF(modelPath)

    // Clone the scene so we can have multiple independent instances
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

    // Leva Controls
    const { scale } = useControls(`Car ${modelPath}`, {
        scale: { value: initialScale, min: 0.5, max: 5.0, step: 0.1 }
    })

    return (
        <RigidBody
            type="fixed"
            colliders="hull"
            position={position}
            rotation={rotation}
        >
            <primitive object={clone} scale={scale} castShadow receiveShadow />
        </RigidBody>
    )
}

// Preload common cars
useGLTF.preload('/sedan.glb')
useGLTF.preload('/batmovel.glb')
useGLTF.preload('/busao.glb')
useGLTF.preload('/bugatti.glb')
useGLTF.preload('/ice-cream-car.glb')
useGLTF.preload('/cafe-car.glb')
useGLTF.preload('/camaro.glb')
useGLTF.preload('/lambo.glb')
