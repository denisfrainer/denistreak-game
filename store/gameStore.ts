import { create } from 'zustand'

interface GameState {
    money: number
    xp: number
    fissura: number
    alignment: 'rat' | 'wolf'
    character: 'girl' | 'soldier' | 'wolf' | 'businessman'
    currentTask: string
    stamina: number
    maxStamina: number
    deliveryTarget: { x: number; z: number }
    isAtDeliverySpot: boolean
    hasFood: boolean
    completedTasks: Set<string>
    controls: {
        forward: number
        turn: number
        active: boolean
    }
    settings: {
        lowPowerMode: boolean
    }
    actions: {
        performTask: () => void
        setDeliveryStatus: (isAtSpot: boolean) => void
        tick: () => void
        toggleLowPowerMode: () => void
        toggleCharacter: () => void
        collectFood: () => void
        deliverFood: () => void
        completeTask: (taskName: string) => void
    }
    setJoystick: (data: { forward: number; turn: number; active: boolean }) => void
    interaction: {
        type: 'dialogue'
        data: {
            npcId: string
            text: string
            options?: string[]
            onReply?: (msg: string) => void
            onClose: () => void
        }
    } | null
    interactionTarget: {
        type: 'npc' | 'car'
        id?: string
        label?: string
        onInteract?: () => void
    } | null
    playerPosition: { x: number; y: number; z: number } | null
    setInteraction: (interaction: GameState['interaction']) => void
    setInteractionTarget: (target: GameState['interactionTarget']) => void
    clearInteraction: () => void
    setPlayerPosition: (pos: { x: number; y: number; z: number }) => void
    isDriving: boolean
    carPosition: { x: number; y: number; z: number }
    actions: {
        // ... existing actions
        performTask: () => void
        setDeliveryStatus: (isAtSpot: boolean) => void
        tick: () => void
        toggleLowPowerMode: () => void
        toggleCharacter: () => void
        collectFood: () => void
        deliverFood: () => void
        completeTask: (taskName: string) => void
        enterCar: () => void
        exitCar: (pos: { x: number; y: number; z: number }) => void
    }
}

// NPC Positions
const NPC1_PICKUP = { x: -20, z: -20 }
const NPC2_DELIVERY = { x: 30, z: 30 }

export const useGameStore = create<GameState>((set) => ({
    money: 100,
    xp: 50,
    fissura: 0,
    alignment: 'rat',
    character: 'girl',
    currentTask: 'Coletar iFood no NPC 1',
    stamina: 100,
    maxStamina: 100,
    deliveryTarget: NPC1_PICKUP,
    isAtDeliverySpot: false,
    hasFood: false,
    completedTasks: new Set(),
    isDriving: false,
    carPosition: { x: 0, y: 0.5, z: 10 }, // Moved closer to spawn for easier testing
    controls: {
        forward: 0,
        turn: 0,
        active: false,
    },
    settings: {
        lowPowerMode: false,
    },
    setJoystick: (data) => set((state) => ({
        controls: { ...state.controls, ...data }
    })),
    interaction: null,
    interactionTarget: null,
    playerPosition: null,
    setInteraction: (interaction) => set({ interaction }),
    setInteractionTarget: (target) => set({ interactionTarget: target }),
    clearInteraction: () => set({ interaction: null }),
    setPlayerPosition: (pos) => set({ playerPosition: pos }),
    actions: {
        completeTask: (taskName: string) => {
            set((state) => ({
                completedTasks: new Set([...state.completedTasks, taskName])
            }))
        },
        collectFood: () => {
            set((state) => ({
                hasFood: true,
                deliveryTarget: NPC2_DELIVERY,
                currentTask: 'Entregar para o Cliente',
            }))
        },
        deliverFood: () => {
            set((state) => {
                const newCompleted = new Set(state.completedTasks)
                newCompleted.add('iFood (R$ 7)')

                return {
                    hasFood: false,
                    deliveryTarget: NPC1_PICKUP,
                    currentTask: 'Coletar iFood no NPC 1',
                    money: state.money + 100,
                    xp: state.xp + 50,
                    completedTasks: newCompleted,
                }
            })
        },
        performTask: () => {
            set((state) => {
                if (!state.isAtDeliverySpot) return {}

                const guaranteedXp = 50
                const moneyEarned = 100

                const newX = (Math.random() - 0.5) * 80
                const newZ = (Math.random() - 0.5) * 80

                const missions = [
                    'iFood (R$ 7)',
                    'Prospectar Cliente (R$ 50)',
                    'Treinar Lobos (Team Building)',
                    'Trovar / Socializar (Networking)'
                ]
                const randomMission = missions[Math.floor(Math.random() * missions.length)]

                return {
                    xp: state.xp + guaranteedXp,
                    money: state.money + moneyEarned,
                    deliveryTarget: { x: newX, z: newZ },
                    currentTask: randomMission,
                    isAtDeliverySpot: false,
                }
            })
        },
        setDeliveryStatus: (isAtSpot: boolean) => {
            set({ isAtDeliverySpot: isAtSpot })
        },
        tick: () => {
            set((state) => ({
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
        toggleCharacter: () => {
            set((state) => {
                const chars: Array<'girl' | 'soldier' | 'wolf' | 'businessman'> = ['girl', 'soldier', 'wolf', 'businessman']
                const currentIndex = chars.indexOf(state.character)
                const nextIndex = (currentIndex + 1) % chars.length
                return {
                    character: chars[nextIndex],
                }
            })
        },
        enterCar: () => {
            set({ isDriving: true, interaction: null, interactionTarget: null })
        },
        exitCar: (pos: { x: number; y: number; z: number }) => {
            set((state) => ({
                isDriving: false,
                carPosition: pos,
                playerPosition: { x: pos.x + 2, y: pos.y, z: pos.z }, // Exit slightly to the side
            }))
        },
    },
}))

export const useGameActions = () => useGameStore((state) => state.actions)
