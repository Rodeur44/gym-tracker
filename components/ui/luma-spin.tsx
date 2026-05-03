import { cn } from '@/lib/utils'

interface LumaSpinProps {
  className?: string
  size?: number
  color?: string
}

export function LumaSpin({ className, size = 65, color = '#A78BFA' }: LumaSpinProps) {
  const boxShadow = `inset 0 0 0 3px ${color}`
  return (
    <div
      className={cn('relative aspect-square', className)}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute rounded-[50px] animate-loaderAnim"
        style={{ boxShadow }}
      />
      <span
        className="absolute rounded-[50px] animate-loaderAnim animation-delay-luma"
        style={{ boxShadow }}
      />
    </div>
  )
}
