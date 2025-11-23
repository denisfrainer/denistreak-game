'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

interface ChaseCameraProps {
    playerRef: React.RefObject<RapierRigidBody | null>
}

export function ChaseCamera({ playerRef }: ChaseCameraProps) {
    const { camera } = useThree()

    // Isometric Angle
    // 35.264 degrees (approx) is standard isometric pitch
    // We'll set a fixed rotation and just move the camera
    const isoRotation = new THREE.Euler(-Math.PI / 4, Math.PI / 4, 0, 'YXZ') // 45 deg Y, -45 deg X

    // Offset distance for Orthographic
    // In Ortho, distance doesn't affect size, but it affects clipping and lighting direction if attached
    const offset = new THREE.Vector3(8, 8, 8)
    const smoothSpeed = 0.1

    useFrame(() => {
        if (!playerRef.current) return

        const playerPos = playerRef.current.translation()
        const targetPos = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z)

        // Desired position maintains fixed offset relative to player world pos
        // We do NOT rotate with player
        const desiredPosition = targetPos.clone().add(offset)

        // Smooth follow
        camera.position.lerp(desiredPosition, smoothSpeed)

        // Always look at the player (or slightly ahead)
        camera.lookAt(targetPos)

        // Ensure Orthographic Zoom is set (can also be done in Canvas, but good to ensure)
        if (camera.type === 'OrthographicCamera') {
            camera.zoom = 20 // Zoom out to see more
            camera.updateProjectionMatrix()
        }
    })

    return null
}
