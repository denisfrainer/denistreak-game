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

        // Calculate direction to target
        // Get player position (world)
        const playerPos = new THREE.Vector3()
        arrowRef.current.getWorldPosition(playerPos)

        // Target position (world)
        const targetPos = new THREE.Vector3(deliveryTarget.x, playerPos.y, deliveryTarget.z)

        // Make the arrow look at the target
        arrowRef.current.lookAt(targetPos)

        // Animation: Float and Spin
        const time = state.clock.getElapsedTime()

        // Float (Sine wave on Y)
        // Base position is handled by parent group, we animate local Y
        // Actually, let's animate the mesh inside the group to avoid fighting with lookAt?
        // No, lookAt affects rotation, position is fine.
        // But wait, lookAt rotates the whole group.
        // Let's animate the inner mesh for spin, and the group Y for float?
        // Simpler: Animate the group's Y position relative to player.

        // We can't easily animate group Y here because it's set in the return JSX.
        // Let's animate the mesh rotation and position.

        const mesh = arrowRef.current.children[0]
        if (mesh) {
            // Float
            mesh.position.y = Math.sin(time * 3) * 0.2

            // Spin (on its own axis, maybe? No, arrow needs to point to target)
            // The user asked for "girar (useFrame) para chamar atenção".
            // If it spins, it stops pointing to target.
            // Maybe they mean a "bobbing" spin or just the floating?
            // "girar" usually means spin.
            // Let's make it spin around its local Z axis (barrel roll) or just float?
            // A pointing arrow shouldn't spin like a top.
            // Maybe they mean "rotate" as in "face the target"?
            // "girar... para chamar atenção" -> Maybe a slow rotation around its own axis while pointing?
            // Let's do a "scale pulse" or just the floating. Floating is "flutuar".
            // "flutuar um pouco mais alto e girar".
            // Let's add a local rotation to the mesh, so it spins while the group points.
            mesh.rotation.z = time * 2
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
