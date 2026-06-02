import { vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({ data, ...init }),
  },
}))
