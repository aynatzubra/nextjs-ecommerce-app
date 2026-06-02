import { prisma } from '@/shared/lib/prisma'
import { randomUUID } from 'crypto'
import { sendVerificationEmail } from '@/shared/lib/email/sendEmail'
import { env } from '@/shared/config/env'

export async function resendVerificationEmailService(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { emailVerified: true },
  })
  
  // Close info about user (security).
  if (!user) return
  if (user.emailVerified) return
  
  // delete old token for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  })
  
  const token = randomUUID()
  
  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60),
    },
  })
  
  const verifyUrl = `${env.APP_URL}/verify-email/${token}`
  
  await sendVerificationEmail({
    to: normalizedEmail,
    verifyUrl,
  })
}
