"use client"

import { MeshGradient } from "@paper-design/shaders-react"

export function BackgroundShader() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <MeshGradient
        className="w-full h-full"
        colors={["#0A0A0A", "#0f0520", "#1a0a3e", "#2d1b4e"]}
        speed={0.4}
        distortion={0.3}
        swirl={0.15}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(109,40,217,0.12) 0%, transparent 70%)",
        }}
      />
    </div>
  )
}
