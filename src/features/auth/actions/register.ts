'use server'

import bcrypt from 'bcryptjs'
import { registerSchema } from '@/features/auth/lib/validations'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Invalid input data' }
  }

  const { email, password, name } = parsed.data

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: 'User with this email already exists' }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: 'USER' },
    })
    return { success: true, userId: user.id }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: 'User already exists' }
      }
    }

    throw error
  }
}
