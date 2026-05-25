import { toCatalogSearchParams } from '@/entities/product'

describe('toCatalogSearchParams contract', () => {
  it('maps supported keys from string values', () => {
    const input = {
      category: 'laptops',
      min: '100',
      max: '500',
      inStock: 'true',
      sort: 'price-asc',
      page: '2',
      limit: '24',
    }
    
    const result = toCatalogSearchParams(input)
    
    expect(result).toStrictEqual({
      category: 'laptops',
      min: '100',
      max: '500',
      inStock: 'true',
      sort: 'price-asc',
      page: '2',
      limit: '24',
    })
  })
  
  it('uses first value from string arrays', () => {
    const input = {
      category: ['laptops', 'phones'],
      min: ['100', '200'],
      max: ['500', '700'],
      inStock: ['true', 'false'],
      sort: ['price-asc', 'newest'],
      page: ['2', '3'],
      limit: ['24', '48'],
    }
    
    const result = toCatalogSearchParams(input)
    
    expect(result).toStrictEqual({
      category: 'laptops',
      min: '100',
      max: '500',
      inStock: 'true',
      sort: 'price-asc',
      page: '2',
      limit: '24',
    })
  })
  
  it('returns undefined for missing supported keys', () => {
    const result = toCatalogSearchParams({})
    
    expect(result).toStrictEqual({
      category: undefined,
      min: undefined,
      max: undefined,
      inStock: undefined,
      sort: undefined,
      page: undefined,
      limit: undefined,
    })
  })
  
  it('ignores unsupported keys', () => {
    const input = {
      category: 'laptops',
      hacked: '1',
      token: 'secret',
      redirect: '/admin',
      dropDatabase: 'true',
    }
    
    const result = toCatalogSearchParams(input)
    
    expect(result).toStrictEqual({
      category: 'laptops',
      min: undefined,
      max: undefined,
      inStock: undefined,
      sort: undefined,
      page: undefined,
      limit: undefined,
    })
  })
  
  it('returns stable object shape', () => {
    const result = toCatalogSearchParams({
      category: 'laptops',
    })
    
    expect(result).toStrictEqual({
      category: 'laptops',
      min: undefined,
      max: undefined,
      inStock: undefined,
      sort: undefined,
      page: undefined,
      limit: undefined,
    })
    
    expect(Object.keys(result)).toStrictEqual([
      'category',
      'min',
      'max',
      'inStock',
      'sort',
      'page',
      'limit',
    ])
  })
})