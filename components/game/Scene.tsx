'use client'

import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Player } from './Player'
import { useGameStore } from '@/store/gameStore'

export function Scene() {
    const lowPowerMode = useGameStore((state) => state.settings.lowPowerMode)

    return (
        <div className="h-screen w-full bg-zinc-900">
            <Canvas
                dpr={[1, 2]} // Strict DPR for mobile performance
                shadows={!lowPowerMode}
                camera={{ position: [10, 10, 10], fov: 50, zoom: 1 }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow={!lowPowerMode}
                />

                <Physics>
                    <group>
                        {/* Floor */}
                        <RigidBody type="fixed" friction={1}>
                            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                                <planeGeometry args={[100, 100]} />
                                <meshStandardMaterial color="#333" />
                            </mesh>
                        </RigidBody>

                        {/* Player */}
                        <Player />
                    </group>
                </Physics>
            </Canvas>
        </div>
    )
}
