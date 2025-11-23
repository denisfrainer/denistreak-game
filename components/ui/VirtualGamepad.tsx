'use client'

import { useGameActions, useGameStore } from '@/store/gameStore'

export function VirtualGamepad() {
    const { performTask, toggleCharacter } = useGameActions()
    const isAtDeliverySpot = useGameStore((state) => state.isAtDeliverySpot)

    return (
        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 pointer-events-auto z-50 select-none touch-none">

            {/* Button Group - PS1/N64 Triangular Layout - Slightly More Spaced */}
            <div className="relative w-40 h-40">

                {/* Button X (Top) - Blue */}
                <button
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-blue-500 rounded-full shadow-[0_4px_0_rgb(29,78,216)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center border-2 border-blue-300"
                    onClick={toggleCharacter}
                >
                    <span className="text-white font-bold text-lg">X</span>
                </button>

                {/* Button B (Left) - Red */}
                <button
                    className="absolute top-1/2 -translate-y-1/2 left-0 w-14 h-14 bg-red-500 rounded-full shadow-[0_4px_0_rgb(185,28,28)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center border-2 border-red-300"
                    onClick={() => console.log('Jump/Cancel')}
                >
                    <span className="text-white font-bold text-lg">B</span>
                </button>

                {/* Button A (Right) - Green */}
                <button
                    className={`
                        absolute top-1/2 -translate-y-1/2 right-0 w-14 h-14 rounded-full shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center border-2 border-green-300
                        ${isAtDeliverySpot ? 'bg-green-500 animate-pulse' : 'bg-green-600'}
                    `}
                    onClick={performTask}
                >
                    <span className="text-white font-bold text-lg">A</span>
                </button>

                {/* Button Y (Bottom) - Yellow */}
                <button
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-yellow-500 rounded-full shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center border-2 border-yellow-300"
                    onClick={() => console.log('Menu/Map')}
                >
                    <span className="text-white font-bold text-lg">Y</span>
                </button>

            </div>
        </div>
    )
}
