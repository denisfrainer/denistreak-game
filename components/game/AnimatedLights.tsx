import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export function AnimatedLights() {
    const directionalLightRef = useRef<THREE.DirectionalLight>(null)
    const colorRef = useRef(0)

    useFrame((state) => {
        if (!directionalLightRef.current) return

        // Animate position in circle (Neon signs moving effect)
        const time = state.clock.elapsedTime * 0.5
        directionalLightRef.current.position.x = Math.sin(time) * 10
        directionalLightRef.current.position.z = Math.cos(time) * 10

        // Animate color between Cyan and Magenta (Synthwave palette)
        colorRef.current = (Math.sin(time * 0.3) + 1) * 0.5 // 0 to 1
        const cyan = new THREE.Color(0x00ffff)
        const magenta = new THREE.Color(0xff00ff)
        directionalLightRef.current.color.lerpColors(cyan, magenta, colorRef.current)
    })

    return (
        <>
            {/* Main Directional Light - Animated Neon Pulse */}
            <directionalLight
                ref={directionalLightRef}
                intensity={1.5}
                position={[10, 10, 10]}
            />

            {/* Ambient Light - Subtle base illumination */}
            <ambientLight intensity={0.3} color="#4a4a6a" />

            {/* Accent Lights - Static Synthwave colors */}
            <pointLight position={[-5, 3, -5]} intensity={0.8} color="#ff0080" distance={20} />
            <pointLight position={[5, 3, 5]} intensity={0.8} color="#00ffff" distance={20} />
        </>
    )
}
