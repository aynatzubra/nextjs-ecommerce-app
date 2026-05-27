import {
  addCartItem, getTotalPrice,
  getTotalQuantity,
  normalizeQuantity,
  removeCartItem,
  updateCartItem,
} from '@/entities/cart/lib/cart.contracts'
import { CartItem } from '@/entities/cart'

const makeItem = (
  overrides: Partial<CartItem> = {},
): CartItem => ({
  productId: 1,
  name: 'MacBook Pro',
  price: 2500,
  quantity: 1,
  currency: 'USD',
  lastKnownStock: 10,
  ...overrides,
})

describe('normalizeQuantity contract', () => {
  it('clamps quantity to minimum 1', () => {
    expect(normalizeQuantity(0, 10)).toBe(1)
    expect(normalizeQuantity(-5, 10)).toBe(1)
  })
  
  it('clamps quantity to available stock', () => {
    expect(normalizeQuantity(100, 5)).toBe(5)
  })
  
  it('returns 0 when stock is unavailable', () => {
    expect(normalizeQuantity(1, 0)).toBe(0)
    expect(normalizeQuantity(1, -1)).toBe(0)
  })
  
  it('normalizes invalid numeric values', () => {
    expect(normalizeQuantity(Number.NaN, 5)).toBe(1)
    expect(normalizeQuantity(3.9, 5)).toBe(3)
  })
  
  it('normalizes invalid numeric values for quantity', () => {
    expect(normalizeQuantity(Number.NaN, 5)).toBe(1)
    expect(normalizeQuantity(Infinity, 5)).toBe(1)
    expect(normalizeQuantity(3.9, 5)).toBe(3)
  })
  
  it('falls back to 0 when stock is invalid', () => {
    expect(normalizeQuantity(1, Number.NaN)).toBe(0)
    expect(normalizeQuantity(2, Infinity)).toBe(0)
    expect(normalizeQuantity(1, undefined as unknown as number)).toBe(0) // protect from JS-runtime
  })
})

describe('addCartItem contract', () => {
  it('adds a new item with normalized quantity', () => {
    const item = makeItem({
      lastKnownStock: 5,
    })
    
    const result = addCartItem([], item, 100)
    
    expect(result).toStrictEqual([
      {
        ...item,
        quantity: 5,
      },
    ])
  })
  
  it('increments existing item quantity', () => {
    const existing = makeItem({
      quantity: 2,
      lastKnownStock: 10,
    })
    
    const incoming = makeItem({
      lastKnownStock: 10,
    })
    
    const result = addCartItem([existing], incoming, 3)
    
    expect(result).toStrictEqual([
      {
        ...existing,
        quantity: 5,
        lastKnownStock: 10,
      },
    ])
  })
  
  it('clamps merged quantity to stock limit', () => {
    const existing = makeItem({
      quantity: 8,
      lastKnownStock: 10,
    })
    
    const incoming = makeItem({
      lastKnownStock: 10,
    })
    
    const result = addCartItem([existing], incoming, 10)
    
    expect(result).toStrictEqual([
      {
        ...existing,
        quantity: 10,
        lastKnownStock: 10,
      },
    ])
  })
  
  it('does not add item when stock is 0', () => {
    const item = makeItem({
      lastKnownStock: 0,
    })
    
    const result = addCartItem([], item, 1)
    
    expect(result).toStrictEqual([])
  })
  
  it('prevents collateral damage: does not mutate other items in the cart', () => {
    const existingTarget = makeItem({ productId: 1, quantity: 2, lastKnownStock: 10 })
    const bystanderItem = makeItem({ productId: 2, quantity: 5, lastKnownStock: 5 })
    
    const incoming = makeItem({ productId: 1, lastKnownStock: 10 })
    
    const cart = [existingTarget, bystanderItem]
    const result = addCartItem(cart, incoming, 3)
    
    expect(result).toStrictEqual([
      { ...existingTarget, quantity: 5, lastKnownStock: 10 },
      bystanderItem, // must remain absolutely identical
    ])
  })
  
  it('returns exact same array reference when addition is impossible (Render Bailout)', () => {
    const bystanderItem = makeItem({ productId: 2, quantity: 5 })
    const initialCart = [bystanderItem]
    
    const outOfStockItem = makeItem({ productId: 3, lastKnownStock: 0 })
    
    const result = addCartItem(initialCart, outOfStockItem, 1)
    
    expect(result).toBe(initialCart)
  })
})

describe('updateCartItem contract', () => {
  it('updates quantity with stock clamp', () => {
    const existing = makeItem({
      quantity: 1,
      lastKnownStock: 10,
    })
    
    const result = updateCartItem(
      [existing],
      existing.productId,
      100,
      5,
    )
    
    expect(result).toStrictEqual([
      {
        ...existing,
        quantity: 5,
        lastKnownStock: 5,
      },
    ])
  })
  
  it('removes item when quantity is less than or equal to 0', () => {
    const existing = makeItem()
    
    const result = updateCartItem(
      [existing],
      existing.productId,
      0,
      10,
    )
    
    expect(result).toStrictEqual([])
  })
  
  it('removes item when stock becomes unavailable', () => {
    const existing = makeItem()
    
    const result = updateCartItem(
      [existing],
      existing.productId,
      2,
      0,
    )
    
    expect(result).toStrictEqual([])
  })
  
  it('does not mutate unrelated items', () => {
    const target = makeItem({
      productId: 1,
      quantity: 1,
    })
    
    const untouched = makeItem({
      productId: 2,
      quantity: 4,
    })
    
    const result = updateCartItem(
      [target, untouched],
      1,
      3,
      10,
    )
    
    expect(result).toStrictEqual([
      {
        ...target,
        quantity: 3,
        lastKnownStock: 10,
      },
      untouched,
    ])
  })
  
  it('CRITICAL: returns identical reference if item does not exist', () => {
    const existing = makeItem({ productId: 1 })
    const cart = [existing]
    
    const result = updateCartItem(cart, 999, 5, 10)
    
    expect(result).toBe(cart)
  })
  
  it('preserves reference when quantity does not change', () => {
    const existing = makeItem({
      productId: 1,
      quantity: 2,
      lastKnownStock: 10,
    })
    
    const cart = [existing]
    
    const result = updateCartItem(cart, 1, 2, 10)
    
    expect(result).toBe(cart)
  })
})

describe('removeCartItem contract', () => {
  it('removes target item from cart', () => {
    const target = makeItem({
      productId: 1,
    })
    
    const bystander = makeItem({
      productId: 2,
    })
    
    const result = removeCartItem(
      [target, bystander],
      1,
    )
    
    expect(result).toStrictEqual([
      bystander,
    ])
  })
  
  it('preserves unrelated item references', () => {
    const first = makeItem({
      productId: 1,
      quantity: 2,
    })
    
    const second = makeItem({
      productId: 2,
      quantity: 5,
    })
    
    const result = removeCartItem(
      [first, second],
      1,
    )
    
    expect(result).toStrictEqual([
      second,
    ])
    expect(result[0]).toBe(second)
  })
  
  it('safely handles removal from empty cart', () => {
    expect(
      removeCartItem([], 1),
    ).toStrictEqual([])
  })
  
  it('returns unchanged cart when item does not exist', () => {
    const existing = makeItem({ productId: 1 })
    const cart = [existing] //save link
    
    const result = removeCartItem(cart, 999)
    
    expect(result).toBe(cart)
  })
})

describe('getTotalQuantity contract', () => {
  
  it('returns total quantity across all cart items', () => {
    const items = [
      makeItem({
        productId: 1,
        quantity: 2,
      }),
      
      makeItem({
        productId: 2,
        quantity: 5,
      }),
    ]
    
    expect(getTotalQuantity(items)).toBe(7)
  })
  
  it('returns 0 for empty cart', () => {
    expect(getTotalQuantity([])).toBe(0)
  })
  
  it('never returns NaN for valid cart state', () => {
    const items = [
      makeItem({
        quantity: 1,
      }),
      
      makeItem({
        quantity: 2,
      }),
    ]
    
    expect(Number.isNaN(getTotalQuantity(items))).toBe(false)
  })
})

describe('getTotalPrice contract', () => {
  it('returns total aggregated price', () => {
    const items = [
      makeItem({
        productId: 1,
        price: 100,
        quantity: 2,
      }),
      makeItem({
        productId: 2,
        price: 50,
        quantity: 3,
      }),
    ]
    
    expect(getTotalPrice(items)).toBe(350)
  })
  
  it('returns 0 for empty cart', () => {
    expect(getTotalPrice([])).toBe(0)
  })
  
  it('returns a finite numeric total', () => {
    const items = [
      makeItem({
        price: 100,
        quantity: 2,
      }),
      makeItem({
        price: 50,
        quantity: 1,
      }),
    ]
    
    expect(Number.isFinite(getTotalPrice(items))).toBe(true)
  })
  
  it('CRITICAL: safely handles IEEE 754 floating point arithmetic', () => {
    const items = [
      makeItem({
        productId: 1,
        price: 0.1,
        quantity: 1,
      }),
      makeItem({
        productId: 2,
        price: 0.2,
        quantity: 1,
      }),
    ]
    
    expect(getTotalPrice(items)).toBe(0.3)
  })
})