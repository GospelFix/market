import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import RecoilProvider from '@/components/providers/RecoilProvider'
import AuthProvider from '@/components/auth/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Service',
  description: 'Supabase + Next.js 풀스택 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <RecoilProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </RecoilProvider>
      </body>
    </html>
  )
}
