import { NextRequest } from 'next/server'

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

export function mockRequest(url: string, session: AuthSession | null): AuthRequest {
  const req = new NextRequest(url) as AuthRequest
  req.auth = session
  return req
}

export function mockContext(params: Record<string, string> = {}): MockedContext {
  return {
    params: Promise.resolve(params),
    waitUntil: () => {},
  }
}
