import { vi } from 'vitest'

export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  order: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}
