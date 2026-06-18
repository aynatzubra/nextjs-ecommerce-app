import { PrismaClient } from '@prisma/client'

import { seedAdmin } from './seed-admin'
import { seedDemoData } from './demo-seed'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed sequence...')
  
  await prisma.$transaction(async (tx) => {
    await seedAdmin(tx)
  })
  
  if (process.env.SEED_DEMO_DATA !== 'true') {
    console.log(
      'Seed sequence finished. (Demo data skipped. Set SEED_DEMO_DATA=true to populate).',
    )
    return
  }
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL: Execution of demo seed is strictly forbidden in the production environment.',
    )
  }
  
  await prisma.$transaction(async (tx) => {
    await seedDemoData(tx)
  })
  
  console.log('Seed sequence finished successfully.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })