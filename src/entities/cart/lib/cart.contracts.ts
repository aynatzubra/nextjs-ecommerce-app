import { CartItem, CartItemId } from '@/entities/cart/types'

export function normalizeQuantity(quantity: number, stock: number): number {
  const safeQty = Number.isFinite(quantity) ? Math.trunc(quantity) : 1
  const safeStock = Number.isFinite(stock) ? Math.trunc(stock) : 0
  if (safeStock <= 0) return 0
  return Math.max(1, Math.min(safeQty, safeStock))
}

export function addCartItem(
  items: CartItem[],
  item: Omit<CartItem, 'quantity'>,
  quantity: number,
): CartItem[] {
  const safeQuantity = normalizeQuantity(quantity, item.lastKnownStock)
  if (safeQuantity <= 0) return items

  const existing = items.find((i) => i.productId === item.productId)

  if (existing) {
    const nextQuantity = normalizeQuantity(
      existing.quantity + quantity,
      item.lastKnownStock,
    )
    return items.map((i) =>
      i.productId === item.productId
        ? {
            ...i,
            quantity: nextQuantity,
            lastKnownStock: item.lastKnownStock,
          }
        : i,
    )
  }

  return [
    ...items,
    {
      ...item,
      quantity: safeQuantity,
    },
  ]
}

export function updateCartItem(
  items: CartItem[],
  productId: CartItemId,
  quantity: number,
  availableStock: number,
): CartItem[] {
  const existing = items.find((i) => i.productId === productId)
  
  if (!existing) {
    return items
  }
  
  if (quantity <= 0) {
    return items.filter((i) => i.productId !== productId)
  }

  const safeQuantity = normalizeQuantity(quantity, availableStock)
  
  if (safeQuantity <= 0) {
    return items.filter((i) => i.productId !== productId)
  }
  
  if (
    existing.quantity === safeQuantity &&
    existing.lastKnownStock === availableStock
  ) {
    return items
  }
  
  return items.map((i) =>
    i.productId === productId
      ? {
          ...i,
          quantity: safeQuantity,
          lastKnownStock: availableStock,
        }
      : i,
  )
}

export function removeCartItem(
  items: CartItem[],
  productId: CartItemId,
): CartItem[] {
  const hasItem = items.some((i) => i.productId === productId)
  if (!hasItem) return items //render bailout
  
  return items.filter((i) => i.productId !== productId)
}

export function getTotalQuantity(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function getTotalPrice(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
