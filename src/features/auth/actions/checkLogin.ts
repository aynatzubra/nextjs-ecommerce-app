'use server'

import { credentialsSchema } from '@/features/auth/lib/validations'
import { LOGIN_ERRORS, validateCredentials } from '@/features/auth/services/validateCredentials.service'
import { rateLimit, RateLimitError } from '@/shared/lib/security/rate-limit'
import { getRequestIp } from '@/shared/lib/security/getRequestIp'
import { rateLimitKeys } from '@/shared/lib/security/rate-limit-keys'

export type CheckLoginResult =
  | { ok: true }
  | { ok: false; reason: 'INVALID_INPUT' | 'INVALID_CREDENTIALS' | 'TOO_MANY_REQUESTS' }

export async function checkLogin(input: { email: string; password: string }): Promise<CheckLoginResult> {
  const parsed = credentialsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, reason: 'INVALID_INPUT' }
  
  const email = parsed.data.email.trim().toLowerCase()
  const password = parsed.data.password
  
  try {
    const ip = await getRequestIp()
    if (ip) {
      await rateLimit({
        key: rateLimitKeys.credentialsIp(ip),
        limit: 20,
        windowMs: 1000 * 60 * 15,
      })
    }
    await rateLimit({
      key: rateLimitKeys.credentialsEmail(email),
      limit: 5,
      windowMs: 1000 * 60 * 15
    })
    
    await validateCredentials({ email, password })
    return { ok: true }
  } catch (e) {
    if (e instanceof RateLimitError) {
      return { ok: false, reason: 'TOO_MANY_REQUESTS' }
    }
    const message = e instanceof Error ? e.message : ''
    if (message === LOGIN_ERRORS.EMAIL_NOT_VERIFIED) {
      return { ok: false, reason: 'INVALID_CREDENTIALS' }
    }
    return { ok: false, reason: 'INVALID_CREDENTIALS' }
  }
}
