import Link from 'next/link'
import type { ProductListItem } from '@/entities/product'
import { AddToCartButton } from '@/features/catalog/add-to-cart'
import type { CartCurrency } from '@/entities/cart'

interface ProductCardProps {
  product: ProductListItem
}

export function ProductCard({ product }: ProductCardProps) {
  const currency: CartCurrency = 'MDL'
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <Link href={`/catalog/${product.slug}`} className="flex flex-1 flex-col">
        <div className="aspect-square w-full bg-zinc-100">
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{product.categoryName}</p>

          <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">{product.name}</h3>

          <p className="line-clamp-2 text-xs text-zinc-500">{product.description}</p>

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-sm font-semibold text-zinc-900">{product.price.toFixed(2)} MDL</span>
            {product.inStock ? (
              <span className="text-xs text-emerald-600">In stock</span>
            ) : (
              <span className="text-xs text-red-500">Out of stock</span>
            )}
          </div>
        </div>
      </Link>
      <div className="border-t border-zinc-200 p-4">
        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={product.price}
          currency={currency}
          imageUrl={product.imageUrl}
          stock={product.stock}
          quantity={1}
        />
      </div>
    </article>
  )
}
