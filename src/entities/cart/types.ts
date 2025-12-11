export type CartItemId = number
export type CartCurrency = 'USD' | 'MDL' | 'EUR'

export interface CartItem {
  productId: CartItemId
  name: string
  price: number
  quantity: number
  currency: CartCurrency
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: CartItemId) => void
  updateQuantity: (productId: CartItemId, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
}

export interface CartComputed {
  getTotalQuantity: () => number
  getTotalPrice: () => number
}

export interface CartStore extends CartState, CartActions, CartComputed {}
