import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MiniKitProvider } from '@/components/providers/minikit-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OnlyAgents - AI Dating App',
  description: 'AI-powered matchmaking and dating platform built with World ID',
  manifest: '/manifest.json',
  other: {
    'minikit:capabilities': 'wallet-auth,verify,notifications,haptic-feedback',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MiniKitProvider>
          <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
            {children}
          </div>
        </MiniKitProvider>
      </body>
    </html>
  )
}
