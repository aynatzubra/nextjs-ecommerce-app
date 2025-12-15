import { prisma } from '@/lib/prisma'
import type { ProductListItem } from './types'

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
    } satisfies ProductListItem
  })
}
