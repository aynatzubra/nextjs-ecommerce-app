import { prisma } from '@/lib/prisma'

export interface CategoryOption {
  slug: string
  name: string
}

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { slug: true, name: true },
  })

  return categories
}
