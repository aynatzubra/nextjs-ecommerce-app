import { prisma } from '@/shared/lib/prisma'
import { ProductDetails, ProductListItem } from '@/entities/product/types'
import { CatalogQuery, CatalogResult, CatalogSort } from './model'
import type { Prisma } from '@prisma/client'

const DEFAULT_CATALOG_QUERY: CatalogQuery = { sort: 'newest', page: 1, limit: 12 }
const FALLBACK_LIST_IMAGE = 'https://placehold.co/600x600/111111/F5F5F5?text=No+Image'
const FALLBACK_DETAILS_IMAGE = 'https://placehold.co/800x800/111111/F5F5F5?text=No+Image'

function safePage(n: number | undefined): number {
  if (!n || !Number.isFinite(n) || n < 1) return 1
  return Math.min(Math.floor(n), 100_000)
}

function safeLimit(n: number | undefined): number {
  if (!n || !Number.isFinite(n) || n < 1) return DEFAULT_CATALOG_QUERY.limit
  return Math.min(Math.floor(n), 48) // MAX_LIMIT in normalize
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

export async function getCatalogProductsPage(query?: CatalogQuery): Promise<CatalogResult<ProductListItem>> {
  const base = query ?? DEFAULT_CATALOG_QUERY

  const page = safePage(base.page)
  const limit = safeLimit(base.limit)

  const q: CatalogQuery = {
    ...base,
    page,
    limit,
  }

  const where = buildWhere(q)
  const orderBy = buildOrderBy(q.sort)

  const skip = (q.page - 1) * q.limit
  const take = q.limit

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take,
    }),
  ])

  const totalPages = total === 0 ? 1 : Math.ceil(total / q.limit)
  const hasPrev = q.page > 1
  const hasNext = q.page < totalPages

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
      page: q.page,
      limit: q.limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  }
}

export async function getCatalogProducts(query?: CatalogQuery): Promise<ProductListItem[]> {
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
