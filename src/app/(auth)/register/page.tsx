import { auth } from '@/features/auth/lib/auth'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/features/auth/ui/RegisterForm'

export default async function RegisterPage() {
  const session = await auth()

  if (session) {
    redirect('/')
  }

  return (
    <div className="container max-w-md py-10">
      <h1 className="text-2xl font-semibold mb-6">Create account</h1>
      <RegisterForm />
    </div>
  )
}
