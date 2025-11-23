import { create } from 'zustand'

interface GameState {
    money: number
    xp: number
    settings: {
        lowPowerMode: boolean
    }
    actions: {
        performTask: () => void
        tick: () => void
        toggleLowPowerMode: () => void
    }
}

export const useGameStore = create<GameState>((set) => ({
    money: 100, // Starting money (Suco)
    xp: 0,
    settings: {
        lowPowerMode: false,
    },
    actions: {
        performTask: () => {
            set((state) => {
                // Resulting Logic:
                // Process (XP) is guaranteed.
                // Result (Money) is RNG-based.

                const guaranteedXp = 10
                const successChance = 0.7 // 70% chance to make money
                const moneyEarned = Math.random() < successChance ? Math.floor(Math.random() * 50) + 10 : 0

                return {
                    xp: state.xp + guaranteedXp,
                    money: state.money + moneyEarned,
                }
            })
        },
        tick: () => {
            set((state) => ({
                // Rat Race Logic: Constant drain
                money: Math.max(0, state.money - 1),
            }))
        },
        toggleLowPowerMode: () => {
            set((state) => ({
                settings: {
                    ...state.settings,
                    lowPowerMode: !state.settings.lowPowerMode,
                },
            }))
        },
    },
}))

export const useGameActions = () => useGameStore((state) => state.actions)
