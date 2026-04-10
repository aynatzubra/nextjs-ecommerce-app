import { CatalogPage } from '@/widgets/catalog'
import { getCatalogProductsPage, normalizeCatalogSearchParams } from '@/entities/product'
import { toCatalogSearchParams } from '@/entities/product/lib'
import { getCategoryOptions } from '@/entities/category'

type NextSearchParams = Record<string, string | string[] | undefined>

type Props = {
  searchParams: Promise<NextSearchParams> | NextSearchParams
}

export default async function CatalogPageRoute({ searchParams }: Props) {
  const sp = await searchParams
  const raw = toCatalogSearchParams(sp)
  const query = normalizeCatalogSearchParams(raw)
  
  const categoryOptions = await getCategoryOptions()
  
  const categories = categoryOptions.map((c) => ({ value: c.slug, label: c.name }))
  
  const { items, meta } = await getCatalogProductsPage(query)
  
  return (
    <CatalogPage
      products={items}
      categories={categories}
      pagination={{
        page: meta.page,
        totalPages: meta.totalPages,
        hasPrev: meta.hasPrev,
        hasNext: meta.hasNext,
      }}
    />
  )
}
