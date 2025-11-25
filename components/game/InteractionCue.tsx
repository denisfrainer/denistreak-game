'use client'

import { Html } from '@react-three/drei'

interface InteractionCueProps {
    visible: boolean
    label?: string
    height?: number
}

export function InteractionCue({ visible, label = 'TROVAR', height = 6.0 }: InteractionCueProps) {
    if (!visible) return null

    return (
        <Html position={[0, height, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
            <div className="flex flex-col items-center animate-bounce pointer-events-none select-none">
                <div className="text-green-400 text-6xl drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]">
                    ▼
                </div>
                <div className="bg-black/50 text-green-400 px-4 py-2 rounded text-xl font-bold font-['Press_Start_2P'] border border-green-400/50 backdrop-blur-sm mt-1 whitespace-nowrap">
                    {label}
                </div>
            </div>
        </Html>
    )
}
