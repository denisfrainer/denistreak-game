'use client'

import { useGameStore, useGameActions } from '@/store/gameStore'

export function HUD() {
    const { money, xp } = useGameStore()
    const { performTask } = useGameActions()

    return (
        <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start z-50">
            {/* Stats */}
            <div className="flex flex-col gap-2">
                <div className="bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white">
                    <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Suco (Money)</div>
                    <div className={`text-2xl font-mono font-bold ${money === 0 ? 'text-red-500' : 'text-green-400'}`}>
                        ${money.toFixed(0)}
                    </div>
                </div>

                <div className="bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white">
                    <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Experience</div>
                    <div className="text-2xl font-mono font-bold text-blue-400">
                        {xp} XP
                    </div>
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={performTask}
                className="pointer-events-auto bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-900/20"
            >
                WORK / HUSTLE
            </button>
        </div>
    )
}
