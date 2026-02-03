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

export type CatalogSort = 'newest' | 'price_asc' | 'price_desc'

export interface CatalogQuery {
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sort: CatalogSort
  page: number
  limit: number
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
