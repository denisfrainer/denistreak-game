import { create } from 'zustand'

interface GameState {
    money: number
    xp: number
    fissura: number
    alignment: 'rat' | 'wolf'
    currentTask: string
    stamina: number
    maxStamina: number
    deliveryTarget: { x: number; z: number }
    isAtDeliverySpot: boolean
    settings: {
        lowPowerMode: boolean
    }
    actions: {
        performTask: () => void
        setDeliveryStatus: (isAtSpot: boolean) => void
        tick: () => void
        toggleLowPowerMode: () => void
    }
}

export const useGameStore = create<GameState>((set) => ({
    money: 100,
    xp: 50,
    fissura: 0,
    alignment: 'rat',
    currentTask: 'iFood R$7',
    stamina: 100,
    maxStamina: 100,
    deliveryTarget: { x: 10, z: 10 }, // Initial target
    isAtDeliverySpot: false,
    settings: {
        lowPowerMode: false,
    },
    actions: {
        performTask: () => {
            set((state) => {
                if (!state.isAtDeliverySpot) return {}

                // Resulting Logic:
                const guaranteedXp = 50
                const moneyEarned = 100

                // Generate new target far away (simple random for now)
                // Range: -40 to 40
                const newX = (Math.random() - 0.5) * 80
                const newZ = (Math.random() - 0.5) * 80

                return {
                    xp: state.xp + guaranteedXp,
                    money: state.money + moneyEarned,
                    deliveryTarget: { x: newX, z: newZ },
                    isAtDeliverySpot: false, // Reset status immediately
                }
            })
        },
        setDeliveryStatus: (isAtSpot: boolean) => {
            set({ isAtDeliverySpot: isAtSpot })
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
