import { NextResponse } from 'next/server'
import { auth } from '@/features/auth/lib/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isApiAdminRoute = pathname.startsWith('/api/admin')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isProtectedAccountRoute = pathname.startsWith('/account')

  if (!session && isProtectedAccountRoute) {
    const newUrl = new URL('/login', req.url)
    newUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(newUrl)
  }

  if (!session && isApiAdminRoute) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session && isApiAdminRoute && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/account', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/account/:path*', '/api/admin/:path*', '/login', '/register'],
}
