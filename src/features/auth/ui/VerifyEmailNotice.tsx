'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { resendVerificationEmail } from '@/features/auth/actions/resendVerificationEmail'

export function VerifyEmailNotice() {
  const router = useRouter()
  const sp = useSearchParams()
  
  // email to /verify-email through query
  const email = sp.get('email') ?? ''
  
  const [cooldown, setCooldown] = useState(30)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  
  const canResend = useMemo(() => cooldown <= 0 && !!email, [cooldown, email])
  
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown])
  
  async function onResend() {
    if (!canResend) return
    setLoading(true)
    setStatus(null)
    
    try {
      const res = await resendVerificationEmail({ email })
      if (!res.success) throw new Error(res.error)
      setStatus('Verification email sent. Check your inbox.')
      setCooldown(30)
    } catch (e) {
      setStatus('Unable to resend email. Try again later.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        
        <p className="text-gray-600">We’ve sent a verification link{email ? ` to ${email}` : ''}.</p>
        
        <p className="text-sm text-gray-500">You can’t log in until your email is verified.</p>
        
        {status && <p className="text-sm text-gray-700">{status}</p>}
        
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => router.push('/login')} className="text-sm underline" type="button">
            Go to login
          </button>
          
          <button
            disabled={!canResend || loading}
            onClick={onResend}
            type="button"
            className="text-sm text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed underline"
          >
            {loading ? 'Sending...' : canResend ? 'Resend email' : `Resend in ${cooldown}s`}
          </button>
        </div>
        
        {!email && (
          <p className="text-xs text-gray-400">
            Tip: open this page right after registration so we know where to resend.
          </p>
        )}
      </div>
    </div>
  )
}
