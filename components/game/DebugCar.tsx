'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'

export function DebugCar() {
    const { nodes, scene } = useGLTF('/cars.glb') as any

    useEffect(() => {
        console.log("🚗 RAIO-X COMPLETO (HIERARQUIA):")
        scene.traverse((child: any) => {
            console.log(`Node: ${child.name} | Type: ${child.type} | Pos: ${child.position.x.toFixed(2)}, ${child.position.y.toFixed(2)}, ${child.position.z.toFixed(2)}`)
            if (child.isMesh) {
                console.log(`   -> Mesh Geometry: ${child.geometry.type}`)
            }
        })
    }, [scene])

    return <primitive object={scene} position={[5, 0, 5]} />
}
