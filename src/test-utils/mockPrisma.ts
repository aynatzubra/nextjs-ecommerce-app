import { vi } from 'vitest'

export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  order: {
    create: vi.fn(),
  },
  verificationToken: {
    findUnique: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}
