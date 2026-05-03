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
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: '#A78BFA',
            lineHeight: 1,
            letterSpacing: '-4px',
          }}
        >
          G
        </span>
      </div>
    ),
    { ...size }
  )
}
