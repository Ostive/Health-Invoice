import type { Metadata } from 'next'
import { Inter, Merriweather, Playfair_Display, Lato } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
})

const playfair = Playfair_Display({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Facturier Soignant AI',
  description: 'Facturation intelligente pour infirmiers et kinés libéraux',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${merriweather.variable} ${playfair.variable} ${lato.variable}`}>
      <body className="bg-slate-50 text-slate-900 antialiased font-sans h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
