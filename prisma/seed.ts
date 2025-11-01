import { Role, Currency } from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SALT_ROUNDS = 10
const ADMIN_PASSWORD = 'admin123'

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  console.log('Prisma server started')

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS)
  const adminEmail = 'admin@admin.com'

  await prisma.user.deleteMany({
    where: {
      email: adminEmail,
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Super Admin',
      role: Role.ADMIN,
    },
  })

  console.log(`Admin user created successfully with ${adminUser.email}`)
  console.log(`Password, hash demo: ${ADMIN_PASSWORD} -> ${hashedPassword}`)

  const categoriesToCreate = ['Electronics', 'Clothing', 'Books', 'Home and Garden']

  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  const createdCategories = []

  for (const name of categoriesToCreate) {
    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
      },
    })
    createdCategories.push(category)
  }
  console.log(`Create ${createdCategories.length} categories.`)

  const productsToCreate = 15
  const productsData = []

  for (let i = 1; i <= productsToCreate; i++) {
    const categoryIndex = i % createdCategories.length
    const category = createdCategories[categoryIndex]
    const name = `${category.name} Product #${i}`

    const price = Math.floor(Math.random() * 900 + 100) + Math.random() // от 100 до 100
    const stock = Math.floor(Math.random() * 100) + 1 // от 1 до 100

    productsData.push({
      name,
      slug: slugify(name),
      description: `Detailed description for ${name}. This is a test product in the "${category.name}" category.`,
      price: price.toFixed(2),
      images: [`https://picsum.photos/id/${100 + i}/300/300`, `https://picsum.photos/id/${100 + i + 1}/300/300`],
      stock,
      isActive: true,
      categoryId: category.id,
    })
  }

  await prisma.product.createMany({
    data: productsData,
  })
  console.log(`${productsToCreate} test products created.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
