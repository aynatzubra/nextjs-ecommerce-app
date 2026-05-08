import { auth } from '@/features/auth/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Security boundary helpers.
 *
 * Do not rely on middleware or client session
 * as the only authorization layer.
 *
 * Every private server entry point must enforce
 * requireUser() or requireAdmin().
 */

export async function requireUser() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  return session.user
}

export async function requireAdmin() {
  const user = await requireUser()
  
  if (user.role !== 'ADMIN') {
    redirect('/')
  }
  
  return user
}