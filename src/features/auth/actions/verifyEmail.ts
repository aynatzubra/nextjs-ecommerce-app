'use server'

import { VERIFY_ERRORS, verifyEmailService } from '@/features/auth/services/verifyEmail.service'

export async function verifyEmail(token: string) {
  try {
    await verifyEmailService(token)
    return { success: true as const }
  } catch (e) {
    const code = e instanceof Error ? e.message : 'Unexpected'
    if (code === VERIFY_ERRORS.EXPIRED_TOKEN) return { success: false as const, error: 'Link expired. Please resend.' }
    if (code === VERIFY_ERRORS.INVALID_TOKEN) return { success: false as const, error: 'Invalid link.' }
    return { success: false as const, error: 'Unexpected error.' }
  }
}
