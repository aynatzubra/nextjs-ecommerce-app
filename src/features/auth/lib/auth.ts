import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { DefaultSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import { jwtCallback, sessionCallback } from '@/features/auth/lib/callbacks'
import { prisma } from '@/lib/prisma'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string //userId
      role: 'ADMIN' | 'USER'
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error(
    'Missing Google Auth environment variables. Please check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.',
  )
}

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
  },
})
