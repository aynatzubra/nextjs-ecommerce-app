import { ProductGrid } from '@/widgets/catalog'
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
  // console.log('searchParams:', sp)
  const raw = toCatalogSearchParams(sp)
  // console.log('raw:', raw)
  const query = normalizeCatalogSearchParams(raw)
  // console.log('query:', query)

  const { items, meta } = await getCatalogProductsPage(query)
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
        <p className="text-sm text-zinc-600">Browse products with URL-driven filter</p>

        {/* to see if URL is work  */}
        <div className="text-xs text-zinc-500">
          <span>
            Page {meta.page} / {meta.totalPages}
          </span>
          <span className="mx-2">•</span>
          <span>{meta.total} items</span>
          <span className="mx-2">•</span>
          <span>Limit: {meta.limit}</span>
        </div>
      </header>

      <ProductGrid products={items} />

      {/*Pagination UI*/}
    </section>
  )
}
