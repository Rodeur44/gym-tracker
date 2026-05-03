import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
          }}
        />
        {/* Icon */}
        <div
          style={{
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 28,
            background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #A78BFA 100%)',
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 72, fontWeight: 900, color: 'white', lineHeight: 1 }}>G</span>
        </div>
        {/* Wordmark */}
        <div style={{ display: 'flex', fontSize: 42, fontWeight: 700, color: 'white', letterSpacing: '-1px' }}>
          Gym
          <span style={{ color: '#A78BFA' }}>Log</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 18, color: '#525252', fontWeight: 400 }}>
          Bats tes records
        </div>
      </div>
    ),
    { width: 1170, height: 2532 }
  )
}
