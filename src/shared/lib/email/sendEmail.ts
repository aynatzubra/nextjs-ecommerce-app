import { resend } from '@/shared/lib/email/resend'
import { VerificationEmail } from '@/shared/emails/VerificationEmail'
import { env } from '@/shared/config/env'

type SendVerificationEmailParams = {
  to: string
  verifyUrl: string
}

export async function sendVerificationEmail({ to, verifyUrl }: SendVerificationEmailParams) {
  
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verify your email',
    react: VerificationEmail({ verifyUrl }),
  })
}