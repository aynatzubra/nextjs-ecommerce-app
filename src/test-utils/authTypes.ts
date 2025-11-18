import type { NextRequest } from 'next/server'

export type UserRole = 'ADMIN' | 'USER'

export interface AuthSessionUser {
  id: string
  role: UserRole
}

export interface AuthSession {
  user: AuthSessionUser
}

export type AuthRequest = NextRequest & {
  auth?: AuthSession | null
}

export interface MockedContext {
  params: Promise<Record<string, string>>
  waitUntil: (promise: Promise<unknown>) => void
}
