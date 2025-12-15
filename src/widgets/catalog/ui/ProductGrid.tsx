import type { ProductListItem } from '@/entities/product'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: ProductListItem[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="text-sm text-zinc-600">There are currently no products available. Try again later.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
