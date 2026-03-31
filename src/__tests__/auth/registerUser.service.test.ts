import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrisma } from '@/test-utils/mockPrisma'
import { Prisma } from '@prisma/client'

vi.mock('@/shared/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}))

vi.mock('crypto', async () => {
  const actual = await vi.importActual<any>('crypto')
  return {
    ...actual,
    randomUUID: vi.fn(() => 'uuid-test-123'),
  }
})

const bcrypt = (await import('bcryptjs')).default
const { registerUserService } = await import('@/features/auth/services/registerUser.service')

describe('registerUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates user + verification token inside a transaction and returns token', async () => {
    ;(bcrypt.hash as any).mockResolvedValue('hash123')

    mockPrisma.user.create.mockResolvedValue({
      id: 'user-id-1',
      email: 'user@mail.com',
    })

    mockPrisma.verificationToken.create.mockResolvedValue({
      identifier: 'user@mail.com',
      token: 'uuid-test-123',
      expires: new Date(Date.now() + 60_000),
    })

    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma))

    const res = await registerUserService({
      email: '  USER@MAIL.com ',
      password: '123456',
      name: 'Test',
      confirmPassword: '123456',
    } as any)

    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()

    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'user@mail.com',
          passwordHash: 'hash123',
        }),
      }),
    )

    expect(mockPrisma.verificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          identifier: 'user@mail.com',
          token: 'uuid-test-123',
          expires: expect.any(Date),
        }),
      }),
    )

    expect(res).toEqual(expect.objectContaining({ token: 'uuid-test-123' }))
  })

  it('throws USER_ALREADY_EXISTS on Prisma P2002', async () => {
    ;(bcrypt.hash as any).mockResolvedValue('hash123')

    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma))

    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['email'] },
    })

    mockPrisma.user.create.mockRejectedValue(p2002)

    await expect(
      registerUserService({
        email: 'user@mail.com',
        password: '123456',
        name: 'Test',
        confirmPassword: '123456',
      } as any),
    ).rejects.toThrow('USER_ALREADY_EXISTS')
  })
})
