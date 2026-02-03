import { prisma } from '@/lib/prisma'
import { ProductDetails, ProductListItem } from '@/entities/product/types'
import { CatalogQuery } from './model'

const DEFAULT_CATALOG_QUERY: CatalogQuery = { sort: 'newest', page: 1, limit: 12 }
const FALLBACK_LIST_IMAGE = 'https://placehold.co/600x600/111111/F5F5F5?text=No+Image'
const FALLBACK_DETAILS_IMAGE = 'https://placehold.co/800x800/111111/F5F5F5?text=No+Image'

export async function getCatalogProducts(query?: CatalogQuery): Promise<ProductListItem[]> {
  const q: CatalogQuery = query ?? DEFAULT_CATALOG_QUERY

  const where: NonNullable<Parameters<typeof prisma.product.findMany>[0]>['where'] = {
    isActive: true,
  }

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

  const orderBy: NonNullable<Parameters<typeof prisma.product.findMany>[0]>['orderBy'] = (() => {
    switch (q.sort) {
      case 'price_asc':
        return [{ price: 'asc' }, { id: 'desc' }]
      case 'price_desc':
        return [{ price: 'desc' }, { id: 'desc' }]
      case 'newest':
      default:
        return [{ createdAt: 'desc' }, { id: 'desc' }]
    }
  })()

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
    },
    orderBy,
  })

  return products.map((p) => {
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
    } satisfies ProductListItem
  })
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
