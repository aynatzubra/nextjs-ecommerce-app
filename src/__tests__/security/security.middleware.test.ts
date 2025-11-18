/**
 * ⚠️ IMPORTANT: This integration test MUST be run with JEST.
 *
 * Reason: next-auth@5.x (Auth.js) and Next.js 16/App Router have a critical
 * incompatibility with Vitest (especially in a pnpm/ESM setup) when loading
 * the internal 'next/server' module.
 *
 * All attempts to mock around it (vi.mock, resolve.alias, etc.) failed because
 * the crash happens too early in the module loading lifecycle.
 *
 * Jest, with its more mature and lower-level mocking mechanism, is able to
 * bypass this conflict.
 *
 * Testing: Jest (testEnvironment: "node")
 */

import { NextRequest, NextResponse } from 'next/server'
import { mockContext, type AuthRequest, type MockedContext } from '@/test-utils/mockMiddleware'

jest.mock('@/features/auth/lib/auth', () => ({
  auth: jest.fn(
    (handler: (req: AuthRequest, ctx: MockedContext) => Response | Promise<Response>) =>
      async (req: AuthRequest, ctx: MockedContext) => {
        const url = req.nextUrl.toString()

        let authSession: AuthRequest['auth'] = null
        if (url.includes('mock_admin=true')) {
          authSession = { user: { id: 'a1', role: 'ADMIN' } }
        } else if (url.includes('mock_user=true')) {
          authSession = { user: { id: 'u1', role: 'USER' } }
        }

        req.auth = authSession

        return handler(req, ctx)
      },
  ),
}))

const middleware = require('@/proxy').default as (
  req: AuthRequest,
  ctx: MockedContext,
) => Promise<NextResponse> | NextResponse

const redirectSpy = jest.spyOn(NextResponse, 'redirect')

describe('Middleware Access Control', () => {
  let ctx: MockedContext

  beforeEach(() => {
    jest.clearAllMocks()
    ctx = mockContext()
  })

  const makeRequest = (url: string): AuthRequest => new NextRequest(url) as AuthRequest

  it('1. Redirects unauthenticated /account → /login with callbackUrl', async () => {
    const req = makeRequest('http://app.com/account/profile')
    const res = await middleware(req, ctx)

    expect(redirectSpy).toHaveBeenCalledTimes(1)
    const targetUrl = redirectSpy.mock.calls[0][0] as URL

    expect(targetUrl.pathname).toBe('/login')
    expect(targetUrl.searchParams.get('callbackUrl')).toBe(req.url)
  })

  it('2. Returns 401 for unauthenticated /api/admin', async () => {
    const req = makeRequest('http://app.com/api/admin/config')
    const res = await middleware(req, ctx)

    expect(res.status).toBe(401)
  })

  it('3. Returns 401 for USER on /api/admin', async () => {
    const req = makeRequest('http://app.com/api/admin/users?mock_user=true')
    const res = await middleware(req, ctx)

    expect(res.status).toBe(401)
  })

  it('4. Allows ADMIN on /api/admin', async () => {
    const req = makeRequest('http://app.com/api/admin/users?mock_admin=true')
    const res = await middleware(req, ctx)

    expect(res.status).toBe(200)
  })

  it('5. Redirects authenticated user from /login → /account/profile', async () => {
    const req = makeRequest('http://app.com/login?mock_user=true')
    const res = await middleware(req, ctx)

    expect(redirectSpy).toHaveBeenCalledTimes(1)
    const targetUrl = redirectSpy.mock.calls[0][0] as URL

    expect(targetUrl.pathname).toBe('/account/profile')
  })

  it('6. Redirects USER from /account/settings → /info', async () => {
    const req = makeRequest('http://app.com/account/settings?mock_user=true')
    const res = await middleware(req, ctx)

    expect(redirectSpy).toHaveBeenCalledTimes(1)
    const targetUrl = redirectSpy.mock.calls[0][0] as URL

    expect(targetUrl.pathname).toBe('/info')
  })
})
