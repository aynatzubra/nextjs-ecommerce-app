import { CatalogQuery, CatalogSort } from '@/entities/product'
import type { Prisma } from '@prisma/client'

export function buildWhere(q: CatalogQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true }
  
  if (q.categorySlug) {
    where.category = { slug: q.categorySlug }
  }
  
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    where.price = {}
    if (q.minPrice !== undefined) where.price.gte = q.minPrice
    if (q.maxPrice !== undefined) where.price.lte = q.maxPrice
  }
  
  if (q.inStock === true) {
    where.stock = { gt: 0 }
  } else if (q.inStock === false) {
    where.stock = { lte: 0 }
  }
  
  return where
}

export function buildOrderBy(sort: CatalogSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }, { id: 'desc' }]
    case 'price_desc':
      return [{ price: 'desc' }, { id: 'desc' }]
    case 'newest':
    default:
      return [{ createdAt: 'desc' }, { id: 'desc' }]
  }
}
