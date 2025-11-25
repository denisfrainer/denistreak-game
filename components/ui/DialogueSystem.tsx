'use client'

import React, { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'

export function DialogueSystem() {
    const interaction = useGameStore((state) => state.interaction)
    const setInteraction = useGameStore((state) => state.setInteraction)
    const [displayedText, setDisplayedText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (interaction?.type === 'dialogue') {
            setDisplayedText('')
            setCurrentIndex(0)
            setLoading(false)
        }
    }, [interaction?.data.text]) // Reset when text changes

    useEffect(() => {
        if (interaction?.type === 'dialogue' && interaction.data.text && !loading) {
            if (currentIndex < interaction.data.text.length) {
                const timeout = setTimeout(() => {
                    setDisplayedText((prev) => prev + interaction.data.text[currentIndex])
                    setCurrentIndex((prev) => prev + 1)
                }, 3) // Typewriter speed (3ms)
                return () => clearTimeout(timeout)
            }
        }
    }, [currentIndex, interaction, loading])

    const handleOptionClick = async (option: string) => {
        if (!interaction || interaction.type !== 'dialogue') return

        setLoading(true)
        setDisplayedText('...')

        // Extract the actual text from the option (remove type description if any)
        // e.g. "Tá na mão (Vender)" -> "Tá na mão"
        // But the prompt says "message: opcaoEscolhida", so we send the full string or just the text?
        // The user prompt says: "Eu clico em 'Tá na mão'. O NPC responde..."
        // Let's send the full option string as it contains context for the AI

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerStatus: useGameStore.getState().character === 'wolf' ? 'Wolf' : 'Rat',
                    npcId: interaction.data.npcId,
                    message: option,
                    previousContext: {
                        npcReply: interaction.data.text
                    }
                })
            })

            const data = await response.json()

            if (data.reply) {
                setInteraction({
                    type: 'dialogue',
                    data: {
                        ...interaction.data,
                        text: data.reply,
                        options: data.options
                    }
                })
            }
        } catch (error) {
            console.error('Failed to fetch reply:', error)
            setDisplayedText('Erro de conexão...')
        } finally {
            setLoading(false)
        }
    }

    if (!interaction || interaction.type !== 'dialogue') return null

    return (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl pointer-events-auto z-50 flex justify-center items-start">
            <div className="bg-gradient-to-b from-blue-900/90 to-blue-950/90 border-2 border-white rounded-md p-4 w-full shadow-2xl animate-in slide-in-from-top-5 fade-in duration-300 max-h-[60vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-start mb-2 border-b-2 border-white/20 pb-2">
                    <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider font-['Press_Start_2P']">
                        {interaction.data.npcId.replace('_', ' ')}
                    </h3>
                    <button
                        onClick={interaction.data.onClose}
                        className="text-white/50 hover:text-white transition-colors p-1"
                    >
                        <span className="text-xs">✕</span>
                    </button>
                </div>

                <p className="text-white text-[10px] leading-relaxed font-['Press_Start_2P'] min-h-[2rem] mb-4">
                    {displayedText}
                    {!loading && currentIndex < interaction.data.text.length && (
                        <span className="animate-pulse">_</span>
                    )}
                </p>

                {/* Options Buttons */}
                {!loading && currentIndex >= interaction.data.text.length && interaction.data.options && (
                    <div className="flex flex-col gap-2 mt-2">
                        {interaction.data.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(option)}
                                className="w-full text-left px-3 py-2 bg-black/40 border border-cyan-500/50 text-cyan-400 text-[10px] font-['Press_Start_2P'] hover:bg-cyan-900/30 hover:border-cyan-400 hover:text-cyan-300 transition-all duration-200 group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center">
                                    <span className="mr-2 text-cyan-600 group-hover:text-cyan-400">►</span>
                                    {option}
                                </span>
                                <div className="absolute inset-0 bg-cyan-400/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-4 text-right">
                    <button
                        onClick={interaction.data.onClose}
                        className="text-[8px] text-white/50 hover:text-white uppercase tracking-widest hover:underline font-['Press_Start_2P']"
                    >
                        [CLOSE]
                    </button>
                </div>
            </div>
        </div>
    )
}
