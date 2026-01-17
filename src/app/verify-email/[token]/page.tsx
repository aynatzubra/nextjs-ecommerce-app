import { verifyEmail } from '@/features/auth/actions/verifyEmail'

export default async function VerifyEmailTokenPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params
  const res = await verifyEmail(token)
  if (!res.success) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center">
        <h1 className="text-xl font-semibold">Verification failed</h1>
        <p className="mt-3 text-muted-foreground">{res.error}</p>
        <a className="mt-6 inline-block underline" href="/verify-email">
          Back
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <h1 className="text-xl font-semibold">Email verified ✅</h1>
      <p className="mt-3 text-muted-foreground">Now you can enter a world of pleasure. Welcome!</p>
      <a className="mt-6 inline-block underline" href="/login">
        Go to login
      </a>
    </div>
  )
}
