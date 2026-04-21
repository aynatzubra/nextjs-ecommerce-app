import { prisma } from '@/shared/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { sendVerificationEmail } from '@/shared/lib/email/sendEmail'

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
      const token = randomUUID()
      
      await tx.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token,
          expires: new Date(Date.now() + 1000 * 60 * 60),
        },
      })

      return { user , token }
    })
    
    const appUrl = process.env.APP_URL
    if(!appUrl) throw new Error('Missing APP_URL')
    
    const verifyUrl = `${appUrl}/verify-email/${token}`
    
    try {
      await sendVerificationEmail({
        to: normalizedEmail,
        verifyUrl,
      })
    } catch (e) {
      console.error('EMAIL ERROR:', e)
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
