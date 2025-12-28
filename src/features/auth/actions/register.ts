'use server'

import { RegisterInput, registerSchema } from '@/features/auth/lib/validations'
import { registerUserService } from '@/features/auth/services/registerUser.service'

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid input data' }
  }

  try {
    const user = await registerUserService(parsed.data)
    return { success: true, userId: user.id }
  } catch (e) {
    if (e instanceof Error && e.message === 'USER_ALREADY_EXISTS') {
      return { error: 'User with this email already exists' }
    }
    return { error: 'Unexpected error' }
  }
}
