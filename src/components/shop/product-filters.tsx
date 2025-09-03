'use client'

/**
 * @file Composants filtres boutique - Semaine 4 MVP
 * @description Filtres réactifs avec navigation côté client pour catalogue
 */

import * as React from "react"
import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CategoryWithChildren, ProductLabel } from '@/types/database'

// Configuration labels HerbisVeritas
export const HERBIS_VERITAS_LABELS = [
  { key: 'bio' as ProductLabel, label: 'Bio', description: 'Certification biologique' },
  { key: 'recolte_main' as ProductLabel, label: 'Récolté à la main', description: 'Récolte manuelle traditionnelle' },
  { key: 'origine_occitanie' as ProductLabel, label: 'Origine Occitanie', description: 'Produits de notre région' },
  { key: 'partenariat_producteurs' as ProductLabel, label: 'Partenariat producteurs', description: 'Collaboration directe' },
  { key: 'rituel_bien_etre' as ProductLabel, label: 'Rituel bien-être', description: 'Pour votre routine beauté' },
  { key: 'essence_precieuse' as ProductLabel, label: 'Essence précieuse', description: 'Ingrédients rares et précieux' },
  { key: 'rupture_recolte' as ProductLabel, label: 'Rupture de récolte', description: 'Stock limité cette saison' }
] as const

interface ProductFiltersProps {
  className?: string
  categories?: CategoryWithChildren[]
  selectedCategoryId?: string | undefined
  selectedLabels?: ProductLabel[]
  searchTerm?: string | undefined
  onFiltersChange?: (filters: {
    category?: string
    labels?: ProductLabel[]
    search?: string
  }) => void
}

interface SearchFilterProps {
  value?: string
  onSearchChange?: (search: string) => void
  placeholder?: string
  className?: string
}

interface CategoryFilterProps {
  categories?: CategoryWithChildren[]
  selectedCategoryId?: string | undefined
  onCategoryChange?: (categoryId: string | null) => void
  className?: string
}

interface LabelsFilterProps {
  selectedLabels?: ProductLabel[]
  onLabelsChange?: (labels: ProductLabel[]) => void
  className?: string
}

interface ActiveFiltersProps {
  categories?: CategoryWithChildren[]
  selectedCategoryId?: string | undefined
  selectedLabels?: ProductLabel[]
  searchTerm?: string | undefined
  onClearCategory?: () => void
  onClearLabel?: (label: ProductLabel) => void
  onClearSearch?: () => void
  onClearAll?: () => void
  className?: string
}

/**
 * Filtre de recherche textuelle
 */
export function SearchFilter({ 
  value = '', 
  onSearchChange, 
  placeholder,
  className 
}: SearchFilterProps) {
  const t = useTranslations('shop.filters')
  const [searchValue, setSearchValue] = useState(value)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange?.(searchValue.trim())
  }

  const handleClearSearch = () => {
    setSearchValue('')
    onSearchChange?.('')
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={placeholder || t('search.placeholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="sm" className="w-full">
            {t('search.button')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Filtre par catégories avec navigation cliente
 */
export function CategoryFilter({ 
  categories = [], 
  selectedCategoryId, 
  onCategoryChange,
  className 
}: CategoryFilterProps) {
  const t = useTranslations('shop.filters')
  
  const renderCategoryItem = (category: CategoryWithChildren, level = 0) => {
    const isSelected = category.id === selectedCategoryId
    
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
          {category.name}
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

/**
 * Filtre par labels HerbisVeritas
 */
export function LabelsFilter({ 
  selectedLabels = [], 
  onLabelsChange,
  className 
}: LabelsFilterProps) {
  const t = useTranslations('shop.filters')

  const handleLabelToggle = (labelKey: ProductLabel) => {
    const newLabels = selectedLabels.includes(labelKey)
      ? selectedLabels.filter(l => l !== labelKey)
      : [...selectedLabels, labelKey]
    onLabelsChange?.(newLabels)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('labels.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {HERBIS_VERITAS_LABELS.map(({ key, label, description }) => (
            <label 
              key={key}
              className="flex items-start space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedLabels.includes(key)}
                onChange={() => handleLabelToggle(key)}
                className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
              </div>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Affichage des filtres actifs avec possibilité de suppression
 */
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
              {selectedCategory.name}
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

/**
 * Composant principal gérant tous les filtres avec navigation
 */
export function ProductFilters({ 
  className,
  categories = [],
  selectedCategoryId,
  selectedLabels = [],
  searchTerm = '',
  onFiltersChange
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Navigation avec mise à jour URL
  const updateFilters = React.useCallback((updates: {
    category?: string | null
    labels?: ProductLabel[]
    search?: string
  }) => {
    const params = new URLSearchParams(searchParams)
    
    // Mise à jour catégorie
    if (updates.category !== undefined) {
      if (updates.category) {
        params.set('category', updates.category)
      } else {
        params.delete('category')
      }
    }
    
    // Mise à jour labels
    if (updates.labels !== undefined) {
      if (updates.labels.length > 0) {
        params.set('labels', updates.labels.join(','))
      } else {
        params.delete('labels')
      }
    }
    
    // Mise à jour recherche
    if (updates.search !== undefined) {
      if (updates.search.trim()) {
        params.set('search', updates.search.trim())
      } else {
        params.delete('search')
      }
    }
    
    // Reset à la page 1 quand on change les filtres
    params.delete('page')
    
    router.push(`${pathname}?${params.toString()}`)
    onFiltersChange?.(updates as any)
  }, [router, pathname, searchParams, onFiltersChange])

  const handleClearAll = () => {
    updateFilters({ category: null, labels: [], search: '' })
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filtres actifs */}
      <ActiveFilters
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        selectedLabels={selectedLabels}
        searchTerm={searchTerm}
        onClearCategory={() => updateFilters({ category: null })}
        onClearLabel={(label) => updateFilters({ 
          labels: selectedLabels.filter(l => l !== label) 
        })}
        onClearSearch={() => updateFilters({ search: '' })}
        onClearAll={handleClearAll}
      />
      
      {/* Recherche */}
      <SearchFilter
        value={searchTerm}
        onSearchChange={(search) => updateFilters({ search })}
      />
      
      {/* Catégories */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={(category) => updateFilters({ category })}
      />
      
      {/* Labels */}
      <LabelsFilter
        selectedLabels={selectedLabels}
        onLabelsChange={(labels) => updateFilters({ labels })}
      />
    </div>
  )
}

// Utilitaire pour trouver une catégorie par ID
function findCategoryById(categories: CategoryWithChildren[], id: string): CategoryWithChildren | null {
  for (const category of categories) {
    if (category.id === id) return category
    if (category.children) {
      const found = findCategoryById(category.children, id)
      if (found) return found
    }
  }
  return null
}