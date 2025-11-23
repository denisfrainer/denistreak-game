'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import * as THREE from 'three'

export function NavigationArrow() {
    const arrowRef = useRef<THREE.Group>(null)
    const deliveryTarget = useGameStore((state) => state.deliveryTarget)

    useFrame((state) => {
        if (!arrowRef.current) return

        // Get parent (player) world position
        const playerPos = new THREE.Vector3()
        if (arrowRef.current.parent) {
            arrowRef.current.parent.getWorldPosition(playerPos)
        }

        // Target position (global coordinates)
        const targetPos = new THREE.Vector3(deliveryTarget.x, playerPos.y + 3.5, deliveryTarget.z)

        // Calculate direction vector
        const direction = new THREE.Vector3()
        direction.subVectors(targetPos, playerPos)
        direction.y = 0 // Keep it horizontal
        direction.normalize()

        // Position arrow slightly forward to avoid jitter
        const arrowWorldPos = playerPos.clone()
        arrowWorldPos.y += 3.5
        arrowWorldPos.add(direction.multiplyScalar(0.5)) // Small offset forward

        // Point at target
        arrowRef.current.position.set(0, 3.5, 0)
        arrowRef.current.lookAt(targetPos)

        // Animation: Float
        const time = state.clock.getElapsedTime()
        const mesh = arrowRef.current.children[0]
        if (mesh) {
            mesh.position.y = Math.sin(time * 3) * 0.2
            mesh.rotation.z = time * 2 // Spin for attention
        }
    })

    return (
        <group ref={arrowRef} position={[0, 3.5, 0]}>
            {/* Arrow Shape */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.5, 1.5, 4]} />
                <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} />
            </mesh>
        </group>
    )
}
