import { vi } from 'vitest'

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({ data, ...init }),
  },
}))
