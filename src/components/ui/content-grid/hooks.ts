/**
 * Hooks pour ContentGrid - Logique réutilisable
 */

import * as React from "react"
import { type ResponsiveColumns, type PaginationConfig } from "./types"

/**
 * Hook pour génération classes CSS colonnes personnalisées
 */
export function useCustomColumns(columns?: ResponsiveColumns) {
  return React.useMemo(() => {
    if (!columns) return ""
    
    const classes: string[] = []
    if (columns.default) classes.push(`grid-cols-${columns.default}`)
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`)
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`)
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`)
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`)
    
    return classes.join(" ")
  }, [columns])
}

/**
 * Hook pour pagination des items
 */
export function usePaginatedItems<T>(items: T[], pagination?: PaginationConfig) {
  return React.useMemo(() => {
    if (!pagination?.enabled) return items
    
    const start = ((pagination.currentPage || 1) - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return items.slice(start, end)
  }, [items, pagination])
}

/**
 * Hook pagination complet avec state management
 */
export function usePagination(items: any[] | null, pageSize: number = 12) {
  const [currentPage, setCurrentPage] = React.useState(1)
  
  const totalItems = items?.length || 0
  const totalPages = Math.ceil(totalItems / pageSize)
  const hasMore = currentPage < totalPages
  const hasPrevious = currentPage > 1
  
  const paginatedItems = React.useMemo(() => {
    if (!items) return []
    
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return items.slice(start, end)
  }, [items, currentPage, pageSize])
  
  const goToPage = React.useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])
  
  const nextPage = React.useCallback(() => {
    if (hasMore) setCurrentPage(prev => prev + 1)
  }, [hasMore])
  
  const prevPage = React.useCallback(() => {
    if (hasPrevious) setCurrentPage(prev => prev - 1)
  }, [hasPrevious])
  
  // Reset à la page 1 si items changent
  React.useEffect(() => {
    setCurrentPage(1)
  }, [items])
  
  return {
    // State
    currentPage,
    totalPages,
    totalItems,
    hasMore,
    hasPrevious,
    
    // Items paginés
    paginatedItems,
    
    // Actions
    goToPage,
    nextPage,
    prevPage,
    setCurrentPage
  }
}