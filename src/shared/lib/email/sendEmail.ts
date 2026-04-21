import { resend } from '@/shared/lib/email/resend'
import { VerificationEmail } from '@/shared/emails/VerificationEmail'

type SendVerificationEmailParams = {
  to: string
  verifyUrl: string
}

export async function sendVerificationEmail({ to, verifyUrl }: SendVerificationEmailParams) {
  const from = process.env.EMAIL_FROM
  
  if (!from) {
    throw new Error('Missing EMAIL_FROM')
  }
  
  await resend.emails.send({
    from,
    to,
    subject: 'Verify your email',
    react: VerificationEmail({ verifyUrl}),
  })
}