import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import { mockPrisma } from '@/test-utils/mockPrisma'

vi.mock('@/shared/lib/prisma', () => ({
  prisma: mockPrisma,
}))

const { prisma } = await import('@/shared/lib/prisma') //because Vitest work's with ESM
import { jwtCallback, sessionCallback } from '@/shared/lib/auth/callbacks'
import { Session } from 'next-auth'

describe('Auth Callbacks Logic (Role Inject)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should inject id and role into JWT token on signIn WITHOUT querying DB', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' })

    const mockUser = { id: 'user-id-789', role: 'ADMIN', name: 'Test User' }
    const initialToken = { sub: 'user-id-789' }

    const resultToken = await jwtCallback({ token: initialToken, user: mockUser })

    //DB dont touch - role comes from authorize()
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()

    expect(resultToken.id).toBe('user-id-789')
    expect(resultToken.role).toBe('ADMIN')
  })

  it('should copy role and id from JWT token to the session object without querying DB', async () => {
    const mockTokenWithData = { id: 'token-id-456', role: 'USER' }
    const initialSession = {
      user: { name: 'Test User', email: 'test@test.com' },
      expires: new Date().toISOString(),
    } as Session

    const resultSession = await sessionCallback({
      session: initialSession,
      token: mockTokenWithData,
    })

    expect(prisma.user.findUnique).not.toHaveBeenCalled()

    expect(resultSession.user.id).toBe('token-id-456')
    expect(resultSession.user.role).toBe('USER')
  })
})
