/**
 * Exports publics CartItem - Point d'entrée unique
 */

// Composants principaux
export { CartItem } from './cart-item'
export { CartItemList } from './cart-item-list'

// Composants spécialisés
export { CartItemImage } from './cart-item-image'
export { CartItemDetails } from './cart-item-details'
export { QuantityControls } from './quantity-controls'

// Types
export type {
  CartItemProps,
  CartItemListProps,
  QuantityControlsProps,
  CartItemImageProps,
  CartItemDetailsProps
} from './types'