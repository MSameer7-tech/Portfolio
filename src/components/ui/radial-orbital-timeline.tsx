"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X, Zap, ChevronRight } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export interface OrbitalNode {
    id: number
    title: string
    date: string
    content: string
    category: string
    icon: React.ElementType
    relatedIds: number[]
    status: "completed" | "in-progress" | "pending"
    energy: number
}

interface RadialOrbitalTimelineProps {
    timelineData: OrbitalNode[]
}

// ── Monochrome status palette ─────────────────────────────────────────────────
const STATUS = {
    completed: {
        label: "Complete",
        dotColor: "bg-white",
        textClass: "text-white",
        borderStyle: "1px solid rgba(255,255,255,0.55)",
        nodeGlow: "0 0 16px rgba(255,255,255,0.2)",
        nodeGlowActive: "0 0 24px rgba(255,255,255,0.4)",
        lineColor: "rgba(255,255,255,0.22)",
        lineActive: "rgba(255,255,255,0.7)",
        badgeBorder: "border-white/70 text-white",
        barFrom: "rgba(255,255,255,1)",
        barTo: "rgba(200,200,200,0.4)",
    },
    "in-progress": {
        label: "In Progress",
        dotColor: "bg-gray-400",
        textClass: "text-gray-300",
        borderStyle: "1px solid rgba(200,200,200,0.35)",
        nodeGlow: "0 0 10px rgba(255,255,255,0.12)",
        nodeGlowActive: "0 0 18px rgba(255,255,255,0.3)",
        lineColor: "rgba(200,200,200,0.18)",
        lineActive: "rgba(200,200,200,0.65)",
        badgeBorder: "border-gray-400/70 text-gray-300",
        barFrom: "rgba(200,200,200,1)",
        barTo: "rgba(100,100,100,0.4)",
    },
    pending: {
        label: "Planned",
        dotColor: "bg-gray-600",
        textClass: "text-gray-500",
        borderStyle: "1px solid rgba(120,120,120,0.25)",
        nodeGlow: "0 0 0px transparent",
        nodeGlowActive: "0 0 14px rgba(255,255,255,0.2)",
        lineColor: "rgba(120,120,120,0.12)",
        lineActive: "rgba(180,180,180,0.4)",
        badgeBorder: "border-gray-600/60 text-gray-500",
        barFrom: "rgba(120,120,120,1)",
        barTo: "rgba(60,60,60,0.4)",
    },
}

const CONTAINER = 520
const CENTER = CONTAINER / 2
const ORBIT_R = 188
const NODE_SIZE = 60
const ANIM_SPEED = 0.15

export function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
    const { theme } = useTheme()
    const isLight = theme === "light"
    const [selected, setSelected] = useState<number | null>(null)
    const [hovered, setHovered] = useState<number | null>(null)
    const [deg, setDeg] = useState(0)
    const animRef = useRef<number | null>(null)
    const pausedRef = useRef(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const totalNodes = timelineData.length
    const baseAngles = timelineData.map((_, i) => (360 / totalNodes) * i)

    // ── Rotation loop ─────────────────────────────────────────────────────────
    useEffect(() => {
        const step = () => {
            if (!pausedRef.current) setDeg(d => d + ANIM_SPEED)
            animRef.current = requestAnimationFrame(step)
        }
        animRef.current = requestAnimationFrame(step)
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
    }, [])

    // ── Canvas radial lines (rotate with orbit ring) ──────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.clearRect(0, 0, CONTAINER, CONTAINER)

        baseAngles.forEach((angle, i) => {
            const node = timelineData[i]
            const rad = (angle * Math.PI) / 180
            const nx = CENTER + ORBIT_R * Math.cos(rad)
            const ny = CENTER + ORBIT_R * Math.sin(rad)
            const isActive =
                selected === node.id ||
                hovered === node.id ||
                (selected !== null && timelineData.find(n => n.id === selected)?.relatedIds.includes(node.id)) ||
                (hovered !== null && timelineData.find(n => n.id === hovered)?.relatedIds.includes(node.id))
            const sx = STATUS[node.status]
            const lineColor = isLight ? "rgba(0,0,0,0.15)" : sx.lineColor
            const lineActive = isLight ? "rgba(0,0,0,0.28)" : sx.lineActive

            ctx.beginPath()
            ctx.moveTo(CENTER, CENTER)
            ctx.lineTo(nx, ny)
            ctx.strokeStyle = isActive ? lineActive : lineColor
            ctx.lineWidth = isActive ? 1.2 : 0.8
            if (isActive) {
                ctx.shadowBlur = 8
                ctx.shadowColor = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.5)"
            } else {
                ctx.shadowBlur = 0
            }
            ctx.stroke()
            ctx.shadowBlur = 0
        })
    }, [selected, baseAngles, timelineData])

    const handleNodeClick = (id: number) => {
        setSelected(p => {
            const next = p === id ? null : id
            pausedRef.current = next !== null
            return next
        })
    }

    const selectedNode = timelineData.find(n => n.id === selected)

    return (
        <div
            className="flex flex-col items-center w-full"
            onMouseEnter={() => { pausedRef.current = true }}
            onMouseLeave={() => { if (!selected) pausedRef.current = false }}
        >
            {/* ── Orbit scene ────────────────────────────────────────────────────── */}
            <div className="relative" style={{ width: CONTAINER, height: CONTAINER }}>

                {/* Canvas lines — co-rotate with ring */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ transform: `rotate(${deg}deg)`, transformOrigin: "center center" }}
                >
                    <canvas ref={canvasRef} width={CONTAINER} height={CONTAINER} className="absolute inset-0" />
                </div>

                {/* Blurred outer ring */}
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: ORBIT_R * 2 + 42,
                        height: ORBIT_R * 2 + 42,
                        top: CENTER - ORBIT_R - 21,
                        left: CENTER - ORBIT_R - 21,
                        border: isLight ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.05)",
                        filter: "blur(4px)",
                    }}
                />
                {/* Solid orbit ring */}
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: ORBIT_R * 2,
                        height: ORBIT_R * 2,
                        top: CENTER - ORBIT_R,
                        left: CENTER - ORBIT_R,
                        border: isLight ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(255,255,255,0.15)",
                    }}
                />

                {/* ── Rotating wrapper ───────────────────────────────────────────── */}
                <div
                    className="absolute inset-0"
                    style={{ transform: `rotate(${deg}deg)`, transformOrigin: "center center" }}
                >
                    {timelineData.map((node, i) => {
                        const rad = (baseAngles[i] * Math.PI) / 180
                        const nx = CENTER + ORBIT_R * Math.cos(rad) - NODE_SIZE / 2
                        const ny = CENTER + ORBIT_R * Math.sin(rad) - NODE_SIZE / 2
                        const sx = STATUS[node.status]
                        const isSelected = selected === node.id
                        const isRel = selected !== null && timelineData.find(n => n.id === selected)?.relatedIds.includes(node.id)
                        const isHov = hovered === node.id
                        const dimmed = selected !== null && !isSelected && !isRel

                        return (
                            <div
                                key={node.id}
                                className="absolute cursor-pointer"
                                style={{
                                    width: NODE_SIZE, height: NODE_SIZE,
                                    top: ny, left: nx,
                                    transform: `rotate(${-deg}deg)`,
                                    transformOrigin: "center center",
                                    zIndex: isSelected ? 30 : isHov ? 20 : 10,
                                    opacity: dimmed ? (isLight ? 0.3 : 0.18) : 1,
                                    transition: "opacity 0.3s",
                                }}
                                onMouseEnter={() => setHovered(node.id)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => handleNodeClick(node.id)}
                            >
                                {/* Tooltip */}
                                <AnimatePresence>
                                    {isHov && !selected && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: -8 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            className={cn(
                                                "absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] pointer-events-none z-50",
                                                isLight
                                                    ? "bg-white/95 border border-black/10 text-black/60 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                                                    : "bg-black/90 border border-white/10 text-white/60"
                                            )}
                                        >
                                            {node.category} · {node.energy}%
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Node circle */}
                                <div
                                    className={cn("w-full h-full rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-300")}
                                    style={{
                                        background: isLight ? "#ffffff" : "rgba(0,0,0,0.88)",
                                        border: isLight
                                            ? isSelected || isHov
                                                ? "1px solid rgba(0,0,0,0.16)"
                                                : "1px solid rgba(0,0,0,0.08)"
                                            : isSelected || isHov
                                                ? "1px solid rgba(255,255,255,0.6)"
                                                : sx.borderStyle,
                                        backdropFilter: "blur(10px)",
                                        boxShadow: isLight
                                            ? isSelected || isHov
                                                ? "0 10px 28px rgba(0,0,0,0.12)"
                                                : "0 6px 20px rgba(0,0,0,0.06)"
                                            : isSelected
                                                ? sx.nodeGlowActive
                                                : isHov
                                                    ? "0 0 25px rgba(0,255,255,0.4)"
                                                    : sx.nodeGlow,
                                        transform: `scale(${isSelected ? 1.12 : isHov ? 1.1 : 1})`,
                                        transition: "box-shadow 0.3s, transform 0.3s, border 0.3s",
                                    }}
                                >
                                    <node.icon
                                        className={cn(
                                            "w-[18px] h-[18px] transition-colors duration-300",
                                            isLight
                                                ? "text-black"
                                                : isSelected || isHov
                                                    ? "text-white"
                                                    : sx.textClass
                                        )}
                                        strokeWidth={1.5}
                                    />
                                    <span
                                        className={cn(
                                            "text-[8px] font-medium text-center leading-none px-0.5 mt-0.5 transition-colors duration-300",
                                            isLight
                                                ? "text-black"
                                                : isSelected || isHov
                                                    ? "text-white"
                                                    : sx.textClass
                                        )}
                                    >
                                        {node.title}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* ── Center core ────────────────────────────────────────────────── */}
                <div
                    className="absolute flex items-center justify-center"
                    style={{ width: 90, height: 90, top: CENTER - 45, left: CENTER - 45, zIndex: 40 }}
                >
                    {/* Pulse rings */}
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{ width: 90, height: 90, border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.15)" }}
                            animate={{ scale: [1, 2 + i * 0.4], opacity: [0.25, 0] }}
                            transition={{ duration: 2.8 + i * 0.6, repeat: Infinity, delay: i * 0.9, ease: "easeOut" }}
                        />
                    ))}
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[90px] h-[90px] rounded-full flex flex-col items-center justify-center pointer-events-none"
                        style={{
                            background: isLight
                                ? "radial-gradient(circle at center, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 60%, rgba(255,255,255,0.7) 100%)"
                                : "radial-gradient(circle at center, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 60%, rgba(0,0,0,0) 100%)",
                            border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.4)",
                            boxShadow: isLight
                                ? selected
                                    ? "0 18px 40px rgba(0,0,0,0.12)"
                                    : "0 10px 24px rgba(0,0,0,0.08)"
                                : selected
                                    ? "0 0 50px rgba(255,255,255,0.35), 0 0 20px rgba(255,255,255,0.2)"
                                    : "0 0 35px rgba(255,255,255,0.2), 0 0 12px rgba(255,255,255,0.1)",
                            backdropFilter: "blur(6px)",
                            transition: "box-shadow 0.4s ease",
                        }}
                    >
                        <span className={cn("text-[10px] font-medium tracking-wide text-center leading-tight px-2", isLight ? "text-black/80" : "text-white")}>
                            Core<br />Skills
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* ── Skill detail card ───────────────────────────────────────────────── */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        key={selectedNode.id}
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="mt-12 w-[320px] max-w-[90vw]"
                    >
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                                background: isLight ? "#ffffff" : "rgba(20, 20, 20, 0.85)",
                                border: isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
                                boxShadow: isLight ? "0 20px 40px rgba(0, 0, 0, 0.08)" : "0 10px 30px rgba(0, 0, 0, 0.4)",
                                backdropFilter: "blur(12px)",
                                padding: "20px 18px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}
                        >
                            {/* Header row */}
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                                    STATUS[selectedNode.status].badgeBorder
                                )}>
                                    {STATUS[selectedNode.status].label}
                                </span>
                                <button
                                    onClick={() => { setSelected(null); pausedRef.current = false }}
                                    className={cn("transition-colors p-1", isLight ? "text-black/30 hover:text-black/70" : "text-white/25 hover:text-white/70")}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Skill name */}
                            <h3 className={cn("text-[18px] font-semibold tracking-tight", isLight ? "text-black" : "text-white")}>
                                {selectedNode.title}
                            </h3>

                            {/* Description */}
                            <p className={cn("text-[13px] leading-relaxed", isLight ? "text-slate-600" : "text-white/70")}>
                                {selectedNode.content}
                            </p>

                            {/* Divider */}
                            <div className={cn("h-px w-full", isLight ? "bg-black/5" : "bg-white/5")} />

                            {/* Proficiency Bar */}
                            <div className="w-full">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={cn("text-[11px] font-medium", isLight ? "text-black/45" : "text-white/30")}>Proficiency</span>
                                    <span className={cn("text-[11px] font-semibold", isLight ? "text-black/65" : "text-white/60")}>{selectedNode.energy}%</span>
                                </div>
                                <div className={cn("h-[6px] w-full rounded-full overflow-hidden", isLight ? "bg-black/10" : "bg-white/5")}>
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{
                                            background: `linear-gradient(90deg, #6c63ff, #8b7bff)`,
                                            borderRadius: "inherit",
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${selectedNode.energy}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            {/* Tags / Related */}
                            {selectedNode.relatedIds.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {selectedNode.relatedIds.map(rid => {
                                        const rel = timelineData.find(n => n.id === rid)
                                        return rel ? (
                                            <span
                                                key={rid}
                                                className={cn(
                                                    "px-[10px] py-[4px] rounded-full text-[11px] border",
                                                    isLight ? "text-slate-700 bg-black/5 border-black/10" : "text-white/40 bg-white/5 border-white/10"
                                                )}
                                            >
                                                {rel.title}
                                            </span>
                                        ) : null
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Legend ──────────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-7 mt-5">
                {(["completed", "in-progress", "pending"] as const).map(k => (
                    <span key={k} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className={cn("w-1.5 h-1.5 rounded-full", STATUS[k].dotColor)} />
                        {STATUS[k].label}
                    </span>
                ))}
            </div>
        </div>
    )
}
