import { buildOrderBy, buildWhere, CatalogQuery, CatalogSort } from '@/entities/product'

const makeQuery = (overrides: Partial<CatalogQuery> = {}): CatalogQuery => ({
  page: 1,
  limit: 12,
  sort: 'newest',
  ...overrides,
})

describe('buildWhere contract', () => {
  it('always includes isActive=true baseline filter', () => {
    expect(buildWhere(makeQuery())).toEqual({
      isActive: true,
    })
  })
  
  it('does not mutate query object', () => {
    const query = Object.freeze(
      makeQuery({
        minPrice: 100,
        maxPrice: 500,
      }),
    )
    
    buildWhere(query)
    
    expect(query).toEqual({
      page: 1,
      limit: 12,
      sort: 'newest',
      minPrice: 100,
      maxPrice: 500,
    })
  })
  
  it('does not create empty nested objects', () => {
    const where = buildWhere(makeQuery())
    
    expect(where.price).toBeUndefined()
    expect(where.category).toBeUndefined()
    expect(where.stock).toBeUndefined()
  })
})

describe('category translation contract', () => {
  it('translates categorySlug into nested category filter', () => {
    const query = makeQuery({ categorySlug: 'laptops' })
    
    expect(buildWhere(query)).toEqual({
      isActive: true,
      category: { slug: 'laptops' },
    })
  })
  
  it('does not add category filter when categorySlug is undefined', () => {
    const query = makeQuery({ categorySlug: undefined })
    expect(buildWhere(query).category).toBeUndefined()
  })
})

describe('price translation contract', () => {
  it('builds gte-only price filter', () => {
    const query = makeQuery({ minPrice: 100 })
    
    expect(buildWhere(query)).toEqual({
      isActive: true,
      price: {
        gte: 100,
      },
    })
  })
  
  it('builds lte-only price filter', () => {
    const query = makeQuery({ maxPrice: 500 })
    
    expect(buildWhere(query)).toEqual({
      isActive: true,
      price: {
        lte: 500,
      },
    })
  })
  
  it('builds combined gte/lte price filter', () => {
    const query = makeQuery({ minPrice: 100, maxPrice: 500 })
    
    expect(buildWhere(query)).toEqual({
      isActive: true,
      price: {
        gte: 100,
        lte: 500,
      },
    })
  })
  
  it('does not add price filter when both min/max are undefined', () => {
    const query = makeQuery()
    
    const where = buildWhere(query)
    
    expect(where.price).toBeUndefined()
  })
  
  it('preserves zero values (avoids falsy boolean trap)', () => {
    const query = makeQuery({ minPrice: 0 })
    
    expect(buildWhere(query)).toEqual({
      isActive: true,
      price: { gte: 0 },
    })
  })
})

describe('stock translation contract', () => {
  it('translates inStock=true into stock gt:0 filter', () => {
    const query = makeQuery({ inStock: true })
    
    expect(buildWhere(query)).toEqual({
      isActive: true,
      stock: {
        gt: 0,
      },
    })
  })
  
  it('translates inStock=false into stock lte:0 filter', () => {
    const query = makeQuery({ inStock: false })
    
    expect(buildWhere(query)).toEqual({
      isActive: true,
      stock: {
        lte: 0,
      },
    })
  })
  
  it('does not add stock filter when inStock is undefined', () => {
    const query = makeQuery()
    
    const where = buildWhere(query)
    
    expect(where.stock).toBeUndefined()
  })
})

describe('сomposability contract', () => {
  it('combines all active filters deterministically', () => {
    const query = makeQuery({
      categorySlug: 'phones',
      minPrice: 100,
      maxPrice: 1000,
      inStock: true,
    })
    
    expect(buildWhere(query)).toEqual({
      isActive: true,
      category: {
        slug: 'phones',
      },
      price: {
        gte: 100,
        lte: 1000,
      },
      stock: {
        gt: 0,
      },
    })
  })
})

describe('buildOrderBy contract', () => {
  describe('primary sort contract', () => {
    it('builds newest ordering', () => {
      expect(buildOrderBy('newest')).toEqual([
        { createdAt: 'desc' },
        { id: 'desc' },
      ])
    })
    
    it('builds price ascending ordering', () => {
      expect(buildOrderBy('price_asc')).toEqual([
        { price: 'asc' },
        { id: 'desc' },
      ])
    })
    
    it('builds price descending ordering', () => {
      expect(buildOrderBy('price_desc')).toEqual([
        { price: 'desc' },
        { id: 'desc' },
      ])
    })
  })
  
  describe('stable sorting contract', () => {
    const SORTS_EXHAUSTIVE: Record<CatalogSort, null> = {
      newest: null,
      price_asc: null,
      price_desc: null,
    }
    
    it.each(Object.keys(SORTS_EXHAUSTIVE) as CatalogSort[])(
      'always appends stable secondary id sort for %s',
      (sort) => {
        const orderBy = buildOrderBy(sort)
        
        expect(orderBy).toHaveLength(2)
        
        expect(orderBy[1]).toEqual({
          id: 'desc',
        })
      },
    )
  })
  
  describe('fallback contract', () => {
    it('falls back to newest ordering for unknown values', () => {
      expect(buildOrderBy('invalid' as CatalogSort)).toEqual([
        { createdAt: 'desc' },
        { id: 'desc' },
      ])
    })
  })
  
  describe('determinism contract', () => {
    it('returns structurally identical output for same input', () => {
      const first = buildOrderBy('price_asc')
      const second = buildOrderBy('price_asc')
      
      expect(first).toEqual(second)
    })
  })
})
