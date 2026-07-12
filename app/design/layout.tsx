import type { Metadata } from 'next'
import { Archivo_Black, Archivo, Bricolage_Grotesque, IBM_Plex_Mono } from 'next/font/google'

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-poster',
})

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poster-text',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-club',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-mono',
})

export const metadata: Metadata = {
  title: 'GymLog — Directions de redesign',
  robots: { index: false },
}

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${archivoBlack.variable} ${archivo.variable} ${bricolage.variable} ${plexMono.variable}`}>
      {children}
    </div>
  )
}
