import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPrisma } from '@/test-utils/mockPrisma'

const sendVerificationEmailMock = vi.hoisted(() => vi.fn())

vi.mock('@/shared/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('@/shared/lib/email/sendEmail', () => ({
  sendVerificationEmail: sendVerificationEmailMock,
}))

vi.mock('crypto', async () => {
  const actual = await vi.importActual<any>('crypto')
  return {
    ...actual,
    randomUUID: vi.fn(() => 'uuid-test-456'),
  }
})

const { resendVerificationEmailService } = await import(
  '@/features/auth/services/resendVerificationEmail.service'
  )

describe('resendVerificationEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.APP_URL = 'http://localhost:3000'
  })
  
  it('deletes old tokens, creates a new token and sends verification email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      emailVerified: null,
    })
    
    mockPrisma.verificationToken.deleteMany.mockResolvedValue({
      count: 1,
    })
    
    mockPrisma.verificationToken.create.mockResolvedValue({
      identifier: 'user@mail.com',
      token: 'uuid-test-456',
      expires: new Date(Date.now() + 60_000),
    })
    
    await resendVerificationEmailService('  USER@MAIL.com ')
    
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@mail.com' },
      select: { emailVerified: true },
    })
    
    expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'user@mail.com' },
    })
    
    expect(mockPrisma.verificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          identifier: 'user@mail.com',
          token: 'uuid-test-456',
          expires: expect.any(Date),
        }),
      }),
    )
    
    expect(sendVerificationEmailMock).toHaveBeenCalledOnce()
    expect(sendVerificationEmailMock).toHaveBeenCalledWith({
      to: 'user@mail.com',
      verifyUrl: 'http://localhost:3000/verify-email/uuid-test-456',
    })
  })
  
  it('does nothing if user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    
    await resendVerificationEmailService('user@mail.com')
    
    expect(mockPrisma.verificationToken.deleteMany).not.toHaveBeenCalled()
    expect(mockPrisma.verificationToken.create).not.toHaveBeenCalled()
    expect(sendVerificationEmailMock).not.toHaveBeenCalled()
  })
  
  it('does nothing if user email is already verified', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      emailVerified: new Date(),
    })
    
    await resendVerificationEmailService('user@mail.com')
    
    expect(mockPrisma.verificationToken.deleteMany).not.toHaveBeenCalled()
    expect(mockPrisma.verificationToken.create).not.toHaveBeenCalled()
    expect(sendVerificationEmailMock).not.toHaveBeenCalled()
  })
  
  it('throws if APP_URL is missing after token creation', async () => {
    delete process.env.APP_URL
    
    mockPrisma.user.findUnique.mockResolvedValue({
      emailVerified: null,
    })
    
    mockPrisma.verificationToken.deleteMany.mockResolvedValue({
      count: 1,
    })
    
    mockPrisma.verificationToken.create.mockResolvedValue({
      identifier: 'user@mail.com',
      token: 'uuid-test-456',
      expires: new Date(Date.now() + 60_000),
    })
    
    await expect(resendVerificationEmailService('user@mail.com')).rejects.toThrow('Missing APP_URL')
    
    expect(sendVerificationEmailMock).not.toHaveBeenCalled()
  })
})