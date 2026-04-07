import { verifyEmail } from '@/features/auth/actions/verifyEmail'
import { VerifyEmailResult } from '@/widgets/auth/verify-email-result'

export default async function VerifyEmailTokenPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params
  const res = await verifyEmail(token)

  if (!res.success) {
    return <VerifyEmailResult success={false} error={res.error} />
  }

  return <VerifyEmailResult success={true} />
}
