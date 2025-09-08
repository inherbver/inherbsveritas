/**
 * @file Composant filtres actifs - Semaine 4 MVP
 * @description Affichage des filtres appliqués avec suppression
 */

'use client'

import { useTranslations, useLocale } from 'next-intl'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCategoryName, findCategoryById } from '@/lib/filters/filter-utils'
import { HERBIS_VERITAS_LABELS } from '@/lib/filters/filter-types'
import type { ActiveFiltersProps } from '@/lib/filters/filter-types'

export function ActiveFilters({ 
  categories = [],
  selectedCategoryId,
  selectedLabels = [],
  searchTerm,
  onClearCategory,
  onClearLabel,
  onClearSearch,
  onClearAll,
  className 
}: ActiveFiltersProps) {
  const t = useTranslations('shop.filters')
  const locale = useLocale()
  
  const activeFiltersCount = 
    (selectedCategoryId ? 1 : 0) + 
    selectedLabels.length + 
    (searchTerm ? 1 : 0)

  if (activeFiltersCount === 0) return null

  const selectedCategory = selectedCategoryId 
    ? findCategoryById(categories, selectedCategoryId)
    : null

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">{t('active.title')} ({activeFiltersCount})</h3>
          {activeFiltersCount > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
              className="h-auto p-1 text-xs"
            >
              {t('active.clearAll')}
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Catégorie active */}
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              {getCategoryName(selectedCategory, locale)}
              <button
                onClick={onClearCategory}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {/* Labels actifs */}
          {selectedLabels.map(labelKey => {
            const labelConfig = HERBIS_VERITAS_LABELS.find(l => l.key === labelKey)
            return labelConfig ? (
              <Badge key={labelKey} variant="secondary" className="gap-1">
                {labelConfig.label}
                <button
                  onClick={() => onClearLabel?.(labelKey)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null
          })}
          
          {/* Recherche active */}
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              &ldquo;{searchTerm}&rdquo;
              <button
                onClick={onClearSearch}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}