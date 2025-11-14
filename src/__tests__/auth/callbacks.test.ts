import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import { mockPrisma } from '@/test-utils/mockPrisma'

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

const { prisma } = await import('../../lib/prisma') //because Vitest work's with ESM
import { jwtCallback, sessionCallback } from '@/features/auth/lib/callbacks'

describe('Auth Callbacks Logic (Role Inject)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch ADMIN role from DB and inject it into the JWT token on signIn', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' })

    const mockUser = { id: 'user-id-789', name: 'Test User' }
    const initialToken = { sub: 'user-id-789' }

    const resultToken = await jwtCallback({ token: initialToken, user: mockUser })

    expect(prisma.user.findUnique).toHaveBeenCalledOnce()
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id-789' },
      select: { role: true },
    })

    expect(resultToken.role).toBe('ADMIN')
    expect(resultToken.id).toBe('user-id-789')
  })

  it('should copy role and id from JWT token to the session object without querying DB', async () => {
    const mockTokenWithData = { id: 'token-id-456', role: 'USER' }
    const initialSession = { user: {} }

    const resultSession = await sessionCallback({
      session: initialSession,
      token: mockTokenWithData,
      user: undefined,
    })

    expect(prisma.user.findUnique).not.toHaveBeenCalled()

    expect(resultSession.user.id).toBe('token-id-456')
    expect(resultSession.user.role).toBe('USER')
  })
})
