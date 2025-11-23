'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useRef } from 'react'

interface ChaseCameraProps {
    playerRef: React.RefObject<RapierRigidBody | null>
}

export function ChaseCamera({ playerRef }: ChaseCameraProps) {
    const { camera } = useThree()

    const currentAngle = useRef(0)

    // Camera Configuration - Increased for wider view
    const distance = 15  // Increased from 10
    const height = 8     // Increased from 6

    useFrame((state, delta) => {
        if (!playerRef.current) return

        const playerPos = playerRef.current.translation()

        // Get velocity to determine movement direction
        const vel = playerRef.current.linvel()
        const speed = Math.sqrt(vel.x ** 2 + vel.z ** 2)

        let targetAngle = currentAngle.current

        // Only update angle if moving significantly
        if (speed > 0.5) {
            targetAngle = Math.atan2(vel.x, vel.z)
        }

        // Smoothly interpolate angle
        let angleDiff = targetAngle - currentAngle.current
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

        currentAngle.current += angleDiff * (delta * 2)

        // Calculate camera position
        const cameraX = playerPos.x - Math.sin(currentAngle.current) * distance
        const cameraZ = playerPos.z - Math.cos(currentAngle.current) * distance

        const desiredPosition = new THREE.Vector3(cameraX, playerPos.y + height, cameraZ)

        camera.position.lerp(desiredPosition, 0.1)

        // Look slightly above player's head to see horizon
        camera.lookAt(playerPos.x, playerPos.y + 2.0, playerPos.z)
    })

    return null
}
