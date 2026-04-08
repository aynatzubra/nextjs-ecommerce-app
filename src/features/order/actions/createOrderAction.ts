'use server'

import { auth } from '@/features/auth/lib/auth'
import * as z from 'zod'
import { revalidatePath } from 'next/cache'
import { createOrderService, ProductOutOfStockError } from '@/features/order/services/createOrderService'

const CreateOrderSchema = z.strictObject({
  productId: z.coerce.number().int().positive({ message: 'Invalid product ID.' }),
  quantity: z.coerce.number().int().min(1, { message: 'Minimum 1 product.' }),
})

type ActionState = {
  success: boolean
  message?: string
}

export async function createOrderAction(formData: FormData): Promise<ActionState> {
  const rawData = {
    productId: formData.get('productId'),
    quantity: formData.get('quantity'),
  }

  const validation = CreateOrderSchema.safeParse(rawData)
  if (!validation.success) {
    const errors = z.flattenError(validation.error).fieldErrors

    return { success: false, message: JSON.stringify(errors) }
  }

  const { productId, quantity } = validation.data

  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Auth error. Please sing in to create order.' }
  }

  try {
    await createOrderService({
      userId: session.user.id,
      productId,
      quantity,
    })

    revalidatePath(`/account/orders`)
    revalidatePath(`/products/${productId}`)

    return { success: true, message: 'The order has been sent successfully.' }
  } catch (error) {
    if (error instanceof ProductOutOfStockError) {
      return { success: false, message: 'The product was not found or is out of stock.' }
    }
    console.error('Create order failed', error)
    return { success: false, message: 'Failed to create order due to internal server error.' }
  }
}
