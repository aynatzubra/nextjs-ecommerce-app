'use client'

import { registerUser } from '@/features/auth/actions/register'

export default function RegisterPage() {
  const handleTest = async () => {
    const result = await registerUser({
      email: 'test@test.com',
      password: '123456',
      confirmPassword: '123456',
    })

    console.log(result)
  }

  return <button onClick={handleTest}>Test register</button>
}
