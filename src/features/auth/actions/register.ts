'use server'

import { RegisterInput, registerSchema } from '@/features/auth/lib/validations'
import { registerUserService } from '@/features/auth/services/registerUser.service'
import { getRequestIp } from '@/shared/lib/security/getRequestIp'
import { rateLimit, RateLimitError } from '@/shared/lib/security/rate-limit'
import { rateLimitKeys } from '@/shared/lib/security/rate-limit-keys'

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input data' }
  }
  
  try {
    const ip = (await getRequestIp()) ?? 'unknown'
    await rateLimit({
      key: rateLimitKeys.registerIp(ip),
      limit: 3,
      windowMs: 1000 * 60 * 60,
    })
    
    const { user } = await registerUserService(parsed.data)
    
    return { success: true as const, userId: user.id }
    // return { success: true as const}
  } catch (e) {
    if (e instanceof Error && e.message === 'USER_ALREADY_EXISTS') {
      return { success: false as const, error: 'Unable to create account' }
    }
    if (e instanceof RateLimitError) {
      return { success: false as const, error: 'Too many requests' }
    }
    return { success: false as const, error: 'Unexpected error' }
  }
}
