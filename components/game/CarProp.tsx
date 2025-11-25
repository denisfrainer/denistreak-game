'use client'

import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { splitGeometryByPosition } from '@/utils/modelUtils'

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

    // Memoize the split geometries to avoid re-calculating on every render
    const wheelGeometries = useMemo(() => {
        const wheelsMesh = nodes['Object_1'] as THREE.Mesh
        if (!wheelsMesh) return null

        // Centers from the hierarchy log
        const centers: Record<string, [number, number, number]> = {
            police: [0, 0, 0],
            van: [-3.17, 0, 1.21],
            sedan: [3.07, -0.09, 1.20]
        }

        return splitGeometryByPosition(wheelsMesh, centers, 2.0)
    }, [nodes])

    const carMesh = useMemo(() => {
        // Mapping based on the provided log: Object_4, Object_14, Object_24
        const NODE_MAPPING: Record<string, string> = {
            police: 'Object_4',
            van: 'Object_14',
            sedan: 'Object_24'
        }

        const targetNodeName = NODE_MAPPING[type]
        const body = nodes[targetNodeName] as THREE.Mesh

        if (body && wheelGeometries && wheelGeometries[type]) {
            const group = new THREE.Group()

            // Body
            const bodyClone = body.clone()
            bodyClone.position.set(0, 0, 0)
            bodyClone.rotation.set(0, 0, 0)
            group.add(bodyClone)

            // Wheels (Specific to this car type)
            const wheelsGeometry = wheelGeometries[type]
            const wheelsMaterial = (nodes['Object_1'] as THREE.Mesh).material
            const wheelsMesh = new THREE.Mesh(wheelsGeometry, wheelsMaterial)

            // Inverse of the original center for this car to align with body at 0,0,0
            const centers: Record<string, [number, number, number]> = {
                police: [0, 0, 0],
                van: [-3.17, 0, 1.21],
                sedan: [3.07, -0.09, 1.20]
            }
            const center = centers[type]
            wheelsMesh.position.set(-center[0], -center[1], -center[2])

            group.add(wheelsMesh)

            return group
        } else {
            return null
        }
    }, [nodes, type, wheelGeometries])

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
