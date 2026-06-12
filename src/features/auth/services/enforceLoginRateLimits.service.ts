import { rateLimit } from '@/shared/lib/security/rate-limit'
import { rateLimitKeys } from '@/shared/lib/security/rate-limit-keys'

const LOGIN_IP_LIMIT = 20
const LOGIN_EMAIL_LIMIT = 5
const LOGIN_WINDOW_MS = 1000 * 60 * 15

export async function enforceLoginRateLimits(
  email: string,
  ip: string | null,
): Promise<void> {
  if (ip) {
    await rateLimit({
      key: rateLimitKeys.credentialsIp(ip),
      limit: LOGIN_IP_LIMIT,
      windowMs: LOGIN_WINDOW_MS,
    })
  }
  
  await rateLimit({
    key: rateLimitKeys.credentialsEmail(email),
    limit: LOGIN_EMAIL_LIMIT,
    windowMs: LOGIN_WINDOW_MS,
  })
}