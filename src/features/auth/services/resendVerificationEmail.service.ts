import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

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

  // local -simple type link
  console.log('RESEND VERIFY LINK:', `http://localhost:3000/verify-email/${token}`)
}
