'use client'

import { create } from 'zustand'
import { CartItem, CartItemId, CartStore } from '@/entities/cart/types'
import { persist, createJSONStorage } from 'zustand/middleware'

const STORAGE_KEY = 'ecommerce-cart'

export const useCardStore = create<CartStore>()(
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
