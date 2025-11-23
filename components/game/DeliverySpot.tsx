'use client'

import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/store/gameStore'
import { useRef } from 'react'
import * as THREE from 'three'

export function DeliverySpot() {
    const deliveryTarget = useGameStore((state) => state.deliveryTarget)
    const setDeliveryStatus = useGameStore((state) => state.actions.setDeliveryStatus)
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (!groupRef.current) return

        // Find Player
        const player = state.scene.getObjectByName('PlayerBody')

        if (player) {
            const playerPos = player.position
            const targetPos = new THREE.Vector3(deliveryTarget.x, 0, deliveryTarget.z)

            // Calculate distance
            const distance = playerPos.distanceTo(targetPos)

            // Check proximity (3 units)
            const isClose = distance < 3

            // Update store
            if (useGameStore.getState().isAtDeliverySpot !== isClose) {
                setDeliveryStatus(isClose)
            }
        }

        // Animation: Rotate and bob
        const time = state.clock.getElapsedTime()
        groupRef.current.rotation.y = time
        groupRef.current.position.y = 5 + Math.sin(time * 2) * 0.5 // Base height 5 + bob
    })

    return (
        <group ref={groupRef} position={[deliveryTarget.x, 5, deliveryTarget.z]}>
            {/* Neon Green Beacon */}
            <mesh>
                <cylinderGeometry args={[1, 1, 10, 32]} />
                <meshStandardMaterial
                    color="#00ff00"
                    emissive="#00ff00"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Glow Light */}
            <pointLight color="#00ff00" intensity={5} distance={20} decay={2} />

            {/* Inner Beam */}
            <mesh>
                <cylinderGeometry args={[0.2, 0.2, 100, 8]} />
                <meshBasicMaterial color="#ccffcc" transparent opacity={0.5} />
            </mesh>
        </group>
    )
}
