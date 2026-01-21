import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrisma } from '@/test-utils/mockPrisma'

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}))

const { checkLogin } = await import('@/features/auth/actions/checkLogin')
const bcrypt = (await import('bcryptjs')).default

describe('checkLogin (pre-check before NextAuth signIn)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns INVALID_INPUT and does NOT hit DB for invalid email', async () => {
    const res = await checkLogin({ email: 'not-an-email', password: '123456' })

    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toBe('INVALID_INPUT')

    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
    expect(bcrypt.compare).not.toHaveBeenCalled()
  })

  it('returns INVALID_CREDENTIALS when user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const res = await checkLogin({ email: 'USER@MAIL.com', password: '123456' })

    expect(mockPrisma.user.findUnique).toHaveBeenCalledOnce()
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@mail.com' },
      select: { passwordHash: true, emailVerified: true },
    })

    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toBe('INVALID_CREDENTIALS')

    expect(bcrypt.compare).not.toHaveBeenCalled()
  })

  it('returns INVALID_CREDENTIALS when password is wrong', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      passwordHash: 'hash',
      emailVerified: new Date(),
    })
    ;(bcrypt.compare as any).mockResolvedValue(false)

    const res = await checkLogin({ email: 'user@mail.com', password: 'wrongpass' })

    expect(bcrypt.compare).toHaveBeenCalledOnce()
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toBe('INVALID_CREDENTIALS')
  })

  it('returns EMAIL_NOT_VERIFIED when creds ok but emailVerified is null', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      passwordHash: 'hash',
      emailVerified: null,
    })
    ;(bcrypt.compare as any).mockResolvedValue(true)

    const res = await checkLogin({ email: 'user@mail.com', password: '123456' })

    expect(bcrypt.compare).toHaveBeenCalledOnce()
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toBe('EMAIL_NOT_VERIFIED')
  })

  it('returns ok:true when creds ok and email is verified', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      passwordHash: 'hash',
      emailVerified: new Date(),
    })
    ;(bcrypt.compare as any).mockResolvedValue(true)

    const res = await checkLogin({ email: 'user@mail.com', password: '123456' })

    expect(res.ok).toBe(true)
  })
})
