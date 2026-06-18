import { Prisma } from '@prisma/client'
import { productsData } from './demo-products'
import { slugify } from '@/shared/lib/text/slugify'

export async function seedDemoData(tx: Prisma.TransactionClient) {
  const categoriesToCreate = Array.from(
    new Set(productsData.map((p) => p.categoryName)),
  )
  const targetCategorySlugs = categoriesToCreate.map(slugify)
  
  const targetProductSlugs = productsData.map((p) => slugify(p.name))
  
  const seenSlugs = new Set<string>()
  const duplicates = new Set<string>()
  
  for (const slug of targetProductSlugs) {
    if (seenSlugs.has(slug)) {
      duplicates.add(slug)
    }
    
    seenSlugs.add(slug)
  }
  
  if (duplicates.size > 0) {
    const duplicateList = [...duplicates].join(', ')
    
    throw new Error(
      `Demo Data Contract Violation: Duplicate product slugs detected (${duplicateList}).`,
    )
  }
  
  // Remove orphaned demo products
  const { count: prunedProductsCount } = await tx.product.deleteMany({
    where: {
      category: {
        slug: { in: targetCategorySlugs },
      },
      slug: { notIn: targetProductSlugs },
    },
  })
  
  if (prunedProductsCount > 0) {
    console.log(`Demo Data: Pruned ${prunedProductsCount} orphaned product(s).`)
  }
  
  // Upsert Categories
  const createdCategories: Prisma.CategoryGetPayload<{}>[] = []
  
  for (const name of categoriesToCreate) {
    const slug = slugify(name)
    const category = await tx.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    })
    createdCategories.push(category)
  }
  
  const categoryBySlug: Record<
    string,
    Prisma.CategoryGetPayload<{}>
  > = Object.fromEntries(
    createdCategories.map((c) => [c.slug, c]),
  )
  
  // Upsert Products
  for (const product of productsData) {
    const categorySlug = slugify(product.categoryName)
    const category = categoryBySlug[categorySlug]
    
    if (!category) {
      throw new Error(`Demo Data Contract Violation: Category "${product.categoryName}" not found for product "${product.name}".`)
    }
    
    const slug = slugify(product.name)
    
    await tx.product.upsert({
      where: { slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        stock: product.stock,
        isActive: product.isActive ?? true,
        categoryId: category.id,
      },
      create: {
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        images: product.images,
        stock: product.stock,
        isActive: product.isActive ?? true,
        categoryId: category.id,
      },
    })
  }
  
  console.log(`Demo Data: Synchronized ${categoriesToCreate.length} categories and ${productsData.length} products.`)
}