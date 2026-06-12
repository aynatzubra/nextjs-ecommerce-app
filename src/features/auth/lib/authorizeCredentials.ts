import { credentialsSchema } from '@/features/auth/lib/validations'
import { getRequestIp } from '@/shared/lib/security/getRequestIp'
import { RateLimitError } from '@/shared/lib/security/rate-limit'
import { validateCredentials } from '@/features/auth/services/validateCredentials.service'
import { TooManyRequestsAuthError } from '@/features/auth/errors/auth-errors'
import { enforceLoginRateLimits } from '@/features/auth/services/enforceLoginRateLimits.service'

export async function authorizeCredentials(credentials: unknown) {
  const parsed = credentialsSchema.safeParse(credentials)
  
  if (!parsed.success) {
    return null
  }
  
  const { email, password } = parsed.data
  
  const ip = await getRequestIp()
  
  try {
    await enforceLoginRateLimits(email, ip)
    
    const user = await validateCredentials({
      email,
      password,
    })
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }
  } catch (e) {
    if (e instanceof RateLimitError) {
      throw new TooManyRequestsAuthError()
    }
    
    return null
  }
}