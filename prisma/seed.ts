import { Role, Currency } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

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
      passwordHash: hashedPassword,
    },
  })

  console.log(`Admin user created successfully with ${adminUser.email}`)
  console.log(`Password, hash demo: ${ADMIN_PASSWORD} -> ${hashedPassword}`)

  const categoriesToCreate = ['Bondage & Restraints', 'Blindfolds & Masks', 'Impact Toys', 'Accessories']

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

  const categoryByName = Object.fromEntries(createdCategories.map((c) => [c.name, c]))

  const productsData = [
    {
      name: 'Soft Cotton Cuffs (Red)',
      categoryName: 'Bondage & Restraints',
      price: '200.00',
      stock: 0,
      isActive: false,
      description:
        'Soft padded cotton cuffs for comfortable beginner-friendly bondage. Adjustable size with secure metal D-rings.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Cotton+Cuffs+Red'],
    },
    {
      name: 'Soft Cotton Cuffs (Black)',
      categoryName: 'Bondage & Restraints',
      price: '210.00',
      stock: 18,
      description:
        'Classic black cuffs with soft inner lining for longer roleplay sessions. Metal hardware for reliable fixation.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Cotton+Cuffs+Black'],
    },
    {
      name: 'Silky Bondage Rope 10m',
      categoryName: 'Bondage & Restraints',
      price: '2050.00',
      stock: 0,
      description:
        'Smooth braided rope designed for body-safe bondage. Medium thickness and soft texture for comfortable tying.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Bondage+Rope'],
    },
    {
      name: 'Beginner Metal Cuffs',
      categoryName: 'Bondage & Restraints',
      price: '190.00',
      stock: 25,
      description:
        'Metal cuffs with safety mechanism and included keys. Good option for those who prefer a more solid restraint.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Metal+Cuffs'],
    },
    {
      name: 'Blindfold Classic Black',
      categoryName: 'Blindfolds & Masks',
      price: '150.00',
      stock: 40,
      description:
        'Soft black blindfold that blocks light and helps focus on sensations. Elastic strap fits most head sizes.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Blindfold+Black'],
    },
    {
      name: 'Feather Tickler',
      categoryName: 'Accessories',
      price: '100.00',
      stock: 35,
      isActive: false,
      description: 'Light feather tickler for gentle sensory play. Works well together with blindfolds and restraints.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Feather+Tickler'],
    },
    {
      name: 'First Time Flogger',
      categoryName: 'Impact Toys',
      price: '190.00',
      stock: 22,
      description:
        'Lightweight flogger suitable for beginners. Flexible falls and comfortable handle for controlled impact.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=First+Time+Flogger'],
    },
    {
      name: 'Leather Paddle',
      categoryName: 'Impact Toys',
      price: '1000.00',
      stock: 15,
      description:
        'Compact leather paddle for precise impact play. One side is smoother, the other slightly firmer for different sensations.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Leather+Paddle'],
    },
    {
      name: 'Bondage Tape (Red)',
      categoryName: 'Bondage & Restraints',
      price: '170.00',
      stock: 28,
      description:
        'Self-adhesive bondage tape that sticks to itself but not to skin or hair. Reusable and easy to remove.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Bondage+Tape+Red'],
    },
    {
      name: 'Blindfold & Cuffs Set',
      categoryName: 'Bondage & Restraints',
      price: '320.00',
      stock: 0,
      isActive: false,
      description:
        'Starter set that combines a soft blindfold and wrist cuffs. Simple way to create a basic restraint scenario.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Blindfold%2BCuffs'],
    },
    {
      name: 'Collar with Leash',
      categoryName: 'Accessories',
      price: '260.00',
      stock: 14,
      isActive: false,
      description:
        'Adjustable collar with detachable leash. Soft inner side and sturdy hardware for comfortable guided play.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Collar+%26+Leash'],
    },
    {
      name: 'Basic Nipple Clamps',
      categoryName: 'Accessories',
      price: '5000.00',
      stock: 18,
      description:
        'Adjustable clamps with soft tips. Tension can be tuned to personal comfort level for controlled stimulation.',
      images: ['https://placehold.co/600x600/111111/F5F5F5?text=Nipple+Clamps'],
    },
  ]

  const prismaProductsData = productsData.map((product) => {
    const category = categoryByName[product.categoryName]

    if (!category) {
      throw new Error(`Category "${product.categoryName}" not found for product "${product.name}"`)
    }

    return {
      name: product.name,
      slug: slugify(product.name),
      description: product.description,
      price: product.price, // Decimal в Prisma можно задавать строкой
      images: product.images,
      stock: product.stock,
      isActive: product.isActive ?? true,
      categoryId: category.id,
    }
  })

  await prisma.product.createMany({
    data: prismaProductsData,
  })
  console.log(`${prismaProductsData.length} BDSM products created.`)
  console.log('Seed finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
