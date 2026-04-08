import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { mockPrisma } from '@/test-utils/mockPrisma'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/features/auth/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/shared/lib/prisma', () => ({
  prisma: mockPrisma,
}))

const { revalidatePath } = await import('next/cache')
const { auth } = await import('@/features/auth/lib/auth')
const { createOrderAction } = await import('@/features/order/actions/createOrderAction')

const authMock = auth as Mock

describe('createOrderAction (validation & auth))', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const makeFormData = (productId?: string, quantity?: string) => {
    const fd = new FormData()
    if (productId !== undefined) fd.append('productId', productId)
    if (quantity !== undefined) fd.append('quantity', quantity)
    return fd
  }

  it('should return error if user is NOT authenticated', async () => {
    authMock.mockResolvedValue(null)

    const result = await createOrderAction(makeFormData('1', '2'))

    expect(result.success).toBe(false)
    expect(result.message).toContain('Auth error')
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('returns validation error if quantity is missing', async () => {
    authMock.mockResolvedValue({ user: { id: 'test-user-id', role: 'USER' } })

    const result = await createOrderAction(makeFormData('1'))

    expect(result.success).toBe(false)
    expect(result.message).toContain('quantity')
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('calls transaction and revalidatePath on successful creation', async () => {
    authMock.mockResolvedValue({ user: { id: 'test-user-id', role: 'USER' } })

    mockPrisma.product.findUnique.mockResolvedValue({
      id: 1,
      price: { mul: vi.fn(() => 200) },
      name: 'Test Product',
      stock: 10,
    })

    mockPrisma.order.create.mockResolvedValue({
      id: 42,
      userId: 'test-user-id',
      totalAmount: 200,
      status: 'PENDING',
    })

    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => unknown) => {
      return cb(mockPrisma)
    })

    const result = await createOrderAction(makeFormData('1', '2'))

    expect(result.success).toBe(true)
    expect(mockPrisma.product.findUnique).toHaveBeenCalledOnce()
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
    expect(revalidatePath).toHaveBeenCalledWith('/account/orders')
    expect(revalidatePath).toHaveBeenCalledWith('/products/1')
  })

  it('returns out-of-stock message when stock is insufficient', async () => {
    authMock.mockResolvedValue({ user: { id: 'test-user-id', role: 'USER' } })

    mockPrisma.product.findUnique.mockResolvedValue({
      id: 1,
      price: { mul: vi.fn(() => 200) },
      name: 'Test Product',
      stock: 1,
    })

    const result = await createOrderAction(makeFormData('1', '2'))

    expect(result.success).toBe(false)
    expect(result.message).toContain('out of stock')
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })
})
