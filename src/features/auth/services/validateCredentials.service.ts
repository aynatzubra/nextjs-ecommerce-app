import bcrypt from 'bcryptjs'
import { prisma } from '@/shared/lib/prisma'
import { DUMMY_BCRYPT_HASH } from '@/shared/lib/security/constants'

export const LOGIN_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
} as const

export async function validateCredentials({ email, password }: {
  email: string
  password: string
}) {
  const normalizedEmail = email.trim().toLowerCase()
  
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  })
  
  // Anti-timing attack fallback
  const hashToCompare = user?.passwordHash || DUMMY_BCRYPT_HASH
  
  const isValid = await bcrypt.compare(password, hashToCompare)
  
  if (!user || !user.passwordHash || !isValid) {
    throw new Error(LOGIN_ERRORS.INVALID_CREDENTIALS)
  }
  
  if (!user.emailVerified) {
    throw new Error(LOGIN_ERRORS.EMAIL_NOT_VERIFIED)
  }
  
  // return user
  const { passwordHash, ...safeUser } = user
  return safeUser
}