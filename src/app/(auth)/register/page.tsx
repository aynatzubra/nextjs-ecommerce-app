import { auth } from '@/features/auth/lib/auth'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/features/auth/ui/RegisterForm'

export default async function RegisterPage() {
  const session = await auth()

  if (session) {
    redirect('/account/profile')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 px-4 pb-10">
      <div className="w-full max-w-[500px]">
        <h1 className="text-4xl font-black mb-8 text-black tracking-tight">Create account</h1>
        <RegisterForm />

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-[#e3122b] font-bold hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}
