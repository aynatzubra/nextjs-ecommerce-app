'use client'

import { EyeIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import React, { useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { checkLogin } from '@/features/auth/actions/checkLogin'

// TODO: react-hook-form (validation, submit lock)
// TODO: forgot password flow
// TODO: remember me (session)
export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/account'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (loading) return

    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    try {
      const check = await checkLogin({ email, password })

      if (!check.ok) {
        if (check.reason === 'INVALID_CREDENTIALS') {
          setError('Please verify your email before logging in.')
          return
        }
        if (check.reason === 'INVALID_INPUT') {
          setError('Please enter a valid email and password.')
          return
        }
        setError('Invalid email or password')
        return
      }

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid email or password')
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Username/Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Username or email address <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <EyeIcon size={20} />
            </button>
          </div>
        </div>

        {/* Checkbox Remember me */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="remember"
            disabled
            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="remember" className="text-sm text-gray-600">
            Remember me
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'px-8 py-2 bg-[#e3122b] hover:bg-red-700 text-white font-bold rounded-full transition-colors uppercase text-sm tracking-wider',
                loading ? 'opacity-50 cursor-not-allowed' : '',
              )}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/register')}
              className="px-8 py-2 border-2 border-[#e3122b] text-[#e3122b] hover:bg-red-50 font-bold rounded-full transition-colors uppercase text-sm tracking-wider"
            >
              Register
            </button>
          </div>

          <button type="button" disabled className="text-left text-sm text-gray-400 mt-2 cursor-not-allowed">
            Lost your password?
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  )
}
