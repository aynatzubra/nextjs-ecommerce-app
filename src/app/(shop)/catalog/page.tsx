import { CatalogFilters, ProductGrid } from '@/widgets/catalog'
import { CatalogSearchParams, getCatalogProductsPage, normalizeCatalogSearchParams } from '@/entities/product'

export const revalidate = 86400 // 24 our

type NextSearchParams = Record<string, string | string[] | undefined>

function toCatalogSearchParams(searchParams: NextSearchParams): CatalogSearchParams {
  const pick = (key: string): string | undefined => {
    const v = searchParams[key]
    if (Array.isArray(v)) return v[0]
    return v
  }

  return {
    category: pick('category'),
    min: pick('min'),
    max: pick('max'),
    inStock: pick('inStock'),
    sort: pick('sort'),
    page: pick('page'),
    limit: pick('limit'),
  }
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<NextSearchParams> }) {
  const sp = await searchParams
  const raw = toCatalogSearchParams(sp)
  const query = normalizeCatalogSearchParams(raw)

  const { items, meta } = await getCatalogProductsPage(query)
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
        <CatalogFilters />
      </header>

      <ProductGrid products={items} />

      {/*Pagination UI*/}
    </section>
  )
}
