/**
 * Feature Products - Point d'entrée unifié  
 * 
 * Centralise toute la logique métier products selon CLAUDE.md section 3 bis
 */

// Hooks products
export { useProduct } from './hooks/use-product'
export { useProducts } from './hooks/use-products'
export { useProductFilters } from './hooks/use-product-filters'

// Services products
export * from './services/products-service'
export * from './services/products'
export * from './services/product.mapper'

// Types products
export * from './types'

// Schemas validation
export * from './schemas'