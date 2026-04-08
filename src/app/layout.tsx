import { Geist, Geist_Mono } from 'next/font/google'

import type { Metadata } from 'next'
import './globals.css'
import { auth } from '@/features/auth/lib/auth'
import { SessionProvider } from 'next-auth/react'
import { AppHeader } from '@/widgets/layout/AppHeader'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Bad Rabbit - nextjs-ecommerce-app',
  description: 'Next.js 16 e-commerce: TypeScript, PostgreSQL, Prisma, Auth, Testing, SSR/ISR',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider session={session}>
          <div className="flex min-h-screen flex-col">
            <AppHeader />

            <main className="container max-w-full flex-1 px-4 py-6 bg-white">{children}</main>

            <footer className="border-t border-zinc-200 py-4 text-center text-sm text-zinc-500">Bad Rabbit</footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
