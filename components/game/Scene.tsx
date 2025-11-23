'use client'

import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Player } from './Player'
import { ChaseCamera } from './ChaseCamera'
import { useRef } from 'react'
import { RapierRigidBody } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'
import { Stars, Grid, Stats, Environment } from '@react-three/drei'
import { DancingNPC } from './DancingNPC'
import { AnimatedLights } from './AnimatedLights'

export function Scene() {
    const playerRef = useRef<RapierRigidBody>(null)
    const lowPowerMode = useGameStore((state) => state.settings.lowPowerMode)

    return (
        <div className="h-screen w-full bg-black">
            <Canvas shadows>
                {/* FPS Counter */}
                <group position={[0, -1.5, 0]}>
                    <Stats />
                </group>

                {/* Atmosphere */}
                <color attach="background" args={['#000000']} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Environment Map - City preset for reflections */}
                <Environment preset="city" environmentIntensity={0.5} />

                {/* Synthwave Animated Lighting */}
                <AnimatedLights />

                {/* Infinite Floor Grid */}
                <Grid
                    position={[0, -0.01, 0]}
                    args={[100, 100]}
                    cellSize={2}
                    cellThickness={1}
                    cellColor="#1a1a1a"
                    sectionSize={10}
                    sectionThickness={1.5}
                    sectionColor="#00d4ff"
                    fadeDistance={50}
                    infiniteGrid
                />

                <Physics debug={false}>
                    {/* Floor Collider */}
                    <RigidBody type="fixed" colliders={false} position={[0, -1, 0]}>
                        <CuboidCollider args={[1000, 1, 1000]} />
                    </RigidBody>

                    <Player rigidBodyRef={playerRef} />

                    {/* Camera */}
                    <ChaseCamera playerRef={playerRef} />

                    {/* NPC 1 - Pickup */}
                    <DancingNPC position={[-20, 0, -20]} />

                    {/* NPC 2 - Delivery */}
                    <group position={[30, 0, 30]}>
                        <pointLight position={[0, 3, 0]} distance={10} intensity={5} color="#00ff00" />
                        <mesh position={[0, 1.5, 0]}>
                            <boxGeometry args={[2, 3, 2]} />
                            <meshBasicMaterial color="#00ff00" wireframe />
                        </mesh>
                    </group>
                </Physics>
            </Canvas>
        </div>
    )
}
