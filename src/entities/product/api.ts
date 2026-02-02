import { prisma } from '@/lib/prisma'
import { ProductDetails, ProductListItem } from './types'

export async function getCatalogProducts(): Promise<ProductListItem[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return products.map((p) => {
    const firstImage = p.images[0] ?? 'https://placehold.co/600x600/111111/F5F5F5?text=No+Image'

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
    images: product.images.length > 0 ? product.images : ['https://placehold.co/800x800/111111/F5F5F5?text=No+Image'],
    categoryName: product.category?.name ?? 'Uncategorized',
    inStock: product.stock > 0,
  }
}
