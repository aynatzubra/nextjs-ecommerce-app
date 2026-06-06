'use server'

import { VERIFY_ERRORS, verifyEmailService } from '@/features/auth/services/verifyEmail.service'
import { rateLimit, RateLimitError } from '@/shared/lib/security/rate-limit'
import { getRequestIp } from '@/shared/lib/security/getRequestIp'
import { rateLimitKeys } from '@/shared/lib/security/rate-limit-keys'

export async function verifyEmail(token: string) {
  try {
    const ip = (await getRequestIp()) ?? 'unknown'
    
    await rateLimit({
      key: rateLimitKeys.verifyIp(ip),
      limit: 30,
      windowMs: 1000 * 60
    })
    
    await verifyEmailService(token)
    
    return { success: true as const }
  } catch (e) {
    if (e instanceof RateLimitError) {
      return {
        success: false as const,
        error: 'Too many requests'
      }
    }
    
    const code = e instanceof Error ? e.message : 'Unexpected'
    
    if (code === VERIFY_ERRORS.EXPIRED_TOKEN) {
      return { success: false as const, error: 'Link expired. Please resend.' }
    }
    
    if (code === VERIFY_ERRORS.INVALID_TOKEN) {
      return { success: false as const, error: 'Invalid link.' }
    }
    
    return { success: false as const, error: 'Unexpected error.' }
  }
}
