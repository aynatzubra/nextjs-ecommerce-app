import { prisma } from '@/shared/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export type CreateOrderInput = {
  userId: string
  productId: number
  quantity: number
}

export type CreateOrderResult = {
  orderId: number
  totalAmount: Decimal
}

export class ProductOutOfStockError extends Error {
  constructor() {
    super('PRODUCT_OUT_OF_STOCK')
  }
}

export async function createOrderService({
  userId,
  productId,
  quantity,
}: CreateOrderInput): Promise<CreateOrderResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, name: true, stock: true },
  })

  if (!product || product.stock < quantity) {
    throw new ProductOutOfStockError()
  }

  const totalAmount = product.price.mul(quantity)

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        items: {
          create: {
            productId,
            productName: product.name,
            price: product.price,
            quantity,
          },
        },
      },
    })
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    })

    return createdOrder
  })

  return { orderId: order.id, totalAmount }
}
