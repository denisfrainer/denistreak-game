'use client'

import { useGameStore, useGameActions } from '@/store/gameStore'
import { useState } from 'react'
import Image from 'next/image'

export function HUD() {
    const { money, xp, fissura, character, completedTasks } = useGameStore()
    const { toggleCharacter } = useGameActions()
    const [showTaskDropdown, setShowTaskDropdown] = useState(false)

    const allTasks = [
        'iFood (R$ 7)',
        'Prospectar Cliente',
        'Treinar Lobos'
    ]

    const completedCount = Array.from(completedTasks).filter(t => allTasks.includes(t)).length

    const getCharacterInfo = () => {
        switch (character) {
            case 'girl': return { icon: '/guria.png', name: 'Guria' }
            case 'soldier': return { icon: '/rat.png', name: 'Rato' }
            case 'wolf': return { icon: '/wolf.png', name: 'Lobo' }
            case 'businessman': return { icon: '/alpha.png', name: 'Alfa' }
            default: return { icon: '/rat.png', name: 'Rato' }
        }
    }

    const charInfo = getCharacterInfo()

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 font-[family-name:var(--font-press-start-2p)]">
            <div className="absolute top-16 left-3 flex items-start gap-2">
                <div className="flex flex-col items-center gap-1">
                    <button onClick={toggleCharacter} className="pointer-events-auto w-12 h-12 bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] border-2 border-white/80 rounded-sm flex items-center justify-center shadow-lg hover:border-cyan-400 hover:scale-105 transition-all cursor-pointer overflow-hidden p-1">
                        <Image src={charInfo.icon} alt={charInfo.name} width={40} height={40} className="w-full h-full object-contain" />
                    </button>
                    <span className="text-[7px] text-white font-bold">{charInfo.name}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] px-2 py-1 rounded-sm border border-white/80 text-white shadow-md min-w-[120px]">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[7px] text-zinc-300 uppercase font-bold">Suco</span>
                            <span className="text-[9px] font-bold text-green-400">R$ {money.toFixed(0)}</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-600">
                            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500" style={{ width: `${Math.min(100, money)}%` }} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] px-2 py-1 rounded-sm border border-white/80 text-white shadow-md min-w-[120px]">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[7px] text-zinc-300 uppercase font-bold">Fissura</span>
                            <span className="text-[9px] font-bold text-red-400">{fissura}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-600">
                            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500" style={{ width: `${fissura}%` }} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] px-2 py-1 rounded-sm border border-white/80 text-white shadow-md min-w-[120px]">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[7px] text-zinc-300 uppercase font-bold">XP</span>
                            <span className="text-[9px] font-bold text-blue-400">{xp}</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-600">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500" style={{ width: `${(xp % 100)}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4">
                <div className="relative pointer-events-auto">
                    <button onClick={() => setShowTaskDropdown(!showTaskDropdown)} className="bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] border-2 border-white/80 px-3 py-1.5 rounded-sm text-white shadow-lg hover:border-cyan-400 transition-all">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-yellow-200 uppercase font-bold">Tarefas Mundanas</span>
                            <span className="text-[9px] text-pink-400 font-bold">[ {completedCount} / 3 ]</span>
                        </div>
                    </button>

                    {showTaskDropdown && (
                        <div className="absolute top-full right-0 mt-1 bg-gradient-to-b from-[#1a1a40]/95 to-[#0d0d20]/95 border border-white/80 rounded-sm min-w-[200px] shadow-xl">
                            {allTasks.map((task) => {
                                const isCompleted = completedTasks.has(task)
                                return (
                                    <div key={task} className={`px-3 py-1.5 text-[8px] border-b border-white/20 ${isCompleted ? 'text-green-400' : 'text-yellow-200'}`}>
                                        <span className="mr-1">{isCompleted ? '[✓]' : '[ ]'}</span>
                                        {task}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
