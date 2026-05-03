"use client"

import { useRef, useCallback } from "react"
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

export function TiltCard({
  tiltLimit = 14,
  scale = 1.03,
  perspective = 1000,
  spotlight = true,
  className,
  style,
  children,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Raw normalized position -1 → 1
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Spring physics — smooth, no re-renders
  const springX = useSpring(rawX, { stiffness: 250, damping: 28 })
  const springY = useSpring(rawY, { stiffness: 250, damping: 28 })
  const springScale = useSpring(1, { stiffness: 250, damping: 28 })
  const glareOpacity = useSpring(0, { stiffness: 250, damping: 28 })

  const rotateX = useTransform(springY, [-1, 1], [tiltLimit, -tiltLimit])
  const rotateY = useTransform(springX, [-1, 1], [-tiltLimit, tiltLimit])
  const glareLeft = useTransform(springX, [-1, 1], ["0%", "100%"])
  const glareTop = useTransform(springY, [-1, 1], ["0%", "100%"])

  const getPos = (clientX: number, clientY: number) => {
    const el = cardRef.current
    if (!el) return { px: 0, py: 0 }
    const rect = el.getBoundingClientRect()
    return {
      px: ((clientX - rect.left) / rect.width) * 2 - 1,
      py: ((clientY - rect.top) / rect.height) * 2 - 1,
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { px, py } = getPos(e.clientX, e.clientY)
    rawX.set(px)
    rawY.set(py)
  }, [rawX, rawY])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    const { px, py } = getPos(t.clientX, t.clientY)
    rawX.set(px)
    rawY.set(py)
  }, [rawX, rawY])

  const handleEnter = useCallback(() => {
    springScale.set(scale)
    glareOpacity.set(1)
  }, [springScale, glareOpacity, scale])

  const handleLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
    springScale.set(1)
    glareOpacity.set(0)
  }, [rawX, rawY, springScale, glareOpacity])

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchStart={handleEnter}
      onTouchEnd={handleLeave}
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
                "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 50%)",
            }}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
