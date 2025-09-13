/**
 * Exports publics ContentGrid - Point d'entrée unique
 */

// Composant principal
export { ContentGrid, type ContentGridProps } from './content-grid'

// Types
export type { 
  ResponsiveColumns, 
  PaginationConfig, 
  ContentGridBaseProps 
} from './types'

// Hooks réutilisables
export { 
  useCustomColumns, 
  usePaginatedItems, 
  usePagination 
} from './hooks'

// Variants CVA
export { contentGridVariants } from './variants'

// Composants utilitaires (si besoin external)
export { 
  SkeletonRenderer, 
  ErrorRenderer, 
  EmptyRenderer, 
  ViewToggle 
} from './renderers'

export { 
  Pagination, 
  PaginationInfo 
} from './pagination'