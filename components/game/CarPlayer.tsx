'use client'

import { useGLTF } from '@react-three/drei'
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGameStore, useGameActions } from '@/store/gameStore'
import { useControls } from 'leva'
import { splitGeometryByPosition } from '@/utils/modelUtils'

interface CarPlayerProps {
    rigidBodyRef: React.RefObject<RapierRigidBody | null>
    position: [number, number, number]
}

export function CarPlayer({ rigidBodyRef, position }: CarPlayerProps) {
    const { nodes } = useGLTF('/cars.glb') as any
    const controls = useGameStore((state) => state.controls)
    const { exitCar } = useGameActions()

    // Debug: Log all nodes to find wheels
    useEffect(() => {
        console.log('Car Nodes:', Object.keys(nodes))
    }, [nodes])

    // Leva Controls
    const { scale, maxSpeed, acceleration, turnSpeed, drift } = useControls('Car Player', {
        scale: { value: 3.0, min: 0.5, max: 5.0, step: 0.1 },
        maxSpeed: { value: 80, min: 20, max: 200, step: 5 },
        acceleration: { value: 50, min: 10, max: 100, step: 5 },
        turnSpeed: { value: 2.0, min: 0.5, max: 5.0, step: 0.1 },
        drift: { value: 0.8, min: 0.1, max: 5.0, step: 0.1 }
    })

    // Memoize the split geometries to avoid re-calculating on every render
    const wheelGeometries = useMemo(() => {
        const wheelsMesh = nodes['Object_1'] as THREE.Mesh
        if (!wheelsMesh) return null

        // Centers from the hierarchy log
        const centers: Record<string, [number, number, number]> = {
            police: [0, 0, 0],
            van: [-3.17, 0, 1.21],
            sedan: [3.07, -0.09, 1.20]
        }

        return splitGeometryByPosition(wheelsMesh, centers, 2.0)
    }, [nodes])

    const carMesh = useMemo(() => {
        // Using Object_24 (Sedan) as the player car
        const body = nodes['Object_24'] as THREE.Mesh

        if (body && wheelGeometries && wheelGeometries['sedan']) {
            const group = new THREE.Group()

            const bodyClone = body.clone()
            bodyClone.position.set(0, -0.5, 0)
            bodyClone.rotation.set(0, Math.PI, 0)
            group.add(bodyClone)

            const wheelsGeometry = wheelGeometries['sedan']
            const wheelsMaterial = (nodes['Object_1'] as THREE.Mesh).material
            const wheelsMesh = new THREE.Mesh(wheelsGeometry, wheelsMaterial)

            // Sedan Offset: Inverse of [3.07, -0.09, 1.20] -> [-3.07, 0.09, -1.20]
            // Adjusted for base position (0, -0.5, 0)
            const offsetX = -3.07
            const offsetY = 0.09 - 0.5
            const offsetZ = -1.20

            wheelsMesh.position.set(offsetX, offsetY, offsetZ)
            wheelsMesh.rotation.set(0, Math.PI, 0)
            group.add(wheelsMesh)

            return group
        }
        return null
    }, [nodes, wheelGeometries])

    useFrame((state, delta) => {
        if (!rigidBodyRef.current) return

        const { forward, turn, active } = controls

        if (active) {
            // Acceleration (Impulse)
            const impulse = { x: 0, y: 0, z: 0 }
            const rotation = rigidBodyRef.current.rotation()
            const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)

            const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion)

            // Apply force based on forward input
            impulse.x = forwardDir.x * forward * acceleration * delta * 50
            impulse.z = forwardDir.z * forward * acceleration * delta * 50

            // Speed Limit Check
            const vel = rigidBodyRef.current.linvel()
            const currentSpeed = Math.sqrt(vel.x ** 2 + vel.z ** 2)
            if (currentSpeed < maxSpeed) {
                rigidBodyRef.current.applyImpulse(impulse, true)
            }

            // Turning (Torque)
            if (currentSpeed > 1) {
                const torque = { x: 0, y: -turn * turnSpeed * delta * 50, z: 0 }
                // Reverse turning when going backward for natural feel
                if (forward < 0) torque.y *= -1

                rigidBodyRef.current.applyTorqueImpulse(torque, true)
            }
        }
    })

    // Keyboard listener for exiting
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'b' || e.key === 'Escape') {
                if (rigidBodyRef.current) {
                    const pos = rigidBodyRef.current.translation()
                    exitCar({ x: pos.x, y: pos.y, z: pos.z })
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [exitCar, rigidBodyRef])

    if (!carMesh) return null

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={position}
            colliders={false} // Custom collider
            mass={500} // Heavy car
            linearDamping={drift} // Drift feel
            angularDamping={2.0} // Stable turning
            type="dynamic"
        >
            <CuboidCollider args={[1 * scale * 0.3, 0.5 * scale * 0.3, 2 * scale * 0.3]} position={[0, 0.5, 0]} />
            <primitive object={carMesh} scale={scale} castShadow receiveShadow />
        </RigidBody>
    )
}
