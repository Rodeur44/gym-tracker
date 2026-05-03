import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #A78BFA 100%)',
          }}
        >
          <span
            style={{
              fontSize: 92,
              fontWeight: 900,
              color: 'white',
              lineHeight: 1,
              letterSpacing: '-4px',
            }}
          >
            G
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
