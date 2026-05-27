'use client'

import { ProductDetails } from '@/entities/product'
import { AddToCartButton } from '@/features/catalog/add-to-cart'
import { useState } from 'react'
import type { CartCurrency } from '@/entities/cart'

interface ProductDetailsProps {
  product: ProductDetails
}

export function ProductDetailsView({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const currency: CartCurrency = 'MDL'
  
  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }
  
  const handleIncrease = () => {
    setQuantity((prev) => prev + 1)
  }
  
  return (
    <section className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      {/* Gallery */}
      <div className="space-y-4">
        <div className="aspect-square w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        </div>
        
        {product.images.length > 1 && (
          <div className="flex gap-2">
            {product.images.slice(1).map((img, index) => (
              <div key={img + index} className="h-16 w-16 overflow-hidden rounded border border-zinc-200 bg-zinc-50">
                <img src={img} alt={`${product.name} thumbnail ${index + 2}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Info + Add to cart */}
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{product.categoryName}</p>
        
        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
        
        <p className="text-sm text-zinc-600">{product.description}</p>
        
        <div className="flex items-center gap-4 pt-2">
          <span className="text-xl font-semibold text-zinc-900">
            {product.price.toFixed(2)} {currency}
          </span>
          {product.inStock ? (
            <span className="text-xs text-emerald-600">In stock</span>
          ) : (
            <span className="text-xs text-red-500">Out of stock</span>
          )}
        </div>
        
        {/* Quantity + Add to cart */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-2">
            <button
              type="button"
              className="text-lg leading-none text-zinc-600 hover:text-zinc-900"
              onClick={handleDecrease}
            >
              −
            </button>
            <span className="min-w-[2ch] text-center text-sm text-zinc-900">{quantity}</span>
            <button
              type="button"
              className="text-lg leading-none text-zinc-600 hover:text-zinc-900"
              onClick={handleIncrease}
            >
              +
            </button>
          </div>
          
          <div className="flex-1">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.images[0]}
              currency={currency}
              quantity={quantity}
              stock={product.stock}
              className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-50 hover:bg-zinc-800"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
