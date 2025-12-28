import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function registerUserService({
  email,
  password,
  name,
}: {
  email: string
  password: string
  name?: string
}) {
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    return await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'USER',
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('USER_ALREADY_EXISTS')
    }
    throw error
  }
}
