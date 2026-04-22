"use client"

import React, { Suspense, lazy } from "react"

const Spline = lazy(() => import("@splinetool/react-spline"))

interface SplineSceneProps {
    scene: string
    className?: string
    style?: React.CSSProperties
}

function SplineLoader() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                {/* Pulsing orbit rings loader */}
                <div className="relative w-16 h-16">
                    <span
                        className="absolute inset-0 rounded-full border border-white/20 animate-ping"
                        style={{ animationDuration: "1.6s" }}
                    />
                    <span
                        className="absolute inset-2 rounded-full border border-white/15 animate-ping"
                        style={{ animationDuration: "2s", animationDelay: "0.3s" }}
                    />
                    <span className="absolute inset-[18px] rounded-full bg-white/10" />
                </div>
                <p className="text-white/30 text-xs tracking-widest uppercase font-medium">
                    Loading 3D scene…
                </p>
            </div>
        </div>
    )
}

export function SplineScene({ scene, className = "", style }: SplineSceneProps) {
    return (
        <Suspense fallback={<SplineLoader />}>
            <Spline
                scene={scene}
                className={className}
                style={{ width: "100%", height: "100%", ...style }}
            />
        </Suspense>
    )
}
