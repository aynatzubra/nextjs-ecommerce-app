import { prisma } from '@/shared/lib/prisma'

export const VERIFY_ERRORS = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
} as const

export async function verifyEmailService(token: string) {
  const vt = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!vt) throw new Error(VERIFY_ERRORS.INVALID_TOKEN)
  if (vt.expires < new Date()) throw new Error(VERIFY_ERRORS.EXPIRED_TOKEN)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { email: vt.identifier },
      data: { emailVerified: new Date() },
    })

    await tx.verificationToken.delete({
      where: { token },
    })
  })
}
