'use client'

import React, { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'

export function DialogueSystem() {
    const interaction = useGameStore((state) => state.interaction)
    const [displayedText, setDisplayedText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (interaction?.type === 'dialogue') {
            setDisplayedText('')
            setCurrentIndex(0)
        }
    }, [interaction])

    useEffect(() => {
        if (interaction?.type === 'dialogue' && interaction.data.text) {
            if (currentIndex < interaction.data.text.length) {
                const timeout = setTimeout(() => {
                    setDisplayedText((prev) => prev + interaction.data.text[currentIndex])
                    setCurrentIndex((prev) => prev + 1)
                }, 30) // Typewriter speed
                return () => clearTimeout(timeout)
            }
        }
    }, [currentIndex, interaction])

    if (!interaction || interaction.type !== 'dialogue') return null

    return (
        <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-auto z-50 flex justify-center items-end pb-10">
            <div className="bg-black/80 border-2 border-white/20 backdrop-blur-md p-6 rounded-xl max-w-2xl w-full shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-yellow-400 uppercase tracking-wider">
                        {interaction.data.npcId.replace('_', ' ')}
                    </h3>
                    <button
                        onClick={interaction.data.onClose}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-white text-lg leading-relaxed font-mono min-h-[3rem]">
                    {displayedText}
                    <span className="animate-pulse">_</span>
                </p>

                <div className="mt-4 text-right">
                    <button
                        onClick={interaction.data.onClose}
                        className="text-xs text-white/50 hover:text-white uppercase tracking-widest hover:underline"
                    >
                        Press [Close] to leave
                    </button>
                </div>
            </div>
        </div>
    )
}
