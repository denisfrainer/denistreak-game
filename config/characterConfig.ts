export const CHARACTER_DATA = {
    girl: {
        model: '/girlanimated.glb',
        scale: 1.0,
        animations: {
            IDLE: 'Idle',
            WALK: 'Walking',
            RUN: 'Walking', // Reusing Walk for Run
            ACTION: 'Interact' // Placeholder
        },
        physics: { speed: 0.6 }
    },
    soldier: {
        model: '/soldier.glb',
        scale: 1.1,
        animations: {
            IDLE: 'rig|idle -loop',
            WALK: 'rig|walk -loop',
            RUN: 'rig|run -loop',
            ACTION: 'Interact'
        },
        physics: { speed: 0.6 }
    },
    wolf: {
        model: '/wolf.glb',
        scale: 1.43,
        animations: {
            IDLE: 'idle',
            WALK: 'idle2', // Wolf walk is idle2? Based on previous code
            RUN: 'running',
            ACTION: 'Interact'
        },
        physics: { speed: 0.8 } // Faster
    },
    businessman: {
        model: '/businessman.glb',
        scale: 0.8,
        animations: {
            IDLE: 'Rig|idle',
            WALK: 'Rig|walk',
            RUN: 'Rig|run',
            ACTION: 'Rig|cycle_talking' // From user request example
        },
        physics: { speed: 0.6 }
    }
} as const;

export type CharacterType = keyof typeof CHARACTER_DATA;
