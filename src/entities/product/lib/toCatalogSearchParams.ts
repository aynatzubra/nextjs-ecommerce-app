import { CatalogSearchParams } from '@/entities/product'
type NextSearchParams = Record<string, string | string[] | undefined>

export function toCatalogSearchParams(searchParams: NextSearchParams): CatalogSearchParams {
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
