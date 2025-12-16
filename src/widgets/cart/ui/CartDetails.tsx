'use client'

import { useCart } from '@/entities/cart'
import Link from 'next/link'

export function CartDetails() {
  const { items, totalPrice, totalQuantity, removeItem, updateQuantity, clearCart, isHydrated } = useCart()

  //Until the zustand-persist is hydrated, don't touch the UI.
  if (!isHydrated) {
    return (
      <div className="container mx-auto p-6 font-sans">
        <p className="text-sm text-zinc-600">Loading cart ...</p>
      </div>
    )
  }

  //If empty cart
  if (items.length === 0) {
    return (
      <div className="container mx-auto p-6 font-sans">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">Cart</h1>
        <p className="mb-4 text-sm text-zinc-600">Your cart is empty.</p>
        <Link
          href="/catalog"
          className="inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800"
        >
          Go to catalog
        </Link>
      </div>
    )
  }

  const currency = items[0]?.currency ?? 'MDL'

  const handleDecrease = (productId: number, currentQty: number) => {
    const nextQty = currentQty - 1
    if (nextQty <= 0) {
      // Remove product if qty = 0
      removeItem(productId)
    } else {
      updateQuantity(productId, nextQty)
    }
  }

  const handleIncrease = (productId: number, currentQty: number) => {
    const nextQty = currentQty + 1
    updateQuantity(productId, nextQty)
  }

  return (
    <div className="container mx-auto p-6 font-sans">
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#111111] text-white">
              {/* Cell for cress */}
              <th className="p-4 text-left w-12 rounded-tl-2xl"></th>
              {/* Cell for image */}
              <th className="p-4 w-24"></th>
              <th className="p-4 text-left font-bold">Product</th>
              <th className="p-4 text-center font-bold">Price</th>
              <th className="p-4 text-center font-bold">Quantity</th>
              <th className="p-4 text-center font-bold rounded-tr-2xl">Subtotal</th>
            </tr>
          </thead>

          {/* Products List */}
          <tbody className="bg-white">
            {items.map((item) => (
              <tr key={item.productId} className="border-b border-gray-200">
                {/* Remove btn */}
                <td className="p-4 text-center border-l border-gray-200">
                  <button
                    className="text-red-500 hover:text-red-700 font-bold text-xl"
                    onClick={() => removeItem(item.productId)}
                  >
                    ×
                  </button>
                </td>

                {/* Product Image */}
                <td className="p-4">
                  <div className="w-16 h-16 bg-purple-100 p-1">
                    <img
                      src={item.imageUrl ?? 'https://placehold.co/100x100/111111/F5F5F5?text=Img'}
                      alt={item.name}
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </div>
                </td>

                {/* Product name */}
                <td className="p-4 text-gray-900 font-bold border-r border-gray-200">{item.name}</td>

                {/* Price */}
                <td className="p-4 text-center text-gray-600 border-r border-gray-200">
                  {item.currency}
                  {item.price.toFixed(2)}
                </td>

                {/* quantity */}
                <td className="p-4 text-center border-r border-gray-200">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1">
                    <button
                      type="button"
                      className="text-lg leading-none text-gray-500 hover:text-gray-800"
                      onClick={() => handleDecrease(item.productId, item.quantity)}
                    >
                      −
                    </button>

                    <span className="min-w-[2ch] text-center text-sm text-gray-900">{item.quantity}</span>

                    <button
                      type="button"
                      className="text-lg leading-none text-gray-500 hover:text-gray-800"
                      onClick={() => handleIncrease(item.productId, item.quantity)}
                    >
                      +
                    </button>
                  </div>
                </td>

                {/* Summary */}
                <td className="p-4 text-center text-gray-600 border-r border-gray-200">
                  {item.currency}
                  {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Block */}
      <div className="flex justify-end space-y-4">
        <div className="w-full md:w-1/2 lg:w-1/3 border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight">Order summary</h2>

          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Items</dt>
              <dd className="font-medium text-zinc-900">{totalQuantity}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd className="font-medium text-zinc-900">{totalPrice.toFixed(2)} USD</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Shipping</dt>
              <dd className="text-zinc-500">Calculated at checkout</dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-zinc-200 pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-zinc-500">Total</span>
              <span className="text-lg font-semibold text-zinc-900">
                {totalPrice.toFixed(2)} {currency} USD
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              className="w-full rounded-full bg-zinc-900 px-4 py-4 text-sm uppercase font-bold text-zinc-50 hover:bg-zinc-800"
            >
              Proceed to checkout
            </button>
            <button
              type="button"
              className="w-full rounded-full border border-zinc-300 px-4 py-4 text-sm uppercase font-bold text-zinc-700 hover:bg-zinc-100"
              onClick={clearCart}
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
