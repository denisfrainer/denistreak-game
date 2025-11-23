import { create } from 'zustand'

interface ControlsState {
    movement: { x: number; y: number }
    setMovement: (x: number, y: number) => void
}

export const useControlsStore = create<ControlsState>((set) => ({
    movement: { x: 0, y: 0 },
    setMovement: (x, y) => set({ movement: { x, y } }),
}))
