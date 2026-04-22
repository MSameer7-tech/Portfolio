"use client"

import { useEffect, useRef } from "react"

export default function CursorLight() {
    const lightRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const el = lightRef.current
        if (!el) return

        let mouseX = 0
        let mouseY = 0
        let currentX = 0
        let currentY = 0
        let animId = 0

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX
            mouseY = e.clientY
        }

        // Smooth interpolation for fluid movement
        const animate = () => {
            currentX += (mouseX - currentX) * 0.08
            currentY += (mouseY - currentY) * 0.08

            el.style.background = `radial-gradient(600px circle at ${currentX}px ${currentY}px, rgba(255,255,255,0.04), transparent 40%)`

            animId = requestAnimationFrame(animate)
        }

        window.addEventListener("mousemove", handleMouseMove)
        animId = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            cancelAnimationFrame(animId)
        }
    }, [])

    return (
        <div
            id="cursor-light"
            ref={lightRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 5 }}
        />
    )
}
