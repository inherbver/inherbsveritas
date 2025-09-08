/**
 * @file Composant filtre par catégories - Semaine 4 MVP
 * @description Filtre hiérarchique des catégories avec navigation
 */

'use client'

import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategoryName } from '@/lib/filters/filter-utils'
import type { CategoryFilterProps, CategoryWithChildren } from '@/lib/filters/filter-types'

export function CategoryFilter({ 
  categories = [], 
  selectedCategoryId, 
  onCategoryChange,
  className 
}: CategoryFilterProps) {
  const t = useTranslations('shop.filters')
  const locale = useLocale()
  
  const renderCategoryItem = (category: CategoryWithChildren, level = 0) => {
    const isSelected = category.id === selectedCategoryId
    const categoryName = getCategoryName(category, locale)
    
    return (
      <div key={category.id} className="space-y-1">
        <button
          onClick={() => onCategoryChange?.(isSelected ? null : category.id)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
            level > 0 && "ml-4",
            isSelected 
              ? "bg-primary text-primary-foreground font-medium" 
              : "hover:bg-muted"
          )}
        >
          {categoryName}
        </button>
        {category.children?.map(child => renderCategoryItem(child, level + 1))}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('categories.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange?.(null)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
              !selectedCategoryId 
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted"
            )}
          >
            {t('categories.all')}
          </button>
          {categories.map(category => renderCategoryItem(category))}
        </div>
      </CardContent>
    </Card>
  )
}