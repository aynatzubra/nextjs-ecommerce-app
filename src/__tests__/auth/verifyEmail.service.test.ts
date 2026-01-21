import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrisma } from '@/test-utils/mockPrisma'

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

const { verifyEmailService, VERIFY_ERRORS } = await import('@/features/auth/services/verifyEmail.service')

describe('verifyEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws INVALID_TOKEN if token not found', async () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue(null)

    await expect(verifyEmailService('missing-token')).rejects.toThrow(VERIFY_ERRORS.INVALID_TOKEN)

    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('throws EXPIRED_TOKEN if token is expired', async () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue({
      identifier: 'user@mail.com',
      token: 't',
      expires: new Date(Date.now() - 1000), // уже истёк
    })

    await expect(verifyEmailService('t')).rejects.toThrow(VERIFY_ERRORS.EXPIRED_TOKEN)

    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('verifies email and deletes token in a transaction for a valid token', async () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue({
      identifier: 'user@mail.com',
      token: 'valid',
      expires: new Date(Date.now() + 60_000),
    })

    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma))

    await verifyEmailService('valid')

    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { email: 'user@mail.com' },
      data: { emailVerified: expect.any(Date) },
    })

    expect(mockPrisma.verificationToken.delete).toHaveBeenCalledWith({
      where: { token: 'valid' },
    })
  })
})
