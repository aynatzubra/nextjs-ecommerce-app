import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'

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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
  },
})
