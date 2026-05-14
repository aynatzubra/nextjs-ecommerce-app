import { ProductListItem } from '@/entities/product'

export type CatalogSearchParams = {
  category?: string
  min?: string
  max?: string
  inStock?: string
  sort?: string
  page?: string
  limit?: string
}

export type Option = { value: string; label: string }

export const SORT_OPTIONS: Option[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
]

export const LIMIT_OPTIONS: Option[] = [
  { value: '12', label: '12' },
  { value: '24', label: '24' },
  { value: '48', label: '48' },
]

export const DEFAULT_SORT = 'newest'
export const DEFAULT_LIMIT = 12
export const MAX_LIMIT = 48

export type CatalogSort = 'newest' | 'price_asc' | 'price_desc'

export interface CatalogQuery {
  page: number
  limit: number
  sort: CatalogSort
  inStock?: boolean
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
}

export interface CatalogPaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface CatalogResult<TItem = ProductListItem> {
  items: TItem[]
  meta: CatalogPaginationMeta
}
