/**
 * ContentGrid - Composant principal refactorisé
 * 
 * Template universel remplaçant ProductGrid, ArticleGrid, PartnerGrid
 * Basé sur l'architecture ContentCard système
 */

'use client'

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Imports modules refactorisés
import { type ContentGridBaseProps } from "./types"
import { contentGridVariants } from "./variants"
import { useCustomColumns, usePaginatedItems } from "./hooks"
import { SkeletonRenderer, ErrorRenderer, EmptyRenderer, ViewToggle } from "./renderers"
import { Pagination, PaginationInfo } from "./pagination"

// Props finales avec variants CVA
export interface ContentGridProps<T = any> 
  extends ContentGridBaseProps<T>, 
          VariantProps<typeof contentGridVariants> {}

/**
 * ContentGrid - Composant principal < 150 lignes
 */
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
  
  // Actions
  actions,
  allowViewToggle = false,
  currentView = 'grid',
  onViewChange
}: ContentGridProps<T>) {

  // Hooks pour logique réutilisable
  const customColumnClasses = useCustomColumns(columns)
  const paginatedItems = usePaginatedItems(items, pagination)

  // Rendu conditionnel des états
  if (isLoading) {
    return (
      <SkeletonRenderer 
        variant={variant}
        gap={gap}
        density={density}
        loadingCount={loadingCount}
        customColumnClasses={customColumnClasses}
        className={className}
      />
    )
  }

  if (error) {
    return <ErrorRenderer error={error} />
  }

  if (!items.length) {
    return <EmptyRenderer message={emptyMessage} title={title} />
  }

  // Classes CSS finales
  const gridClasses = cn(
    contentGridVariants({ variant, gap, density }),
    customColumnClasses,
    {
      // Vue liste override
      "grid-cols-1 gap-2": currentView === 'list'
    },
    className
  )

  return (
    <div className="space-y-4">
      {/* Header avec titre, description, actions */}
      {(title || description || actions || allowViewToggle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {actions}
            {allowViewToggle && (
              <ViewToggle 
                currentView={currentView} 
                onViewChange={onViewChange} 
              />
            )}
          </div>
        </div>
      )}

      {/* Grille principale */}
      <div className={gridClasses}>
        {paginatedItems.map(renderItem)}
      </div>

      {/* Pagination */}
      {pagination?.enabled && pagination.totalPages && pagination.totalPages > 1 && (
        <div className="space-y-2">
          <Pagination {...pagination} />
          <PaginationInfo 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={items.length}
          />
        </div>
      )}
    </div>
  )
}