"use client"

/**
 * Thin client wrapper that dynamically loads StarBackground with ssr:false.
 * next/dynamic({ ssr: false }) must be called from a Client Component —
 * this wrapper satisfies that constraint so layout.tsx (Server Component)
 * can import it safely without any hydration mismatch.
 */
import dynamic from "next/dynamic"

const StarBackground = dynamic(() => import("./star-background"), { ssr: false })

export default function StarBackgroundLoader() {
    return <StarBackground />
}
