'use client'

import { RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'

export function DestructibleProps() {
    const boxCount = 30
    const coneCount = 20
    const areaSize = 100

    const props = useMemo(() => {
        const items = []

        // Generate Boxes
        for (let i = 0; i < boxCount; i++) {
            items.push({
                id: `box-${i}`,
                type: 'box',
                position: [
                    (Math.random() - 0.5) * areaSize,
                    5 + Math.random() * 5, // Drop from sky
                    (Math.random() - 0.5) * areaSize
                ],
                color: '#ff9900' // Orange
            })
        }

        // Generate Cones
        for (let i = 0; i < coneCount; i++) {
            items.push({
                id: `cone-${i}`,
                type: 'cone',
                position: [
                    (Math.random() - 0.5) * areaSize,
                    5 + Math.random() * 5,
                    (Math.random() - 0.5) * areaSize
                ],
                color: '#ff3300' // Red-Orange
            })
        }

        return items
    }, [])

    return (
        <group>
            {props.map((prop) => (
                <RigidBody
                    key={prop.id}
                    position={prop.position as [number, number, number]}
                    colliders={prop.type === 'box' ? 'cuboid' : 'hull'}
                    mass={1} // Light mass for easy pushing
                    restitution={0.5} // Bouncy
                >
                    <mesh castShadow receiveShadow>
                        {prop.type === 'box' ? (
                            <boxGeometry args={[1, 1, 1]} />
                        ) : (
                            <coneGeometry args={[0.5, 1, 16]} />
                        )}
                        <meshStandardMaterial color={prop.color} />
                    </mesh>
                </RigidBody>
            ))}
        </group>
    )
}
