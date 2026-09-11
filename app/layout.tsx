import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Facturier Soignant — la facturation dictée des soignants libéraux',
    template: '%s · Facturier Soignant',
  },
  description: 'Dictez vos actes, obtenez une facture conforme. Pour infirmiers, kinés et médecins libéraux.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#f4f5f7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="flex h-dvh flex-col bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
