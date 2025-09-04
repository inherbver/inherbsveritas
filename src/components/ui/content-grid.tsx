'use client'

/**
 * ContentGrid - Système de grilles génériques unifié
 * 
 * Template universel remplaçant ProductGrid, ArticleGrid, PartnerGrid
 * Basé sur l'architecture ContentCard système
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Grid, List } from "lucide-react"
import { cn } from "@/lib/utils"

// CVA pour les variants de grille
const contentGridVariants = cva(
  "grid gap-4 transition-all duration-200",
  {
    variants: {
      // Types de contenu (adapte columns par défaut)
      variant: {
        product: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        article: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3", 
        category: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        partner: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2",
        event: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2"
      },
      // Espacement
      gap: {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8"
      },
      // Densité d'affichage
      density: {
        compact: "gap-2",
        normal: "gap-4", 
        spacious: "gap-6"
      }
    },
    defaultVariants: {
      variant: "product",
      gap: "md",
      density: "normal"
    }
  }
)

// Configuration responsive columns personnalisée
export interface ResponsiveColumns {
  default?: number
  sm?: number  // >= 640px
  md?: number  // >= 768px
  lg?: number  // >= 1024px
  xl?: number  // >= 1280px
}

// Configuration pagination
export interface PaginationConfig {
  enabled: boolean
  pageSize: number
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
}

// Props du ContentGrid
export interface ContentGridProps<T = any> extends VariantProps<typeof contentGridVariants> {
  // === DONNÉES ===
  /** Items à afficher */
  items: T[]
  /** Fonction de rendu pour chaque item */
  renderItem: (item: T, index: number) => React.ReactNode
  
  // === LAYOUT ===
  /** Configuration colonnes responsive personnalisée */
  columns?: ResponsiveColumns
  /** Classe CSS personnalisée */
  className?: string
  
  // === PAGINATION ===
  /** Configuration pagination */
  pagination?: PaginationConfig
  
  // === ÉTATS ===
  /** État de chargement */
  isLoading?: boolean
  /** Nombre d'éléments skeleton à afficher */
  loadingCount?: number
  /** Erreur d'affichage */
  error?: string | null
  /** Message si vide */
  emptyMessage?: string
  /** Titre de la grille */
  title?: string
  /** Description de la grille */
  description?: string
  
  // === PERFORMANCE ===
  /** Activer virtualisation (grandes listes) */
  virtualized?: boolean
  /** Hauteur des items pour virtualisation */
  itemHeight?: number
  /** Lazy loading des images */
  lazyLoad?: boolean
  
  // === ACTIONS ===
  /** Actions globales (filtres, tri, etc.) */
  actions?: React.ReactNode
  /** Toggle vue grille/liste */
  allowViewToggle?: boolean
  /** Vue actuelle */
  currentView?: 'grid' | 'list'
  /** Callback changement vue */
  onViewChange?: (view: 'grid' | 'list') => void
}

export function ContentGrid<T = any>({
  // Données
  items,
  renderItem,
  
  // Layout  
  columns,
  className,
  variant,
  gap,
  density,
  
  // Pagination
  pagination,
  
  // États
  isLoading = false,
  loadingCount = 8,
  error = null,
  emptyMessage,
  title,
  description,
  
  // Performance (paramètres pour futures évolutions)
  // virtualized, itemHeight, lazyLoad: non utilisés dans cette version
  
  // Actions
  actions,
  allowViewToggle = false,
  currentView = 'grid',
  onViewChange
}: ContentGridProps<T>) {

  // Génération classes CSS colonnes personnalisées
  const customColumnClasses = React.useMemo(() => {
    if (!columns) return ""
    
    const classes: string[] = []
    if (columns.default) classes.push(`grid-cols-${columns.default}`)
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`)
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`)
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`)
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`)
    
    return classes.join(" ")
  }, [columns])

  // Pagination des items
  const paginatedItems = React.useMemo(() => {
    if (!pagination?.enabled) return items
    
    const start = ((pagination.currentPage || 1) - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return items.slice(start, end)
  }, [items, pagination])

  // Rendu skeleton loading
  const renderSkeleton = () => (
    <div className={cn(
      contentGridVariants({ variant, gap, density }),
      customColumnClasses,
      className
    )}>
      {Array.from({ length: loadingCount }, (_, index) => (
        <Card key={index} className="animate-pulse">
          <div className="aspect-square bg-muted rounded-t-lg" />
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Rendu état erreur
  const renderError = () => (
    <Card className="p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </Card>
  )

  // Rendu état vide
  const renderEmpty = () => (
    <Card className="p-8 text-center">
      <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Grid className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">Aucun élément</h3>
      <p className="text-muted-foreground">
        {emptyMessage || "Aucun élément à afficher pour le moment."}
      </p>
    </Card>
  )

  // Rendu pagination
  const renderPagination = () => {
    if (!pagination?.enabled || !pagination.totalPages) return null

    const { currentPage = 1, totalPages, onPageChange } = pagination

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        {/* Première page */}
        {pagination.showFirstLast && currentPage > 2 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(1)}
            >
              1
            </Button>
            {currentPage > 3 && <span className="text-muted-foreground">...</span>}
          </>
        )}

        {/* Page précédente */}
        {pagination.showPrevNext && currentPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            Précédent
          </Button>
        )}

        {/* Pages adjacentes */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }

          if (pageNum < 1 || pageNum > totalPages) return null

          return (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange?.(pageNum)}
            >
              {pageNum}
            </Button>
          )
        })}

        {/* Page suivante */}
        {pagination.showPrevNext && currentPage < totalPages && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            Suivant
          </Button>
        )}

        {/* Dernière page */}
        {pagination.showFirstLast && currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && <span className="text-muted-foreground">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>
    )
  }

  // États d'erreur et chargement
  if (error) return renderError()
  if (isLoading) return renderSkeleton()
  if (items.length === 0) return renderEmpty()

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et actions */}
      {(title || description || actions || allowViewToggle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          
          <div className="flex items-center gap-4">
            {actions}
            
            {allowViewToggle && (
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={currentView === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange?.('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange?.('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grille principale */}
      {currentView === 'grid' ? (
        <div className={cn(
          contentGridVariants({ variant, gap, density }),
          customColumnClasses,
          className
        )}>
          {paginatedItems.map((item, index) => (
            <div key={index}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ) : (
        // Vue liste (vertical)
        <div className="space-y-4">
          {paginatedItems.map((item, index) => (
            <div key={index}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Info pagination */}
      {pagination?.enabled && (
        <p className="text-center text-sm text-muted-foreground">
          Affichage {((pagination.currentPage || 1) - 1) * pagination.pageSize + 1} à{' '}
          {Math.min((pagination.currentPage || 1) * pagination.pageSize, items.length)} sur{' '}
          {items.length} éléments
        </p>
      )}
    </div>
  )
}

// Hook utilitaire pour pagination
export function usePagination(items: any[], pageSize: number = 12) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const totalPages = Math.ceil(items.length / pageSize)

  const paginationConfig: PaginationConfig = {
    enabled: totalPages > 1,
    pageSize,
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    showFirstLast: totalPages > 5,
    showPrevNext: true
  }

  return {
    paginationConfig,
    currentPage,
    setCurrentPage,
    totalPages
  }
}