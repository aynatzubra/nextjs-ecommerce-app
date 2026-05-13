'use client'

import { useCart } from '@/entities/cart'
import { AddToCartButtonProps } from '@/features/catalog/add-to-cart/types'

export function AddToCartButton({
  productId,
  name,
  price,
  currency,
  imageUrl,
  quantity = 1,
  className,
  stock
}: AddToCartButtonProps) {
  const { addItem } = useCart()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()

    addItem(
      {
        productId,
        name,
        price,
        currency,
        imageUrl,
        lastKnownStock: stock,
      },
      quantity,
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ?? 'w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800'
      }
    >
      Add to cart
    </button>
  )
}
