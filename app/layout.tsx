import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { BackgroundShader } from '@/components/ui/background-shader'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'GymLog',
  description: 'Suis tes séances, bats tes records, débloque ta collection.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GymLog',
    startupImage: [
      // iPhone 14 Pro Max / 15 Pro Max (430×932 @3x → 1290×2796)
      { url: '/splash', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 14 Pro / 15 Pro (393×852 @3x → 1179×2556)
      { url: '/splash', media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 14 Plus (428×926 @3x → 1284×2778)
      { url: '/splash', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 14 / 13 / 12 (390×844 @3x → 1170×2532)
      { url: '/splash', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 13 mini / 12 mini (375×812 @3x → 1125×2436)
      { url: '/splash', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone SE 3rd gen (375×667 @2x → 750×1334)
      { url: '/splash', media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${dmSans.variable} ${dmMono.variable} font-sans antialiased`}>
        <BackgroundShader />
        <div className="relative z-10 min-h-screen max-w-[430px] mx-auto overflow-x-hidden">
          <AppProvider>
            {children}
          </AppProvider>
        </div>
      </body>
    </html>
  )
}
