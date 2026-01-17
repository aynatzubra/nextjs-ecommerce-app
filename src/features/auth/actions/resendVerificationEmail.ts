'use server'

import { z } from 'zod'
import { resendVerificationEmailService } from '@/features/auth/services/resendVerificationEmail.service'

const inputSchema = z.object({
  email: z.string().email(),
})

export async function resendVerificationEmail(input: { email: string }) {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, error: 'Invalid email' }

  try {
    await resendVerificationEmailService(parsed.data.email)
    return { success: true as const }
  } catch (e) {
    return { success: false as const, error: 'Unexpected error' }
  }
}
