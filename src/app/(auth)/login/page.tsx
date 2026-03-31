import { auth } from '@/shared/lib/auth/auth'
import { LoginForm } from '@/features/auth/ui/LoginForm'

export default async function LoginPage() {
  await auth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
      <div className="w-full max-w-[700px]">
        <h1 className="text-4xl font-black mb-8 text-black">Sign in</h1>
        <LoginForm />
      </div>
    </div>
  )
}
