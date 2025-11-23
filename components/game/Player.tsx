'use client'

import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import { useControlsStore } from '@/store/controlsStore'
import * as THREE from 'three'

export function Player() {
    const rigidBody = useRef<RapierRigidBody>(null)
    // Remove reactive subscription to prevent re-renders on every joystick move
    // const { movement } = useControlsStore()

    useFrame(() => {
        if (!rigidBody.current) return

        const speed = 5
        const { movement } = useControlsStore.getState()

        // Joystick Y is usually "up" on screen, which corresponds to -Z in 3D
        // Joystick X is "right" on screen, which corresponds to +X in 3D
        const velocity = {
            x: movement.x * speed,
            y: rigidBody.current.linvel().y, // Keep current vertical velocity (gravity)
            z: -movement.y * speed,
        }

        rigidBody.current.setLinvel(velocity, true)
    })

    return (
        <RigidBody
            ref={rigidBody}
            position={[0, 1, 0]}
            enabledRotations={[false, false, false]} // Prevent tipping over
            colliders="cuboid"
        >
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="hotpink" />
            </mesh>
        </RigidBody>
    )
}
