import { randomUUID } from 'crypto'

import { Decimal } from '@prisma/client/runtime/library'

import { prisma } from '@/shared/lib/prisma'

export type CreateOrderInput = {
  userId: string
  productId: number
  quantity: number
  requestId?: string
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
  requestId = randomUUID(),
}: CreateOrderInput): Promise<CreateOrderResult> {
  const result = await prisma.$transaction(async (tx) => {
    const stockUpdate = await tx.product.updateMany({
      where: {
        id: productId,
        stock: {
          gte: quantity,
        },
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    })

    if (stockUpdate.count !== 1) {
      throw new ProductOutOfStockError()
    }

    const product = await tx.product.findUniqueOrThrow({
      where: {
        id: productId,
      },
      select: {
        name: true,
        slug: true,
        sku: true,
        price: true,
        currency: true,
        images: true,
      },
    })

    const lineTotal = product.price.mul(quantity)

    const createdOrder = await tx.order.create({
      data: {
        requestId,
        userId,
        totalAmount: lineTotal,
        status: 'PENDING',
        currency: product.currency,
        items: {
          create: {
            productId,
            title: product.name,
            productSlug: product.slug,
            sku: product.sku,
            productImage: product.images[0] ?? null,
            price: product.price,
            currency: product.currency,
            quantity,
            lineTotal,
          },
        },
      },
    })

    return {
      order: createdOrder,
      totalAmount: lineTotal,
    }
  })

  return {
    orderId: result.order.id,
    totalAmount: result.totalAmount,
  }
}
