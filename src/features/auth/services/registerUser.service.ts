import { prisma } from '@/shared/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendVerificationEmail } from '@/shared/lib/email/sendEmail'
import { env } from '@/shared/config/env'

export const REGISTER_ERRORS = {
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
} as const

export async function registerUserService({
  email,
  password,
  name,
}: {
  email: string
  password: string
  name?: string
}) {
  const normalizedEmail = email.trim().toLowerCase()
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const { user, token } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name,
          passwordHash,
          role: 'USER',
          emailVerified: null,
        },
        select: { id: true, email: true },
      })
      const token = randomBytes(32).toString('base64url')
      
      await tx.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token,
          expires: new Date(Date.now() + 1000 * 60 * 60),
        },
      })

      return { user , token }
    })
    
    const verifyUrl = `${env.APP_URL}/verify-email/${token}`
    
    try {
      await sendVerificationEmail({
        to: normalizedEmail,
        verifyUrl,
      })
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
      console.error('EMAIL ERROR:', errorMessage)
      throw e
    }
    
    // await sendVerificationEmail({
    //   to: normalizedEmail,
    //   verifyUrl,
    // })
    
    return { user }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(REGISTER_ERRORS.USER_ALREADY_EXISTS)
    }
    throw error
  }
}
