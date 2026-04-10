import { CatalogFilters } from '@/widgets/catalog/ui/CatalogFilters'
import { ProductGrid } from '@/widgets/catalog/ui/ProductGrid'
import type { ProductListItem } from '@/entities/product'
import { CatalogPagination } from '@/widgets/catalog'

interface CatalogPaginationMeta {
  page: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
}

interface CatalogPageProps {
  products: ProductListItem[]
  categories: { value: string; label: string }[]
  pagination: CatalogPaginationMeta
}

export function CatalogPage({ products, categories, pagination }: CatalogPageProps) {
  console.log(pagination)
  
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
        <CatalogFilters categories={categories} />
      </header>

      <ProductGrid products={products} />
      
      <CatalogPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        hasPrev={pagination.hasPrev}
        hasNext={pagination.hasNext}
      />
    </section>
  )
}
