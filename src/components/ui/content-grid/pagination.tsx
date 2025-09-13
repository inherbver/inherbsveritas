/**
 * Composants pagination pour ContentGrid - Navigation pages
 */

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { type PaginationConfig } from "./types"

interface PaginationProps extends PaginationConfig {
  totalPages: number
}

/**
 * Composant pagination complet
 */
export function Pagination({
  currentPage = 1,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true
}: PaginationProps) {
  if (!onPageChange || totalPages <= 1) return null

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  // Génération numéros pages visibles (max 5)
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center space-x-1 py-4">
      {/* Premier & Précédent */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          className="h-8 px-2"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}
      
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className="h-8 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Numéros pages */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 text-muted-foreground">...</span>
          ) : (
            <Button
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="h-8 min-w-8"
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      {/* Suivant & Dernier */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="h-8 px-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className="h-8 px-2"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

/**
 * Info pagination simple
 */
export function PaginationInfo({
  currentPage = 1,
  totalPages,
  pageSize,
  totalItems
}: {
  currentPage?: number
  totalPages: number
  pageSize: number
  totalItems: number
}) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="text-sm text-muted-foreground text-center py-2">
      Affichage {startItem}-{endItem} sur {totalItems} éléments
      {totalPages > 1 && ` (page ${currentPage} sur ${totalPages})`}
    </div>
  )
}