import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { DefaultSession } from 'next-auth'
import { jwtCallback, sessionCallback } from '@/shared/lib/auth/callbacks'
import { prisma } from '@/shared/lib/prisma'
import Credentials from 'next-auth/providers/credentials'
import { authorizeCredentials } from '@/features/auth/lib/authorizeCredentials'
import { env } from '@/shared/config/env'

const isProd = env.NODE_ENV === 'production'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string //userId
      role: 'ADMIN' | 'USER'
      email?: string | null
      name?: string | null
    }
  }
}

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  useSecureCookies: isProd,
  cookies: {
    sessionToken: {
      name: isProd
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
      },
    },
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 8,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
  },
})
