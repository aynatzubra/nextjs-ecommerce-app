'use client'

import { registerUser } from '@/features/auth/actions/register'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

//todo: improve the registration form
export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const res = await registerUser({
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      name: formData.get('name'),
    })

    setLoading(false)

    if (!res.success) {
      setError(res.error as string)
      return
    }

    router.push('/login')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <input name="confirmPassword" type="password" placeholder="Confirm password" required />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
    </form>
  )
}
