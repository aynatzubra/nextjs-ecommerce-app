import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'

import { prisma } from '@/src/lib/db'

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
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      if (token.role) {
        session.user.role = token.role as 'ADMIN' | 'USER'
      }
      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        token.role = dbUser?.role || 'USER'
      }
      return token
    },
  },
})
