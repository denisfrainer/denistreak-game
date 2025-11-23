'use client'

import { useGameStore, useGameActions } from '@/store/gameStore'

export function HUD() {
    const { money, xp, fissura, alignment, currentTask, isAtDeliverySpot } = useGameStore()
    const { performTask } = useGameActions()

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 font-[family-name:var(--font-press-start-2p)]">

            {/* Header Container */}
            <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start">

                {/* LEFT: Status Group (Compact) */}
                <div className="flex items-start gap-2">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] border-2 border-white/80 rounded-sm flex items-center justify-center shadow-lg shrink-0">
                        <span className="text-2xl filter drop-shadow-md">
                            {alignment === 'rat' ? '🐭' : '🐺'}
                        </span>
                    </div>

                    {/* Bars Stack */}
                    <div className="flex flex-col gap-1">
                        {/* Money (Suco) */}
                        <div className="bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] px-2 py-1 rounded-sm border border-white/60 text-white shadow-md min-w-[100px]">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[8px] text-zinc-300 uppercase font-bold">Suco</span>
                                <span className={`text-[8px] font-bold ${money === 0 ? 'text-red-400' : 'text-green-400'}`}>${money.toFixed(0)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-600">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, money)}%` }}
                                />
                            </div>
                        </div>

                        {/* Fissura */}
                        <div className="bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] px-2 py-1 rounded-sm border border-white/60 text-white shadow-md min-w-[100px]">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[8px] text-zinc-300 uppercase font-bold">Fissura</span>
                                <span className="text-[8px] font-bold text-purple-400">{fissura}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-600">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-500"
                                    style={{ width: `${fissura}%` }}
                                />
                            </div>
                        </div>

                        {/* XP */}
                        <div className="bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] px-2 py-1 rounded-sm border border-white/60 text-white shadow-md min-w-[100px]">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[8px] text-zinc-300 uppercase font-bold">XP</span>
                                <span className="text-[8px] font-bold text-blue-400">{xp}</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-600">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, xp % 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Quest Tracker (Compact) */}
                <div className="bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] p-2 rounded-sm border-2 border-white/80 text-white shadow-lg max-w-[150px]">
                    <div className="text-[8px] text-zinc-400 uppercase tracking-widest font-bold mb-1 border-b border-white/20 pb-0.5">Tarefa Mundana</div>
                    <div className="flex items-start gap-1 text-[10px] font-bold text-yellow-200 drop-shadow-md leading-tight">
                        <span>[ ]</span>
                        <span className="break-words">{currentTask}</span>
                    </div>
                </div>
            </div>

            {/* BOTTOM RIGHT: Action Cluster */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-4 pointer-events-auto items-end">

                {/* Secondary Button (Phone) */}
                <button className="bg-gradient-to-b from-[#1a1a40] to-[#0d0d20] hover:from-[#2a2a60] hover:to-[#1a1a40] active:scale-95 transition-all text-white border-2 border-white/80 rounded-sm p-2 shadow-lg">
                    <span className="text-lg">📱</span>
                </button>

                {/* Main Context Button */}
                <button
                    onClick={performTask}
                    disabled={!isAtDeliverySpot}
                    className={`
                        transition-all font-bold py-4 px-6 rounded-sm border-2 shadow-xl text-xs tracking-wider uppercase drop-shadow-md min-w-[120px] flex flex-col items-center gap-1
                        ${isAtDeliverySpot
                            ? 'bg-gradient-to-b from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 border-white text-white active:scale-95 cursor-pointer animate-pulse'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-500 cursor-not-allowed'}
                    `}
                >
                    <span className="text-sm">{isAtDeliverySpot ? 'WORK' : 'WAIT'}</span>
                    {isAtDeliverySpot && <span className="text-[6px] text-blue-200">Click to Complete</span>}
                </button>
            </div>
        </div>
    )
}
