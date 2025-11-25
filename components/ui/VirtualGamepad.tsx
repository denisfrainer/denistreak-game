'use client'

import { useGameActions, useGameStore } from '@/store/gameStore'

export function VirtualGamepad() {
    const { performTask, toggleCharacter } = useGameActions()
    const isAtDeliverySpot = useGameStore((state) => state.isAtDeliverySpot)
    const interactionTarget = useGameStore((state) => state.interactionTarget)

    // Contextual Button A Logic
    const getButtonAConfig = () => {
        if (interactionTarget) {
            if (interactionTarget.type === 'npc') {
                return {
                    label: '💬',
                    subLabel: 'TROVAR',
                    color: 'bg-green-500',
                    borderColor: 'border-green-300',
                    shadowColor: 'shadow-[0_4px_0_rgb(21,128,61)]',
                    action: interactionTarget.onInteract,
                    pulse: true
                }
            }
            if (interactionTarget.type === 'car') {
                return {
                    label: '🚗',
                    subLabel: 'DIRIGIR',
                    color: 'bg-orange-500',
                    borderColor: 'border-orange-300',
                    shadowColor: 'shadow-[0_4px_0_rgb(194,65,12)]',
                    action: interactionTarget.onInteract,
                    pulse: true
                }
            }
        }

        // Default Action (Jump/Perform Task)
        return {
            label: 'A',
            subLabel: null,
            color: isAtDeliverySpot ? 'bg-green-500' : 'bg-green-600',
            borderColor: 'border-green-300',
            shadowColor: 'shadow-[0_4px_0_rgb(21,128,61)]',
            action: performTask,
            pulse: isAtDeliverySpot
        }
    }

    const btnA = getButtonAConfig()

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

                {/* Button A (Right) - Contextual */}
                <button
                    className={`
                        absolute top-1/2 -translate-y-1/2 right-0 w-14 h-14 rounded-full active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center border-2
                        ${btnA.color} ${btnA.borderColor} ${btnA.shadowColor}
                        ${btnA.pulse ? 'animate-pulse' : ''}
                    `}
                    onClick={btnA.action}
                >
                    <span className="text-white font-bold text-lg leading-none">{btnA.label}</span>
                    {btnA.subLabel && (
                        <span className="text-[8px] text-white font-bold uppercase leading-none mt-1">{btnA.subLabel}</span>
                    )}
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
