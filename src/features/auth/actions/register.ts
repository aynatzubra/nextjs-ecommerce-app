'use server'

import { RegisterInput, registerSchema } from '@/features/auth/lib/validations'
import { registerUserService } from '@/features/auth/services/registerUser.service'

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input data' }
  }

  try {
    const { token, user } = await registerUserService(parsed.data)

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const devVerifyLink = process.env.NODE_ENV !== 'production' ? `${baseUrl}/verify-email/${token}` : undefined

    return { success: true as const, userId: user.id, devVerifyLink }
  } catch (e) {
    if (e instanceof Error && e.message === 'USER_ALREADY_EXISTS') {
      return { success: false as const, error: 'Unable to create account' }
    }
    return { success: false as const, error: 'Unexpected error' }
  }
}
