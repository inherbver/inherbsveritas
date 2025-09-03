'use client'

/**
 * CategoryNavigation - Navigation hiérarchique TDD avec composants UI standardisés
 * Semaine 3 MVP - Categories hiérarchiques + i18n JSONB
 */

import * as React from "react"
import { useTranslations } from 'next-intl'
import { ChevronRight, ChevronDown, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CategoryWithChildren } from '@/types/database'

// Helper pour récupérer le nom localisé d'une catégorie
const getLocalizedCategory = (category: CategoryWithChildren, locale: 'fr' | 'en' = 'fr') => {
  const translations = category.translations as any
  if (translations && translations[locale]) {
    return {
      name: translations[locale].name || category.name,
      description: translations[locale].description || category.description
    }
  }
  return { name: category.name, description: category.description }
}

export interface CategoryNavigationProps {
  className?: string
  categories?: CategoryWithChildren[]
  onCategorySelect?: (category: CategoryWithChildren | null) => void
  selectedCategoryId?: string
  variant?: 'tree' | 'horizontal' | 'dropdown'
}

export interface CategoryBreadcrumbProps {
  className?: string
  categories?: CategoryWithChildren[]
  currentCategoryId?: string
  onCategoryClick?: (category: CategoryWithChildren) => void
}

export interface CategoryFilterProps {
  className?: string
  categories?: CategoryWithChildren[]
  selectedCategoryId?: string
  onCategoryChange?: (categoryId: string | null) => void
  showCount?: boolean
  productCounts?: Record<string, number>
}

/**
 * Navigation arbre hiérarchique avec composants Card
 */
export function CategoryNavigation({ 
  className,
  categories = [],
  onCategorySelect,
  selectedCategoryId,
  variant = 'tree'
}: CategoryNavigationProps) {
  const t = useTranslations('categories')
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set())
  
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const renderTreeItem = (category: CategoryWithChildren, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0
    const isSelected = category.id === selectedCategoryId
    const localized = getLocalizedCategory(category)

    return (
      <div key={category.id} className="space-y-1">
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-auto p-2 text-left font-normal",
            level > 0 && "ml-4"
          )}
          onClick={() => onCategorySelect?.(category)}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(category.id)
                }}
                className="flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            
            <span className="flex-1">{localized.name}</span>
            
            {isSelected && (
              <Badge variant="secondary" className="ml-2">
                {t('selected')}
              </Badge>
            )}
          </div>
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children!.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <nav className={cn("flex flex-wrap gap-2", className)}>
        <Button
          variant={!selectedCategoryId ? "secondary" : "outline"}
          size="sm"
          onClick={() => onCategorySelect?.(null)}
        >
          {t('all')}
        </Button>
        {categories.map(category => {
          const localized = getLocalizedCategory(category)
          return (
            <Button
              key={category.id}
              variant={category.id === selectedCategoryId ? "secondary" : "outline"}
              size="sm"
              onClick={() => onCategorySelect?.(category)}
            >
              {localized.name}
            </Button>
          )
        })}
      </nav>
    )
  }

  if (variant === 'dropdown') {
    return (
      <Select 
        value={selectedCategoryId || "all"} 
        onValueChange={(value) => {
          const category = value === "all" ? null : categories.find(c => c.id === value)
          onCategorySelect?.(category || null)
        }}
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder={t('selectCategory')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('all')}</SelectItem>
          {categories.map(category => {
            const localized = getLocalizedCategory(category)
            return (
              <SelectItem key={category.id} value={category.id}>
                {localized.name}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">{t('navigation')}</h3>
        <nav className="space-y-1">
          <Button
            variant={!selectedCategoryId ? "secondary" : "ghost"}
            className="w-full justify-start h-auto p-2 text-left font-normal"
            onClick={() => onCategorySelect?.(null)}
          >
            {t('all')}
          </Button>
          {categories.map(category => renderTreeItem(category))}
        </nav>
      </CardContent>
    </Card>
  )
}

/**
 * Breadcrumb navigation avec Card styling
 */
export function CategoryBreadcrumb({ 
  className, 
  categories = [],
  currentCategoryId,
  onCategoryClick 
}: CategoryBreadcrumbProps) {
  const t = useTranslations('categories')
  
  // Build breadcrumb path
  const buildPath = (categoryId: string, categories: CategoryWithChildren[]): CategoryWithChildren[] => {
    const findPath = (cats: CategoryWithChildren[], targetId: string, path: CategoryWithChildren[] = []): CategoryWithChildren[] | null => {
      for (const cat of cats) {
        const newPath = [...path, cat]
        if (cat.id === targetId) {
          return newPath
        }
        if (cat.children && cat.children.length > 0) {
          const result = findPath(cat.children, targetId, newPath)
          if (result) return result
        }
      }
      return null
    }
    
    return findPath(categories, categoryId) || []
  }
  
  const path = currentCategoryId ? buildPath(currentCategoryId, categories) : []

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCategoryClick?.(null as any)}
        className="h-auto p-1 font-normal hover:underline"
      >
        {t('home')}
      </Button>
      
      {path.map((category, index) => {
        const localized = getLocalizedCategory(category)
        const isLast = index === path.length - 1
        
        return (
          <React.Fragment key={category.id}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium">{localized.name}</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCategoryClick?.(category)}
                className="h-auto p-1 font-normal hover:underline"
              >
                {localized.name}
              </Button>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

/**
 * Filter dropdown avec compteurs produits
 */
export function CategoryFilter({ 
  className,
  categories = [],
  selectedCategoryId,
  onCategoryChange,
  showCount = false,
  productCounts = {}
}: CategoryFilterProps) {
  const t = useTranslations('categories')

  const renderSelectItem = (category: CategoryWithChildren, level: number = 0): React.ReactNode[] => {
    const localized = getLocalizedCategory(category)
    const count = productCounts[category.id] || 0
    const prefix = "─".repeat(level)
    
    const items: React.ReactNode[] = [
      <SelectItem key={category.id} value={category.id}>
        <div className="flex items-center justify-between w-full">
          <span>{prefix} {localized.name}</span>
          {showCount && count > 0 && (
            <Badge variant="secondary" className="ml-2">
              {count}
            </Badge>
          )}
        </div>
      </SelectItem>
    ]
    
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        items.push(...renderSelectItem(child, level + 1))
      })
    }
    
    return items
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={selectedCategoryId || "all"} 
        onValueChange={(value) => onCategoryChange?.(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t('filter')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center justify-between w-full">
              <span>{t('all')}</span>
              {showCount && (
                <Badge variant="secondary" className="ml-2">
                  {Object.values(productCounts).reduce((sum, count) => sum + count, 0)}
                </Badge>
              )}
            </div>
          </SelectItem>
          {categories.map(category => renderSelectItem(category))}
        </SelectContent>
      </Select>
    </div>
  )
}