import { CatalogSort, normalizeCatalogSearchParams, parseBoolLike } from '@/entities/product'
import { DEFAULT_LIMIT, DEFAULT_SORT, MAX_LIMIT } from '@/entities/product/model/catalog.types'

describe('parseBoolLike contract', () => {
  it('parses truthy values', () => {
    expect(parseBoolLike('1')).toBe(true)
    expect(parseBoolLike('true')).toBe(true)
    expect(parseBoolLike('yes')).toBe(true)
    expect(parseBoolLike('on')).toBe(true)
  })
  
  it('parses falsy values', () => {
    expect(parseBoolLike('0')).toBe(false)
    expect(parseBoolLike('false')).toBe(false)
    expect(parseBoolLike('no')).toBe(false)
    expect(parseBoolLike('off')).toBe(false)
  })
  
  it('is case insensitive', () => {
    expect(parseBoolLike('TRUE')).toBe(true)
    expect(parseBoolLike('False')).toBe(false)
    expect(parseBoolLike('YeS')).toBe(true)
    expect(parseBoolLike('OFF')).toBe(false)
  })
  
  it('trims whitespace', () => {
    expect(parseBoolLike('  true  ')).toBe(true)
    expect(parseBoolLike('  false  ')).toBe(false)
  })
  
  it('returns undefined for invalid values', () => {
    expect(parseBoolLike('abc')).toBeUndefined()
    expect(parseBoolLike('2')).toBeUndefined()
    expect(parseBoolLike('null')).toBeUndefined()
  })
  
  it('returns undefined for empty input', () => {
    expect(parseBoolLike(undefined)).toBeUndefined()
    expect(parseBoolLike('')).toBeUndefined()
  })
})

describe('normalizeCatalogSearchParams contract', () => {
  it('does not mutate input params', () => {
    const input = Object.freeze({
      page: '2',
      limit: '24',
      sort: 'price_asc',
      min: '10',
      max: '100',
      inStock: 'true',
      category: 'laptops',
    })
    
    const result = normalizeCatalogSearchParams(input)
    
    expect(result).toEqual({
      categorySlug: 'laptops',
      minPrice: 10,
      maxPrice: 100,
      inStock: true,
      sort: 'price_asc',
      page: 2,
      limit: 24,
    })
  })
  
  it('bootstraps catalog query with defaults', () => {
    expect(normalizeCatalogSearchParams({})).toEqual({
      categorySlug: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
      sort: DEFAULT_SORT,
      page: 1,
      limit: DEFAULT_LIMIT,
    })
  })
  
  it('normalizes valid params', () => {
    expect(
      normalizeCatalogSearchParams({
        page: '3',
        limit: '24',
        sort: 'price_desc',
        min: '100',
        max: '500',
        inStock: 'true',
        category: 'phones',
      }),
    ).toEqual({
      categorySlug: 'phones',
      minPrice: 100,
      maxPrice: 500,
      inStock: true,
      sort: 'price_desc',
      page: 3,
      limit: 24,
    })
  })
})

describe('schema normalization contract', () => {
  it('trims string values before normalization', () => {
    const dirtyInput = {
      category: '  laptops  \n',
      page: ' \t3\t ',
      limit: '  24  ',
    }
    
    const result = normalizeCatalogSearchParams(dirtyInput)
    
    expect(result).toEqual({
      categorySlug: 'laptops',
      page: 3,
      limit: 24,
      sort: DEFAULT_SORT,
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
    })
  })
  
  it('converts empty whitespace-only strings to undefined', () => {
    const result = normalizeCatalogSearchParams({
      category: '   ',
      min: '',
      max: '   ',
    })
    //ensure that emptu string are not NaN or empty string
    expect(result.categorySlug).toBeUndefined()
    expect(result.minPrice).toBeUndefined()
    expect(result.maxPrice).toBeUndefined()
  })
})

describe('invalid cleanup contract', () => {
  it('falls back to default page for invalid page', () => {
    expect(
      normalizeCatalogSearchParams({
        page: 'abc',
      }).page,
    ).toBe(1)
    
    expect(
      normalizeCatalogSearchParams({
        page: '-5',
      }).page,
    ).toBe(1)
    
    expect(
      normalizeCatalogSearchParams({
        page: '0',
      }).page,
    ).toBe(1)
  })
  
  it('falls back to default limit for invalid limit', () => {
    expect(
      normalizeCatalogSearchParams({
        limit: 'abc',
      }).limit,
    ).toBe(DEFAULT_LIMIT)
    
    expect(
      normalizeCatalogSearchParams({
        limit: '-10',
      }).limit,
    ).toBe(DEFAULT_LIMIT)
    
    expect(
      normalizeCatalogSearchParams({
        limit: '0',
      }).limit,
    ).toBe(DEFAULT_LIMIT)
  })
  
  it('falls back to default sort for invalid sort', () => {
    expect(
      normalizeCatalogSearchParams({
        sort: 'invalid-sort',
      }).sort,
    ).toBe(DEFAULT_SORT)
  })
  
  it('drops invalid numeric and boolean filters entirely', () => {
    const result = normalizeCatalogSearchParams({
      min: 'abc',
      max: 'xyz',
      inStock: 'sometimes',
    })
    expect(result.minPrice).toBeUndefined()
    expect(result.maxPrice).toBeUndefined()
    expect(result.inStock).toBeUndefined()
  })
})

describe('silent coercion contract (current behavior)', () => {
  it('truncates float-like page values using parseInt semantics', () => {
    expect(normalizeCatalogSearchParams({ page: '1.9' }).page).toBe(1)
    expect(normalizeCatalogSearchParams({ page: '2.5' }).page).toBe(2)
  })
  
  it('accepts numeric prefixes from alphanumeric strings', () => {
    expect(normalizeCatalogSearchParams({ limit: '24px' }).limit).toBe(24)
    expect(normalizeCatalogSearchParams({ limit: '48 items' }).limit).toBe(48)
  })
})

describe('numeric normalization boundaries', () => {
  it('clamps limit to MAX_LIMIT', () => {
    expect(
      normalizeCatalogSearchParams({
        limit: String(MAX_LIMIT + 1),
      }).limit,
    ).toBe(MAX_LIMIT)
  })
  
  it('clamps negative minPrice to 0', () => {
    expect(
      normalizeCatalogSearchParams({
        min: '-1',
      }).minPrice,
    ).toBe(0)
  })
  
  it('drops negative maxPrice', () => {
    expect(
      normalizeCatalogSearchParams({
        max: '-5',
      }).maxPrice,
    ).toBeUndefined()
  })
})

describe('min/max reconciliation contract', () => {
  it('accepts exact lower valid boundary for limit', () => {
    expect(
      normalizeCatalogSearchParams({
        limit: '1',
      }).limit,
    ).toBe(1)
  })
  
  it('accepts exact upper valid boundary for limit', () => {
    expect(
      normalizeCatalogSearchParams({
        limit: String(MAX_LIMIT),
      }).limit,
    ).toBe(MAX_LIMIT)
  })
  
  it('swaps min/max when minPrice > maxPrice', () => {
    const result = normalizeCatalogSearchParams({
      min: '500',
      max: '100',
    })
    expect(result.minPrice).toBe(100)
    expect(result.maxPrice).toBe(500)
  })
  
  it('maintains values when minPrice < maxPrice', () => {
    const result = normalizeCatalogSearchParams({
      min: '100',
      max: '500',
    })
    
    expect(result.minPrice).toBe(100)
    expect(result.maxPrice).toBe(500)
  })
  
  it('maintains values when minPrice exactly equals maxPrice', () => {
    const result = normalizeCatalogSearchParams({
      min: '500',
      max: '500',
    })
    expect(result.minPrice).toBe(500)
    expect(result.maxPrice).toBe(500)
  })
})

describe('whitelist contract', () => {
  it('strips unknown fields', () => {
    const result = normalizeCatalogSearchParams({
      page: '2',
      unknown: 'value',
      hack: '123',
    } as never)
    
    expect(result).toEqual({
      categorySlug: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
      sort: DEFAULT_SORT,
      page: 2,
      limit: DEFAULT_LIMIT,
    })
  })
})

describe('sort contract', () => {
  const SUPPORTED_SORTS: Array<CatalogSort> = [
    'newest',
    'price_asc',
    'price_desc',
  ]
  
  it.each(SUPPORTED_SORTS)('accepts supported sort values', (sortValue) => {
    expect(
      normalizeCatalogSearchParams({ sort: sortValue }).sort,
    ).toBe(sortValue)
  })
})