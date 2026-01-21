import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const registerUserServiceMock = vi.hoisted(() => vi.fn())

vi.mock('@/features/auth/services/registerUser.service', () => ({
  registerUserService: registerUserServiceMock,
}))

describe('registerUser action', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it('returns invalid input data when schema fails (and does not call service)', async () => {
    const { registerUser } = await import('@/features/auth/actions/register')

    const res = await registerUser({
      email: 'not-an-email',
      password: '123456',
      confirmPassword: '123456',
      name: 'Te',
    } as any)

    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error).toBe('Invalid input data')
    }

    expect(registerUserServiceMock).not.toHaveBeenCalled()
  })

  it('returns success and devVerifyLink in dev', async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'development',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    }

    registerUserServiceMock.mockResolvedValue({
      user: { id: 'u1', email: 'user@mail.com' },
      token: 'tok123',
    })

    const { registerUser } = await import('@/features/auth/actions/register')
    const res = await registerUser({
      email: 'user@mail.com',
      password: '123456',
      confirmPassword: '123456',
      name: 'Test',
    } as any)

    expect(registerUserServiceMock).toHaveBeenCalledOnce()

    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.userId).toBe('u1')
      expect(res.devVerifyLink).toBe('http://localhost:3000/verify-email/tok123')
    }
  })

  it('returns success without devVerifyLink in production', async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    }

    registerUserServiceMock.mockResolvedValue({
      user: { id: 'u1', email: 'user@mail.com' },
      token: 'tok123',
    })

    const { registerUser } = await import('@/features/auth/actions/register')

    console.log('ENV:', process.env.NODE_ENV, process.env.NEXTAUTH_URL, process.env.NEXT_PUBLIC_APP_URL)

    const res = await registerUser({
      email: 'user@mail.com',
      password: '123456',
      confirmPassword: '123456',
      name: 'Test',
    } as any)

    expect(registerUserServiceMock).toHaveBeenCalledOnce()

    console.log('ACTION RES 0:', res)
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.devVerifyLink).toBeUndefined()
    }
  })

  it('maps USER_ALREADY_EXISTS to a friendly error', async () => {
    registerUserServiceMock.mockRejectedValue(new Error('USER_ALREADY_EXISTS'))

    const { registerUser } = await import('@/features/auth/actions/register')
    const res = await registerUser({
      email: 'user@mail.com',
      password: '123456',
      confirmPassword: '123456',
      name: 'Test',
    } as any)

    expect(registerUserServiceMock).toHaveBeenCalledOnce()
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error).toBe('Unable to create account')
    }
  })
})
