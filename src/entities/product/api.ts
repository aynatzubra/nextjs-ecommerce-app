import { prisma } from '@/shared/lib/prisma'
import { ProductDetails, ProductListItem } from '@/entities/product/types'
import { CatalogQuery, CatalogResult, CatalogSort } from './model'
import type { Prisma } from '@prisma/client'

const FALLBACK_LIST_IMAGE = 'https://placehold.co/600x600/111111/F5F5F5?text=No+Image'
const FALLBACK_DETAILS_IMAGE = 'https://placehold.co/800x800/111111/F5F5F5?text=No+Image'

function clampInt(n: number, min: number, max: number): number {
  if (n < min) return min
  if (n > max) return max
  return n
}

function buildWhere(q: CatalogQuery): Prisma.ProductWhereInput {
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

function buildOrderBy(sort: CatalogSort): NonNullable<Parameters<typeof prisma.product.findMany>[0]>['orderBy'] {
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

export async function getCatalogProductsPage(
  query: CatalogQuery,
): Promise<CatalogResult<ProductListItem>> {
  
  const where = buildWhere(query)
  const orderBy = buildOrderBy(query.sort)
  
  const total = await prisma.product.count({ where })
  
  const totalPages = total === 0 ? 1 : Math.ceil(total / query.limit)
  const page = clampInt(query.page, 1, totalPages) //runtime pagination reconciliation
  
  const skip = (page - 1) * query.limit
  const take = query.limit
  
  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy,
    skip,
    take,
  })
  
  const hasPrev = page > 1
  const hasNext = page < totalPages
  
  const items: ProductListItem[] = products.map((p) => {
    const firstImage = p.images[0] ?? FALLBACK_LIST_IMAGE
    
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      imageUrl: firstImage,
      categoryName: p.category?.name ?? 'Uncategorized',
      inStock: p.stock > 0,
      stock: p.stock,
    }
  })
  
  return {
    items,
    meta: {
      page,
      limit: query.limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  }
}

export async function getCatalogProducts(
  query: CatalogQuery,
): Promise<ProductListItem[]> {
  const result = await getCatalogProductsPage(query)
  return result.items
}

export async function getProductBySlug(slug: string): Promise<ProductDetails | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  })
  
  if (!product) return null
  
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    images: product.images.length > 0 ? product.images : [FALLBACK_DETAILS_IMAGE],
    categoryName: product.category?.name ?? 'Uncategorized',
    inStock: product.stock > 0,
  }
}
