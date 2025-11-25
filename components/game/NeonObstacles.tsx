'use client'

import { useMemo } from 'react'
import { RigidBody } from '@react-three/rapier'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'

export function NeonObstacles() {
    const blocks = useMemo(() => {
        return new Array(20).fill(0).map((_, i) => ({
            position: [
                10 + (Math.random() - 0.5) * 5,
                5 + i * 2.5,
                10 + (Math.random() - 0.5) * 5
            ] as [number, number, number],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number]
        }))
    }, [])

    return (
        <group>
            {blocks.map((block, i) => (
                <RigidBody
                    key={i}
                    position={block.position}
                    rotation={block.rotation}
                    colliders="hull"
                    mass={0.2}
                    linearDamping={0.1}
                    angularDamping={0.1}
                    friction={1.0}
                    restitution={0.5}
                >
                    {/* Switched to BoxGeometry for reliable Edges rendering */}
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[2, 2, 2]} />
                        <meshBasicMaterial color="black" transparent opacity={0.2} />
                        <Edges scale={1.05} threshold={15} color="#00ffff" renderOrder={1000} />
                    </mesh>
                </RigidBody>
            ))}
        </group>
    )
}
