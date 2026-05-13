import type { CartCurrency } from '@/entities/cart'

export interface AddToCartButtonProps {
  productId: number
  name: string
  price: number
  currency: CartCurrency
  quantity?: number
  className?: string
  imageUrl?: string
  stock: number
}
