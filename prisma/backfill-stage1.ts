import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
import { PrismaClient } from '@prisma/client'

/**
 * Stage 1 backfill script.
 *
 * Idempotent: only fills rows where sku / requestId are NULL.
 * Run this AFTER the migration that added sku/requestId columns as nullable
 * and BEFORE the migration that sets them to NOT NULL.
 */

const prisma = new PrismaClient()

async function main() {
  console.log('Starting Stage 1 backfill...')

  const productsResult = await prisma.$executeRaw`
    UPDATE "Product"
    SET sku = slug
    WHERE sku IS NULL
  `

  console.log(`Backfilled ${productsResult} Product.sku values from slug.`)

  const ordersResult = await prisma.$executeRaw`
    UPDATE "Order"
    SET "requestId" = gen_random_uuid()
    WHERE "requestId" IS NULL
  `

  console.log(`Backfilled ${ordersResult} Order.requestId values.`)

  console.log('Stage 1 backfill completed.')
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
