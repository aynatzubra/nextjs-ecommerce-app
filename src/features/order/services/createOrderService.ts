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
        price: true,
        name: true,
      },
    })
    
    const totalAmount = product.price.mul(quantity)
    
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
    return {
      order: createdOrder,
      totalAmount,
    }
  })
  
  return {
    orderId: result.order.id,
    totalAmount: result.totalAmount,
  }
}
