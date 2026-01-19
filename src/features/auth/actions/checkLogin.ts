'use server'

import { credentialsSchema } from '@/features/auth/lib/validations'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export type CheckLoginResult =
  | { ok: true }
  | { ok: false; reason: 'INVALID_INPUT' | 'INVALID_CREDENTIALS' | 'EMAIL_NOT_VERIFIED' }

export async function checkLogin(input: { email: string; password: string }): Promise<CheckLoginResult> {
  const parsed = credentialsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, reason: 'INVALID_INPUT' }

  const email = parsed.data.email.trim().toLowerCase()
  const password = parsed.data.password

  const user = await prisma.user.findUnique({
    where: { email },
    select: { passwordHash: true, emailVerified: true },
  })

  if (!user || !user.passwordHash) return { ok: false, reason: 'INVALID_CREDENTIALS' }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) return { ok: false, reason: 'INVALID_CREDENTIALS' }

  if (!user.emailVerified) return { ok: false, reason: 'EMAIL_NOT_VERIFIED' }

  return { ok: true }
}
