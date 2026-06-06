import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { DefaultSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import { jwtCallback, sessionCallback } from '@/shared/lib/auth/callbacks'
import { prisma } from '@/shared/lib/prisma'
import Credentials from 'next-auth/providers/credentials'
import { credentialsSchema } from '@/features/auth/lib/validations'
import bcrypt from 'bcryptjs'
import { env } from '@/shared/config/env'
import { rateLimit } from '@/shared/lib/security/rate-limit'
import { validateCredentials } from '@/features/auth/services/validateCredentials.service'
import { rateLimitKeys } from '@/shared/lib/security/rate-limit-keys'
import { getRequestIp } from '@/shared/lib/security/getRequestIp'

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

const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET

// if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
//   throw new Error(
//     'Missing Google Auth environment variables. Please check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env.local file.',
//   )
// }

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
    // GoogleProvider({
    //   clientId: GOOGLE_CLIENT_ID,
    //   clientSecret: GOOGLE_CLIENT_SECRET,
    // }),
    Credentials({
      credentials: {
        username: { label: 'Username' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null
        
        const { email, password } = parsed.data
        
        const ip = await getRequestIp()
        
        if (ip) {
          await rateLimit({
            key: rateLimitKeys.credentialsIp(ip),
            limit: 20,
            windowMs: 1000 * 60 * 15,
          })
        }
        
        await rateLimit({
          key: rateLimitKeys.credentialsEmail(email),
          limit: 5,
          windowMs: 1000 * 60 * 15,
        })
        
        try {
          const user = await validateCredentials({ email, password })
          return { id: user.id, email: user.email, role: user.role, name: user.name }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
  },
})
