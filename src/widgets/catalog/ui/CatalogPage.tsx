import { CatalogFilters } from '@/widgets/catalog/ui/CatalogFilters'
import { ProductGrid } from '@/widgets/catalog/ui/ProductGrid'
import type { ProductListItem } from '@/entities/product'

interface CatalogPageProps {
  products: ProductListItem[]
  categories: { value: string; label: string }[]
}

export async function CatalogPage({ products, categories }: CatalogPageProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
        <CatalogFilters categories={categories} />
      </header>

      <ProductGrid products={products} />

      {/*Pagination UI*/}
    </section>
  )
}
