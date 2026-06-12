'use server'

import { z } from 'zod'
import { resendVerificationEmailService } from '@/features/auth/services/resendVerificationEmail.service'
import { getRequestIp } from '@/shared/lib/security/getRequestIp'
import { rateLimit, RateLimitError } from '@/shared/lib/security/rate-limit'
import { rateLimitKeys } from '@/shared/lib/security/rate-limit-keys'

const inputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

export async function resendVerificationEmail(input: { email: string }) {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Invalid email' }
  
  try {
    const ip = (await getRequestIp()) ?? 'unknown'
    
    const normalizedEmail = parsed.data.email
    
    await rateLimit({
      key: rateLimitKeys.resendIp(ip),
      limit: 10,
      windowMs: 1000 * 60 * 60,
    })
    
    await rateLimit({
      key: rateLimitKeys.resendEmail(normalizedEmail),
      limit: 3,
      windowMs: 1000 * 60 * 60,
    })
    
    await resendVerificationEmailService(parsed.data.email)
    
    return { success: true as const }
  } catch (e) {
    if (e instanceof RateLimitError) {
      return { success: false as const, error: 'Too many requests' }
    }
    return { success: false as const, error: 'Unexpected error' }
  }
}
