import { Prisma, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@localhost'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD

/**
 * CORE BOOTSTRAP: Enforces the existence of a system administrator.
 */

export async function seedAdmin(tx: Prisma.TransactionClient) {
  if (!ADMIN_PASSWORD) {
    throw new Error('FATAL: SEED_ADMIN_PASSWORD environment variable is required for bootstrap.')
  }
  
  // Initial check to prevent unnecessary bcrypt hashing and DB writes if admin exists
  const existingUser = await tx.user.findUnique({
    where: { email: ADMIN_EMAIL },
  })
  
  if (existingUser) {
    if (existingUser.role !== Role.ADMIN) {
      throw new Error(
        `FATAL: Admin bootstrap failed. User "${ADMIN_EMAIL}" already exists with role "${existingUser.role}". ` +
        `Refusing to automatically elevate privileges to ADMIN.`,
      )
    }
    console.log(`Core Bootstrap: Admin account already exists (${ADMIN_EMAIL}).`)
    return
  }
  
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS)
  
  // Atomic creation with concurrent execution protection
  try {
    await tx.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: 'Super Admin',
        role: Role.ADMIN,
        passwordHash,
        emailVerified: new Date(),
      },
    })
    console.log(`Core Bootstrap: Admin account created (${ADMIN_EMAIL}).`)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      console.log(`Core Bootstrap: Admin account was just created by a parallel process (${ADMIN_EMAIL}).`)
      return
    }
    throw error // Re-throw unhandled database errors
  }
}