/**
 * useCartActions - Hook principal refactorisé
 */

'use client'

import { useCallback } from 'react'
import { toast } from '@/lib/toast'
import { useCartQuery, useAddToCartMutation, useUpdateQuantityMutation, useRemoveFromCartMutation } from '../hooks/use-cart-query'
import { useCartOptimistic, useDebouncedSync } from '../hooks/use-cart-optimistic'
import type { HerbisCartItem } from '@/types/herbis-veritas'
import type { AddToCartParams, CartActionsReturn } from './types'

/**
 * Hook principal actions cart < 200 lignes
 */
export function useCartActions(): CartActionsReturn {
  const { data: serverCart } = useCartQuery()
  const addMutation = useAddToCartMutation()
  const updateMutation = useUpdateQuantityMutation()
  const removeMutation = useRemoveFromCartMutation()

  // Optimistic state
  const {
    optimisticItems,
    addItemOptimistic,
    updateQuantityOptimistic,
    removeItemOptimistic,
    clearCartOptimistic,
    itemCount,
    subtotal,
    getItem
  } = useCartOptimistic(serverCart?.items || [], {
    onOptimisticUpdate: (action) => {
      console.log('Optimistic update:', action.type)
    },
    onError: (error, action) => {
      console.error('Optimistic error:', error, action.type)
      toast.error(`Erreur ${action.type.toLowerCase()}: ${error.message}`)
    }
  })

  // Debounced sync functions
  const { debouncedSync: debouncedAdd } = useDebouncedSync(
    async (params: AddToCartParams) => {
      await addMutation.mutateAsync({
        productId: params.productId,
        quantity: params.quantity || 1
      })
    },
    200
  )

  const { debouncedSync: debouncedUpdate } = useDebouncedSync(
    async (productId: string, quantity: number) => {
      await updateMutation.mutateAsync({ productId, quantity })
    },
    300
  )

  const { debouncedSync: debouncedRemove } = useDebouncedSync(
    async (productId: string) => {
      await removeMutation.mutateAsync({ productId })
    },
    150
  )

  // Actions avec gestion erreurs
  const addToCart = useCallback(async (params: AddToCartParams) => {
    try {
      // Optimistic update
      const optimisticItem: Omit<HerbisCartItem, 'id'> = {
        productId: params.productId,
        name: params.name,
        price: params.price,
        quantity: params.quantity || 1,
        labels: params.labels || [],
        unit: params.unit || 'pièce',
        slug: params.slug || '',
        ...(params.inci_list && { inci_list: params.inci_list }),
        ...(params.image_url && { image_url: params.image_url }),
        ...(params.stock_quantity !== undefined && { stock_quantity: params.stock_quantity })
      }

      addItemOptimistic(optimisticItem)
      
      // Validation stock
      if (params.stock_quantity !== undefined && params.stock_quantity === 0) {
        throw new Error('Produit en rupture de stock')
      }

      const currentQuantity = getItem(params.productId)?.quantity || 0
      const newQuantity = currentQuantity + (params.quantity || 1)
      
      if (params.stock_quantity !== undefined && newQuantity > params.stock_quantity) {
        throw new Error(`Stock insuffisant (${params.stock_quantity} disponible${params.stock_quantity > 1 ? 's' : ''})`)
      }

      await debouncedAdd(params)
      toast.success(`${params.name} ajouté au panier`)
      
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur ajout panier')
      throw error
    }
  }, [addItemOptimistic, debouncedAdd, getItem])

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      updateQuantityOptimistic(productId, quantity)
      await debouncedUpdate(productId, quantity)
    } catch (error) {
      console.error('Update quantity error:', error)
      toast.error('Erreur mise à jour quantité')
      throw error
    }
  }, [updateQuantityOptimistic, debouncedUpdate])

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      removeItemOptimistic(productId)
      await debouncedRemove(productId)
      toast.success('Article supprimé du panier')
    } catch (error) {
      console.error('Remove from cart error:', error)
      toast.error('Erreur suppression article')
      throw error
    }
  }, [removeItemOptimistic, debouncedRemove])

  const clearCart = useCallback(async () => {
    try {
      clearCartOptimistic()
      // TODO: API call clear cart
      toast.success('Panier vidé')
    } catch (error) {
      console.error('Clear cart error:', error)
      toast.error('Erreur vidage panier')
      throw error
    }
  }, [clearCartOptimistic])

  // Error handling
  const clearError = useCallback(() => {
    // TODO: Clear error state
  }, [])

  const retryLastAction = useCallback(async () => {
    // TODO: Retry last failed action
  }, [])

  return {
    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    
    // States
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    hasError: addMutation.isError || updateMutation.isError || removeMutation.isError,
    lastError: addMutation.error?.message || updateMutation.error?.message || removeMutation.error?.message || null,
    
    // Optimistic state
    optimisticItems,
    itemCount,
    subtotal,
    
    // Error handling
    clearError,
    retryLastAction
  }
}