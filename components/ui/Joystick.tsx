'use client'

import { useEffect, useRef } from 'react'
import nipplejs from 'nipplejs'
import { useGameStore } from '@/store/gameStore'

export function Joystick() {
    const joystickRef = useRef<HTMLDivElement>(null)
    const setJoystick = useGameStore((state) => state.setJoystick)

    useEffect(() => {
        if (!joystickRef.current) return

        const manager = nipplejs.create({
            zone: joystickRef.current,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 100,
        })

        manager.on('move', (_, data) => {
            if (data.vector) {
                const forward = data.vector.y
                const turn = -data.vector.x
                setJoystick({ forward, turn, active: true })
            }
        })

        manager.on('end', () => {
            setJoystick({ forward: 0, turn: 0, active: false })
        })

        return () => {
            manager.destroy()
        }
    }, [setJoystick])

    return (
        <div
            ref={joystickRef}
            className="absolute bottom-10 left-10 w-32 h-32 z-50 touch-none pointer-events-auto"
            style={{ touchAction: 'none' }}
        />
    )
}
