import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Haftify - Die Lernplattform für Haftpflicht Underwriter',
  description: 'Meistern Sie komplexe Risiken mit unserer spezialisierten Lernplattform für Underwriter. Praxisnahe Fallstudien, aktuelle Rechtsprechung und gezielte Prüfungsvorbereitung.',
  metadataBase: new URL('https://haftify.de'),
  openGraph: {
    title: 'Haftify - Die Lernplattform für Haftpflicht Underwriter',
    description: 'Meistern Sie komplexe Risiken mit unserer spezialisierten Lernplattform für Underwriter. Praxisnahe Fallstudien, aktuelle Rechtsprechung und gezielte Prüfungsvorbereitung.',
    url: 'https://haftify.de',
    siteName: 'Haftify',
    images: [
      {
        url: '/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Haftify - Die Lernplattform für Haftpflicht Underwriter',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Haftify - Die Lernplattform für Haftpflicht Underwriter',
    description: 'Meistern Sie komplexe Risiken mit unserer spezialisierten Lernplattform für Underwriter. Praxisnahe Fallstudien, aktuelle Rechtsprechung und gezielte Prüfungsvorbereitung.',
    images: ['/img/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
} 