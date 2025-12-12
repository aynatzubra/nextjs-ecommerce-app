'use client'

import { create } from 'zustand'
import { CartCheckoutItem, CartItem, CartItemId, CartStore, UseCartResult } from '@/entities/cart/types'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ecommerce-cart'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)

          if (existing) {
            return {
              ...state,
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            }
          }

          return {
            ...state,
            items: [
              ...state.items,
              {
                ...item,
                quantity,
              },
            ],
          }
        })
      },
      removeItem: (productId: CartItemId) => {
        set((state) => ({
          ...state,
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },
      updateQuantity: (productId: CartItemId, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              ...state,
              items: state.items.filter((i) => i.productId !== productId),
            }
          }

          return {
            ...state,
            items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
          }
        })
      },
      clearCart: () => {
        set((state) => ({
          ...state,
          items: [],
        }))
      },
      toggleCart: () => {
        set((state) => ({
          ...state,
          isOpen: !state.isOpen,
        }))
      },
      getTotalQuantity: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
)

//hook-wrap over the zustand-store
export function useCart(): UseCartResult {
  const [isHydrated, setIsHydrated] = useState(false)

  // selectors from store
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const getTotalQuantity = useCartStore((state) => state.getTotalQuantity)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const checkoutItems: CartCheckoutItem[] = isHydrated
    ? items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    : []

  if (!isHydrated) {
    return {
      items: [],
      isOpen: false,
      totalQuantity: 0,
      totalPrice: 0,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleCart,
      checkoutItems,
      isHydrated: false,
    }
  }

  return {
    items,
    isOpen,
    totalQuantity: getTotalQuantity(),
    totalPrice: getTotalPrice(),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    checkoutItems,
    isHydrated: true,
  }
}
