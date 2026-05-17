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

export async function getAuthenticatedUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireUser() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  
  if (user.role !== 'ADMIN') {
    redirect('/')
  }
  
  return user
}