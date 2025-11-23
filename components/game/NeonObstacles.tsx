'use client'
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { InstancedRigidBodies } from '@react-three/rapier'

export function NeonObstacles() {
    const count = 150
    const areaSize = 400
    const safeZoneRadius = 10 // Safe zone around spawn

    const { instances } = useMemo(() => {
        const instances = []

        for (let i = 0; i < count; i++) {
            let x, z

            // Keep generating positions until we're outside the safe zone
            do {
                x = (Math.random() - 0.5) * areaSize
                z = (Math.random() - 0.5) * areaSize
            } while (Math.sqrt(x * x + z * z) < safeZoneRadius)

            const height = 0.75 // Half of box height (1.5/2)

            instances.push({
                key: `cube_${i}`,
                position: [x, height, z] as [number, number, number],
                rotation: [0, Math.random() * Math.PI, 0] as [number, number, number],
                scale: [1.5, 1.5, 1.5] as [number, number, number],
            })
        }

        return { instances }
    }, [])

    return (
        <InstancedRigidBodies instances={instances} type="fixed" colliders="cuboid">
            <instancedMesh args={[undefined, undefined, instances.length]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial wireframe={true} color="#00ffff" />
            </instancedMesh>
        </InstancedRigidBodies>
    )
}
