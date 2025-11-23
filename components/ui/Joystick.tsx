'use client'

import { useEffect, useRef, useState } from 'react'
import nipplejs from 'nipplejs'
import { useControlsStore } from '@/store/controlsStore'

export function Joystick() {
    const joystickRef = useRef<HTMLDivElement>(null)
    const setMovement = useControlsStore((state) => state.setMovement)

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
                // Invert Y because screen Y is down, but 3D world Z is "down/up" depending on camera
                // Usually for top-down: Up (Screen -Y) -> -Z (World Forward)
                // But let's just pass raw vector and adjust in Player
                setMovement(data.vector.x, data.vector.y)
            }
        })

        manager.on('end', () => {
            setMovement(0, 0)
        })

        return () => {
            manager.destroy()
        }
    }, [setMovement])

    return (
        <div
            ref={joystickRef}
            className="absolute bottom-10 left-10 w-32 h-32 z-50 touch-none"
        />
    )
}
