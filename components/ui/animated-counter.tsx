'use client'

import { MotionValue, motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CounterProps {
  end: number
  duration?: number
  fontSize?: number
  className?: string
}

export function Counter({ end, duration = 1.5, fontSize = 24, className = '' }: CounterProps) {
  const [value, setValue] = useState(0)
  const slotH = Math.ceil(fontSize * 1.3)

  useEffect(() => {
    setValue(0)
    if (end <= 0) return
    const stepMs = Math.max(16, (duration * 1000) / end)
    let current = 0
    const timer = setInterval(() => {
      current += 1
      setValue(current)
      if (current >= end) clearInterval(timer)
    }, stepMs)
    return () => clearInterval(timer)
  }, [end, duration])

  return (
    <div
      className={`flex overflow-hidden font-bold font-mono tabular-nums ${className}`}
      style={{ fontSize, height: slotH }}
    >
      {end >= 100 && <Digit place={100} value={value} slotH={slotH} />}
      {end >= 10 && <Digit place={10} value={value} slotH={slotH} />}
      <Digit place={1} value={value} slotH={slotH} />
    </div>
  )
}

function Digit({ place, value, slotH }: { place: number; value: number; slotH: number }) {
  const rounded = Math.floor(value / place)
  const spring = useSpring(rounded, { stiffness: 150, damping: 20 })
  useEffect(() => { spring.set(rounded) }, [spring, rounded])

  return (
    <div className="relative w-[1ch]" style={{ height: slotH }}>
      {Array.from({ length: 10 }, (_, i) => (
        <DigitNumber key={i} mv={spring} number={i} slotH={slotH} />
      ))}
    </div>
  )
}

function DigitNumber({ mv, number, slotH }: { mv: MotionValue; number: number; slotH: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10
    const offset = (10 + number - placeValue) % 10
    let memo = offset * slotH
    if (offset > 5) memo -= 10 * slotH
    return memo
  })
  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  )
}
