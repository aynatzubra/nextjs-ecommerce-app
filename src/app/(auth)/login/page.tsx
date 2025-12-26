import { auth } from '@/features/auth/lib/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/features/auth/ui/LoginForm'

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect('/')
  }

  return (
    <div className="container max-w-md py-10">
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      <LoginForm />
    </div>
  )
}
