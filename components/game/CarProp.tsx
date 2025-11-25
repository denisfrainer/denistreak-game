'use client'

import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'

import { useControls } from 'leva'

interface CarPropProps {
    type: 'police' | 'sedan' | 'van'
    position: [number, number, number]
    rotation?: [number, number, number]
}

export function CarProp({ type, position, rotation = [0, 0, 0] }: CarPropProps) {
    const { nodes } = useGLTF('/cars.glb') as any

    // Leva Controls
    const { scale } = useControls(`Car ${type}`, {
        scale: { value: 3.0, min: 0.5, max: 5.0, step: 0.1 }
    })

    const carMesh = useMemo(() => {
        // Mapping based on the provided log: Object_4, Object_14, Object_24
        const NODE_MAPPING: Record<string, string> = {
            police: 'Object_4',
            van: 'Object_14',
            sedan: 'Object_24'
        }

        const targetNodeName = NODE_MAPPING[type]
        const node = nodes[targetNodeName] as THREE.Mesh

        if (node) {
            const clone = node.clone()
            clone.position.set(0, 0, 0)
            clone.rotation.set(0, 0, 0)
            return clone
        } else {
            console.error(`Could not find node '${targetNodeName}' for car type '${type}'`)
            return null
        }
    }, [nodes, type])

    if (!carMesh) return null

    return (
        <RigidBody
            type="fixed"
            colliders="hull"
            position={position}
            rotation={rotation}
        >
            <primitive object={carMesh} scale={scale} castShadow receiveShadow />
        </RigidBody>
    )
}

useGLTF.preload('/cars.glb')
