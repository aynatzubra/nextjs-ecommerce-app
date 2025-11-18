import { vi } from 'vitest'

export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
}
