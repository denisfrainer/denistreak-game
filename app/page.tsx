'use client'

import { useEffect } from 'react'
import { useGameActions } from '@/store/gameStore'
import dynamic from 'next/dynamic'

// Dynamically import components that rely on browser APIs (window/document)
const Scene = dynamic(() => import('@/components/game/Scene').then(mod => mod.Scene), { ssr: false })
const HUD = dynamic(() => import('@/components/ui/HUD').then(mod => mod.HUD), { ssr: false })
const VirtualGamepad = dynamic(() => import('@/components/ui/VirtualGamepad').then(mod => mod.VirtualGamepad), { ssr: false })
const MobileControls = dynamic(() => import('@/components/game/MobileControls'), { ssr: false })

export default function Home() {
  const { tick } = useGameActions()

  // Rat Race Logic: Drain money every second
  useEffect(() => {
    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [tick])

  return (
    <main className="relative w-full h-screen overflow-hidden select-none touch-none">
      <Scene />
      <HUD />
      <VirtualGamepad />
      <MobileControls />
    </main>
  )
}
