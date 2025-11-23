'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { InstancedRigidBodies, RigidBody, CuboidCollider } from '@react-three/rapier'

export function ProceduralCity() {
    const gridSize = 200 // Area size
    const cellSize = 10 // Size of each block
    const gridCount = 20 // 20x20 grid

    const buildingColors = useMemo(() => [
        new THREE.Color('#e63946'), // Red
        new THREE.Color('#f1faee'), // White
        new THREE.Color('#a8dadc'), // Light Blue
        new THREE.Color('#457b9d'), // Medium Blue
        new THREE.Color('#1d3557'), // Dark Blue
    ], [])

    const { instances, colors, groundTiles } = useMemo(() => {
        const instances = []
        const colors = []
        const groundTiles = [] // Store ground tile data: { position, color }

        for (let x = -gridCount / 2; x < gridCount / 2; x++) {
            for (let z = -gridCount / 2; z < gridCount / 2; z++) {
                const posX = x * cellSize
                const posZ = z * cellSize

                // Street Logic: Leave gaps every 3 blocks
                const isStreetX = Math.abs(x) % 3 === 0
                const isStreetZ = Math.abs(z) % 3 === 0

                if (!isStreetX && !isStreetZ) {
                    // Building Spot
                    const height = 5 + Math.random() * 25
                    const width = cellSize * 0.8
                    const depth = cellSize * 0.8

                    // Random Color
                    const color = buildingColors[Math.floor(Math.random() * buildingColors.length)]
                    colors.push(color.toArray())

                    instances.push({
                        key: `building_${x}_${z}`,
                        position: [posX, height / 2, posZ] as [number, number, number],
                        rotation: [0, 0, 0] as [number, number, number],
                        scale: [width, height, depth] as [number, number, number],
                    })
                } else {
                    // Street/Ground Spot
                    // 5% chance of grass, otherwise asphalt
                    const isGrass = Math.random() < 0.05
                    groundTiles.push({
                        position: [posX, -0.1, posZ] as [number, number, number],
                        color: isGrass ? '#4caf50' : '#333333',
                        key: `ground_${x}_${z}`
                    })
                }
            }
        }

        return { instances, colors: Float32Array.from(colors.flat()), groundTiles }
    }, [buildingColors])

    return (
        <group>
            {/* Ground Collider (Invisible, covers whole area) */}
            <RigidBody type="fixed" colliders={false}>
                <CuboidCollider args={[gridSize, 0.1, gridSize]} position={[0, -0.2, 0]} />
            </RigidBody>

            {/* Visual Ground Tiles */}
            {groundTiles.map((tile) => (
                <mesh key={tile.key} rotation={[-Math.PI / 2, 0, 0]} position={tile.position} receiveShadow>
                    <planeGeometry args={[cellSize, cellSize]} />
                    <meshStandardMaterial color={tile.color} />
                </mesh>
            ))}

            {/* Instanced Buildings */}
            <InstancedRigidBodies
                instances={instances}
                colliders="cuboid"
                type="fixed"
            >
                <instancedMesh
                    args={[undefined, undefined, instances.length]}
                    castShadow
                    receiveShadow
                >
                    <boxGeometry args={[1, 1, 1]}>
                        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
                    </boxGeometry>
                    <meshStandardMaterial vertexColors />
                </instancedMesh>
            </InstancedRigidBodies>
        </group>
    )
}
