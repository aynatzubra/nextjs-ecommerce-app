'use client'

import { registerUser } from '@/features/auth/actions/register'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon } from 'lucide-react'
import { registerSchema } from '@/features/auth/lib/validations'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return

    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const rawData = Object.fromEntries(formData.entries())

    if (rawData.name === '') {
      delete rawData.name
    }

    const validationResult = registerSchema.safeParse(rawData)

    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message)
      setLoading(false)
      return
    }

    try {
      const res = await registerUser(validationResult.data)

      if (res.error) {
        throw new Error(res.error)
      }

      router.push(`/verify-email?email=${encodeURIComponent(validationResult.data.email)}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create account'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-5">
        {/* InputName */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">Name</label>
          <input
            name="name"
            placeholder="Your name"
            className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>

        {/* Input Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>

        {/* Input Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              required
              className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon size={18} />
            </button>
          </div>
        </div>

        {/* Input Confirm Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">
            Confirm password <span className="text-red-500">*</span>
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/*registration button */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-3 bg-[#e3122b] hover:bg-red-700 text-white font-bold rounded-full transition-all uppercase text-sm tracking-widest disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </div>

        {/* separator */}
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Button Google */}
        <div className="flex justify-center">
          <button
            type="button"
            disabled
            onClick={() => {}}
            className="flex items-center justify-center gap-3 px-8 py-3 border border-gray-200 rounded-full text-sm font-semibold text-gray-400 w-full cursor-not-allowed bg-gray-50 opacity-70"
          >
            {/* SVG icon Google */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.64l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </form>
    </div>
  )
}
