"use client"

import { useEffect, useRef } from "react"

export default function StarBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let width = window.innerWidth
        let height = window.innerHeight
        let animId: number
        let mouseX = width / 2
        let mouseY = height / 2
        let time = 0

        canvas.width = width
        canvas.height = height

        // ── Star types ──────────────────────────────────────────────────
        interface Star {
            x: number; y: number; radius: number
            baseOpacity: number; opacity: number
            speed: number; parallax: number
            twinkleSpeed: number; twinklePhase: number
        }

        function createStars(count: number, radiusMin: number, radiusMax: number, speed: number, parallax: number): Star[] {
            return Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * (radiusMax - radiusMin) + radiusMin,
                baseOpacity: Math.random() * 0.5 + 0.3,
                opacity: 0,
                speed,
                parallax,
                twinkleSpeed: Math.random() * 0.003 + 0.001,
                twinklePhase: Math.random() * Math.PI * 2,
            }))
        }

        const farStars = createStars(70, 0.3, 0.7, 0.01, 0.5)
        const midStars = createStars(40, 0.8, 1.2, 0.03, 1.5)
        const nearStars = createStars(20, 1.2, 1.6, 0.06, 3.0)
        const allLayers = [farStars, midStars, nearStars]

        // ── Shooting stars ──────────────────────────────────────────────
        interface ShootingStar {
            x: number; y: number
            len: number; speed: number
            opacity: number; fade: number
            angle: number
        }

        const shootingStars: ShootingStar[] = []
        const MAX_SHOOTING = 1

        function spawnShootingStar() {
            if (shootingStars.length >= MAX_SHOOTING) return
            const angle = Math.PI / 4 + (Math.random() * 0.3 - 0.15)
            shootingStars.push({
                x: Math.random() * width * 0.8,
                y: Math.random() * height * 0.3,
                len: Math.random() * 80 + 40,
                speed: Math.random() * 8 + 6,
                opacity: 1,
                fade: 0.012 + Math.random() * 0.008,
                angle,
            })
        }

        // ── Draw helpers ────────────────────────────────────────────────
        function drawStarLayer(stars: Star[]) {
            const cx = (mouseX - width / 2) / width
            const cy = (mouseY - height / 2) / height

            for (const s of stars) {
                // drift
                s.y += s.speed
                if (s.y > height + 5) { s.y = -5; s.x = Math.random() * width }

                // twinkle
                s.opacity = Math.max(0.05, Math.min(1,
                    s.baseOpacity + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.15))

                // parallax offset
                const px = s.x + cx * s.parallax * 15
                const py = s.y + cy * s.parallax * 15

                ctx!.beginPath()
                ctx!.arc(px, py, s.radius, 0, Math.PI * 2)
                ctx!.fillStyle = `rgba(255,255,255,${s.opacity})`
                ctx!.fill()
            }
        }

        function drawShootingStars() {
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const ss = shootingStars[i]
                ss.x += Math.cos(ss.angle) * ss.speed
                ss.y += Math.sin(ss.angle) * ss.speed
                ss.opacity -= ss.fade

                if (ss.opacity <= 0 || ss.x > width + 120 || ss.y > height + 120) {
                    shootingStars.splice(i, 1)
                    continue
                }

                const tx = ss.x - Math.cos(ss.angle) * ss.len
                const ty = ss.y - Math.sin(ss.angle) * ss.len
                const grad = ctx!.createLinearGradient(ss.x, ss.y, tx, ty)
                grad.addColorStop(0, `rgba(255,255,255,${ss.opacity})`)
                grad.addColorStop(1, "rgba(255,255,255,0)")

                ctx!.beginPath()
                ctx!.moveTo(ss.x, ss.y)
                ctx!.lineTo(tx, ty)
                ctx!.strokeStyle = grad
                ctx!.lineWidth = 1
                ctx!.stroke()

                // bright head
                ctx!.beginPath()
                ctx!.arc(ss.x, ss.y, 2, 0, Math.PI * 2)
                ctx!.fillStyle = `rgba(255,255,255,${ss.opacity * 0.6})`
                ctx!.fill()
            }
        }

        function drawNebulaGlow() {
            const gx = width * 0.7, gy = height * 0.4, gr = width * 0.7
            const gradient = ctx!.createRadialGradient(gx, gy, 0, gx, gy, gr)
            gradient.addColorStop(0, "rgba(255,255,255,0.035)")
            gradient.addColorStop(1, "rgba(0,0,0,0)")
            ctx!.fillStyle = gradient
            ctx!.fillRect(0, 0, width, height)
        }

        // ── Main loop ───────────────────────────────────────────────────
        function animate() {
            time++
            ctx!.clearRect(0, 0, width, height)

            // nebula behind everything
            drawNebulaGlow()

            // stars far → near
            for (const layer of allLayers) drawStarLayer(layer)

            // shooting stars
            if (Math.random() < 0.0005) spawnShootingStar()
            drawShootingStars()

            animId = requestAnimationFrame(animate)
        }

        animate()

        // ── Events ──────────────────────────────────────────────────────
        function handleResize() {
            width = window.innerWidth
            height = window.innerHeight
            canvas!.width = width
            canvas!.height = height
        }

        function handleMouse(e: MouseEvent) {
            mouseX = e.clientX
            mouseY = e.clientY
        }

        window.addEventListener("resize", handleResize)
        window.addEventListener("mousemove", handleMouse)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("mousemove", handleMouse)
        }
    }, [])

    return (
        <canvas
            id="star-background"
            ref={canvasRef}
            aria-hidden
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: -10 }}
        />
    )
}
