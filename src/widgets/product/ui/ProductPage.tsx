import { ProductDetailsView } from '@/widgets/product/ui/ProductDetailsView'
import type { ProductDetails } from '@/entities/product'

interface ProductPageProps {
  product: ProductDetails
}

export function ProductPage({ product }: ProductPageProps) {
  return (
    <section className="space-y-6">
      <ProductDetailsView product={product} />
    </section>
  )
}
