"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export interface TiltCardProps {
  tiltLimit?: number
  scale?: number
  perspective?: number
  spotlight?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

type GyroState = "idle" | "active" | "needs-permission"

export function TiltCard({
  tiltLimit = 16,
  scale = 1.02,
  perspective = 1000,
  spotlight = true,
  className,
  style,
  children,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [gyroState, setGyroState] = useState<GyroState>("idle")
  const gyroActiveRef = useRef(false)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const springX = useSpring(rawX, { stiffness: 200, damping: 25 })
  const springY = useSpring(rawY, { stiffness: 200, damping: 25 })
  const springScale = useSpring(1, { stiffness: 200, damping: 25 })
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 25 })

  const rotateX = useTransform(springY, [-1, 1], [tiltLimit, -tiltLimit])
  const rotateY = useTransform(springX, [-1, 1], [-tiltLimit, tiltLimit])
  const glareLeft = useTransform(springX, [-1, 1], ["0%", "100%"])
  const glareTop = useTransform(springY, [-1, 1], ["0%", "100%"])

  // ── Gyroscope (mobile) ────────────────────────────────────────────
  const startGyro = useCallback((orientation: DeviceOrientationEvent) => {
    if (orientation.gamma === null) return
    // gamma: left-right (-90 to 90), beta: front-back (-180 to 180)
    const x = Math.max(-1, Math.min(1, (orientation.gamma ?? 0) / 25))
    const y = Math.max(-1, Math.min(1, ((orientation.beta ?? 45) - 45) / 25))
    rawX.set(x)
    rawY.set(y)
  }, [rawX, rawY])

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    if (!isMobile) return

    const DevOrient = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    }

    if (typeof DevOrient.requestPermission === "function") {
      // iOS 13+ — needs permission
      setGyroState("needs-permission")
    } else {
      // Android — auto
      window.addEventListener("deviceorientation", startGyro)
      gyroActiveRef.current = true
      setGyroState("active")
      springScale.set(scale)
      glareOpacity.set(1)
    }

    return () => window.removeEventListener("deviceorientation", startGyro)
  }, [startGyro, springScale, glareOpacity, scale])

  const requestGyroPermission = useCallback(async () => {
    const DevOrient = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    }
    if (typeof DevOrient.requestPermission !== "function") return
    const result = await DevOrient.requestPermission()
    if (result === "granted") {
      window.addEventListener("deviceorientation", startGyro)
      gyroActiveRef.current = true
      setGyroState("active")
      springScale.set(scale)
      glareOpacity.set(1)
    }
  }, [startGyro, springScale, glareOpacity, scale])

  // ── Mouse (desktop) — track on window so cursor outside card works ─
  const getPos = useCallback((clientX: number, clientY: number) => {
    const el = cardRef.current
    if (!el) return { px: 0, py: 0 }
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    // Normalize over a 2× card radius so cursor can be outside card
    return {
      px: Math.max(-1, Math.min(1, (clientX - cx) / (rect.width * 1.2))),
      py: Math.max(-1, Math.min(1, (clientY - cy) / (rect.height * 1.2))),
    }
  }, [])

  const handleWindowMouseMove = useCallback((e: MouseEvent) => {
    if (gyroActiveRef.current) return
    const { px, py } = getPos(e.clientX, e.clientY)
    rawX.set(px)
    rawY.set(py)
  }, [getPos, rawX, rawY])

  const handleMouseEnter = useCallback(() => {
    if (gyroActiveRef.current) return
    springScale.set(scale)
    glareOpacity.set(1)
    window.addEventListener("mousemove", handleWindowMouseMove)
  }, [springScale, glareOpacity, scale, handleWindowMouseMove])

  const handleMouseLeave = useCallback(() => {
    if (gyroActiveRef.current) return
    window.removeEventListener("mousemove", handleWindowMouseMove)
    rawX.set(0)
    rawY.set(0)
    springScale.set(1)
    glareOpacity.set(0)
  }, [handleWindowMouseMove, rawX, rawY, springScale, glareOpacity])

  return (
    <div className="relative">
      <motion.div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale: springScale,
          transformStyle: "preserve-3d",
          perspective,
          ...style,
        }}
        className={cn("relative overflow-hidden will-change-transform", className)}
      >
        {children}
        {spotlight && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
            style={{ opacity: glareOpacity }}
          >
            <motion.div
              className="absolute w-[250%] h-[250%] rounded-full"
              style={{
                left: glareLeft,
                top: glareTop,
                x: "-50%",
                y: "-50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 50%)",
              }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* iOS gyroscope permission button */}
      {gyroState === "needs-permission" && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={requestGyroPermission}
          className="mt-3 w-full py-2 rounded-xl text-[11px] font-semibold text-[#A78BFA] border border-[#A78BFA]/20 bg-[#A78BFA]/5"
        >
          Activer l&apos;effet gyroscope
        </motion.button>
      )}
      {gyroState === "active" && (
        <p className="mt-2 text-center text-[10px] text-zinc-600">
          Incline ton téléphone
        </p>
      )}
    </div>
  )
}
