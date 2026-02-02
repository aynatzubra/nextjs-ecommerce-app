import { CatalogQuery, CatalogSearchParams, CatalogSort } from '@/entities/product/model/catalog.types'
import { catalogSearchParamsSchema } from '@/entities/product/model/catalog.schema'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 12
const MAX_LIMIT = 48
const DEFAULT_SORT: CatalogSort = 'newest'

function toInt(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : undefined
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function clampInt(n: number, min: number, max: number): number {
  if (n < min) return min
  if (n > max) return max
  return n
}

function parseBoolLike(value: string | undefined): boolean | undefined {
  if (!value) return undefined
  const v = value.trim().toLowerCase()

  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false

  return undefined
}

export function normalizeCatalogSearchParams(params: CatalogSearchParams): CatalogQuery {
  const parsed = catalogSearchParamsSchema.safeParse(params)
  const data = parsed.success ? parsed.data : {}

  const pageRaw = toInt(data.page)
  const page = pageRaw && pageRaw > 0 ? pageRaw : DEFAULT_PAGE

  const limitRaw = toInt(data.limit)
  const limit = clampInt(limitRaw && limitRaw > 0 ? limitRaw : DEFAULT_LIMIT, 1, MAX_LIMIT)

  const sort: CatalogSort = data.sort ?? DEFAULT_SORT

  const categorySlug = data.category

  let minPrice = toNumber(data.min)
  let maxPrice = toNumber(data.max)

  if (minPrice !== undefined && minPrice < 0) minPrice = 0
  if (maxPrice !== undefined && maxPrice < 0) maxPrice = undefined

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    const tmp = minPrice
    minPrice = maxPrice
    maxPrice = tmp
  }

  const inStock = parseBoolLike(data.inStock)

  return {
    categorySlug,
    minPrice,
    maxPrice,
    inStock,
    sort,
    page,
    limit,
  }
}
