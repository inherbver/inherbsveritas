'use client'

import { useState, useCallback } from 'react'
import { Product } from '@/types/product'
import { toast } from 'react-hot-toast'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  added_at: string
}

export interface UseCartReturn {
  /** Cart items */
  items: CartItem[]
  /** Total items count */
  itemsCount: number
  /** Total price */
  total: number
  /** Loading state */
  isLoading: boolean
  /** Add item to cart */
  addItem: (product: Product, quantity?: number) => Promise<void>
  /** Remove item from cart */
  removeItem: (itemId: string) => Promise<void>
  /** Update item quantity */
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  /** Clear cart */
  clearCart: () => Promise<void>
}

/**
 * Hook for cart management (MVP version)
 * TODO: Connect to Supabase cart tables in Phase 2
 */
export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      setItems(currentItems => {
        const existingItem = currentItems.find(item => item.product.id === product.id)
        
        if (existingItem) {
          // Update existing item quantity
          return currentItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `cart-${Date.now()}-${product.id}`,
            product,
            quantity,
            added_at: new Date().toISOString()
          }
          return [...currentItems, newItem]
        }
      })

      toast.success(`${product.name} ajouté au panier`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Erreur lors de l\'ajout au panier')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setItems(currentItems => currentItems.filter(item => item.id !== itemId))
      toast.success('Produit retiré du panier')
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('Erreur lors de la suppression')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId)
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      )
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Erreur lors de la mise à jour')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [removeItem])

  const clearCart = useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      setItems([])
      toast.success('Panier vidé')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Erreur lors de la vidange du panier')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Calculate derived values
  const itemsCount = items.reduce((total, item) => total + item.quantity, 0)
  const total = items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  )

  return {
    items,
    itemsCount,
    total,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }
}