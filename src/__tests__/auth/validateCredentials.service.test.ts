import { mockPrisma } from '@/test-utils/mockPrisma'
import { DUMMY_BCRYPT_HASH } from '@/shared/lib/security/constants'

vi.mock('@/shared/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}))

const bcrypt = (await import('bcryptjs')).default

const {
  validateCredentials,
  LOGIN_ERRORS,
} = await import('@/features/auth/services/validateCredentials.service')

describe('validateCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('throws INVALID_CREDENTIALS and executes bcrypt with DUMMY_HASH when user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    ;(bcrypt.compare as any).mockResolvedValue(false)
    
    const rawEmail = 'USER@MAIL.COM'
    const testPassword = 'password123'
    
    await expect(
      validateCredentials({
        email: rawEmail,
        password: testPassword,
      }),
    ).rejects.toThrow(LOGIN_ERRORS.INVALID_CREDENTIALS)
    
    // strict mack verification
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1)
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@mail.com' },
    })
    
    expect(bcrypt.compare).toHaveBeenCalledTimes(1)
    expect(bcrypt.compare).toHaveBeenCalledWith(testPassword, DUMMY_BCRYPT_HASH)
  })
  
  it('throws INVALID_CREDENTIALS for wrong password, EVEN IF email is not verified', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@mail.com',
      passwordHash: 'stored-hash',
      emailVerified: null,
    })
    
    ;(bcrypt.compare as any).mockResolvedValue(false)
    
    const testPassword = 'wrong-password'
    
    await expect(
      validateCredentials({
        email: 'user@mail.com',
        password: testPassword,
      }),
    ).rejects.toThrow(LOGIN_ERRORS.INVALID_CREDENTIALS)
    
    expect(bcrypt.compare).toHaveBeenCalledTimes(1)
    expect(bcrypt.compare).toHaveBeenCalledWith(testPassword, 'stored-hash')
  })
  
  it('throws EMAIL_NOT_VERIFIED only if password is CORRECT but email is not verified', async () => {
    const testEmail = 'user@mail.com'
    const testPassword = 'password123'
    const storedHash = 'stored-hash'
    
    const user = {
      id: 'user-1',
      email: 'user@mail.com',
      passwordHash: 'stored-hash',
      emailVerified: null,
    }
    
    mockPrisma.user.findUnique.mockResolvedValue(user)
    
    ;(bcrypt.compare as any).mockResolvedValue(true)
    
    await expect(
      validateCredentials({
        email: testEmail,
        password: testPassword,
      }),
    ).rejects.toThrow(LOGIN_ERRORS.EMAIL_NOT_VERIFIED)
    
    expect(bcrypt.compare).toHaveBeenCalledTimes(1)
    expect(bcrypt.compare).toHaveBeenCalledWith(testPassword, storedHash)
  })
  
  it('returns sanitized user when credentials are valid and email is verified', async () => {
    const testEmail = 'user@mail.com'
    const testPassword = 'password123'
    const storedHash = 'stored-hash'
    
    const dbUser = {
      id: 'user-1',
      email: testEmail,
      role: 'USER',
      name: 'Test User',
      passwordHash: 'stored-hash',
      emailVerified: new Date(),
    }
    
    mockPrisma.user.findUnique.mockResolvedValue(dbUser)
    ;(bcrypt.compare as any).mockResolvedValue(true)
    
    const result = await validateCredentials({
      email: testEmail,
      password: testPassword,
    })
    
    expect(bcrypt.compare).toHaveBeenCalledTimes(1)
    expect(bcrypt.compare).toHaveBeenCalledWith(testPassword, storedHash)
    
    expect(result).not.toHaveProperty('passwordHash')
    
    expect(result).toEqual(
      expect.objectContaining({
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        name: dbUser.name,
        emailVerified: dbUser.emailVerified,
      }),
    )
  })
})