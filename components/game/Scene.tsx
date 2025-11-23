'use client'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Player } from './Player'
import { ChaseCamera } from './ChaseCamera'
import { useRef } from 'react'
import { RapierRigidBody } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'
import { Stars, OrthographicCamera, Environment, Sky } from '@react-three/drei'
import { ProceduralCity } from './ProceduralCity'
import { DestructibleProps } from './DestructibleProps'

export function Scene() {
    const playerRef = useRef<RapierRigidBody>(null)
    const lowPowerMode = useGameStore((state) => state.settings.lowPowerMode)

    return (
        <div className="h-screen w-full">
            <Canvas shadows camera={{ position: [0, 15, 10], fov: 50 }}>
                <Sky sunPosition={[100, 20, 100]} />

                <hemisphereLight intensity={0.5} groundColor="#444" color="#fff" />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.5}
                    castShadow={!lowPowerMode}
                    shadow-mapSize={[2048, 2048]}
                />
                <Environment preset="city" />

                <Physics debug={false}>
                    <Player rigidBodyRef={playerRef} />

                    {/* Camera following the player */}
                    <ChaseCamera playerRef={playerRef} />

                    {/* New Whitebox Environment */}
                    <ProceduralCity />
                    <DestructibleProps />
                </Physics>
            </Canvas>
        </div>
    )
}
