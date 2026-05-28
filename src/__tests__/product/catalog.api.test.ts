import { type Mock, vi } from 'vitest'
import { mockPrisma } from '@/test-utils/mockPrisma'
import { CatalogQuery, getCatalogProductsPage } from '@/entities/product'
import { prisma } from '@/shared/lib/prisma'

vi.mock('@/shared/lib/prisma', () => ({
  prisma: mockPrisma,
}))

const makeQuery = (
  overrides: Partial<CatalogQuery> = {},
): CatalogQuery => ({
  page: 1,
  limit: 12,
  sort: 'newest',
  ...overrides,
})

describe('getCatalogProductsPage pagination contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('totalPages reconciliation contract', () => {
    it('computes totalPages for fractional remainder (total > limit)', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(25)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      const result = await getCatalogProductsPage(
        makeQuery({ page: 1, limit: 12 }),
      )
      
      expect(result.meta).toStrictEqual({
        page: 1,
        limit: 12,
        total: 25,
        totalPages: 3,
        hasPrev: false,
        hasNext: true,
      })
    })
    
    it('computes totalPages for exact division (total % limit === 0)', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(24)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      const result = await getCatalogProductsPage(
        makeQuery({ page: 2, limit: 12 }),
      )
      
      expect(result.meta).toStrictEqual({
        page: 2,
        limit: 12,
        total: 24,
        totalPages: 2,
        hasPrev: true,  // 2 > 1
        hasNext: false, // 2 is not < 2
      })
    })
    
    it('normalizes empty results to totalPages=1', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(0)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      const result = await getCatalogProductsPage(
        makeQuery({ page: 1, limit: 12 }),
      )
      
      expect(result.meta).toStrictEqual({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false,
      })
    })
  })
  
  describe('page reconciliation contract', () => {
    it('keeps page within valid range', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(25)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      const result = await getCatalogProductsPage(
        makeQuery({
          page: 999,
          limit: 12,
        }),
      )
      
      expect(result.meta).toStrictEqual({
        page: 3,
        limit: 12,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      })
    })
    
    it('reconciles page below lower bound', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(25)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      const result = await getCatalogProductsPage(
        makeQuery({
          page: -100,
        }),
      )
      
      expect(result.meta).toStrictEqual({
        page: 1,
        limit: 12,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      })
    })
    
    it('uses reconciled page for prisma skip calculation', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(25)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      await getCatalogProductsPage(
        makeQuery({
          page: 999,
          limit: 12,
        }),
      )
      
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 24,
          take: 12,
        }),
      )
    })
  })
  
  describe('navigation state contract', () => {
    it('builds first-page navigation state', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(25)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      const result = await getCatalogProductsPage(
        makeQuery({
          page: 1,
          limit: 12,
        }),
      )
      
      expect(result.meta).toStrictEqual({
        page: 1,
        limit: 12,
        total: 25,
        totalPages: 3,
        hasPrev: false, // Strict check (1 is not > 1)
        hasNext: true,  // Strict check (1 < 3)
      })
    })
    
    it('builds middle-page navigation state', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(50)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      const result = await getCatalogProductsPage(
        makeQuery({
          page: 2,
          limit: 12,
        }),
      )
      
      expect(result.meta).toStrictEqual({
        page: 2,
        limit: 12,
        total: 50,
        totalPages: 5,
        hasPrev: true,  // 2 > 1
        hasNext: true,  // 2 < 5
      })
    })
    
    it('builds last-page navigation state', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(25)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      const result = await getCatalogProductsPage(
        makeQuery({
          page: 3,
          limit: 12,
        }),
      )
      
      expect(result.meta).toStrictEqual({
        page: 3,
        limit: 12,
        total: 25,
        totalPages: 3,
        hasPrev: true,  // 3 > 1
        hasNext: false, // 3 is not < 3
      })
    })
  })
  
  describe('empty result behavior contract', () => {
    it('returns stable empty pagination state', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(0)
      ;(prisma.product.findMany as Mock).mockResolvedValue([])
      
      const result = await getCatalogProductsPage(
        makeQuery({
          page: 999,
        }),
      )
      
      expect(result).toStrictEqual({
        items: [],
        meta: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 1,
          hasPrev: false,
          hasNext: false,
        },
      })
    })
  })
  
  describe('data transformation contract', () => {
    it('normalizes prisma entities into stable ui-safe DTOs', async () => {
      ;(prisma.product.count as Mock).mockResolvedValue(1)
      
      ;(prisma.product.findMany as Mock).mockResolvedValue([
        {
          id: 'p1',
          name: 'Broken Product',
          slug: 'broken-product',
          description: 'test description',
          price: '199.99', // simulates Prisma Decimal serialization
          images: [],
          stock: 0,
          category: null,
        },
      ])
      
      const result = await getCatalogProductsPage(
        makeQuery({
          page: 1,
          limit: 12,
        }),
      )
      
      expect(result.items).toStrictEqual([
        {
          id: 'p1',
          name: 'Broken Product',
          slug: 'broken-product',
          description: 'test description',
          
          // Decimal -> JS number normalization
          price: 199.99,
          
          // Empty image fallback contract
          imageUrl:
            'https://placehold.co/600x600/111111/F5F5F5?text=No+Image',
          
          // Nullable category fallback contract
          categoryName: 'Uncategorized',
          
          // Derived business-state contract
          inStock: false,
          stock: 0,
        },
      ])
    })
  })
})