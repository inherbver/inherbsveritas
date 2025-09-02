'use client'

/**
 * CategoryCard - Wrapper ContentCard pour Categories CRUD Admin
 * 
 * Utilise le système ContentCard générique avec variant spécialisé
 * Intégration i18n JSONB + navigation hiérarchique
 */

import * as React from "react"
import { Edit, Trash2, Eye, Plus, ChevronRight } from "lucide-react"
import { ContentCard, type ContentCardAction, type ContentCardBadge } from "@/components/ui/content-card"
import { CategoryTree } from "@/types/herbis-veritas"

export interface CategoryCardProps {
  /** Category data with i18n */
  category: CategoryTree
  /** Current locale */
  locale?: 'fr' | 'en'
  /** Admin actions handlers */
  onEdit?: (category: CategoryTree) => void
  onDelete?: (category: CategoryTree) => void
  onView?: (category: CategoryTree) => void
  onAddChild?: (category: CategoryTree) => void
  /** Show product count */
  showProductCount?: boolean
  /** Product count if available */
  productCount?: number
  /** Loading states */
  isDeleting?: boolean
  /** Visual variant */
  variant?: 'default' | 'compact' | 'admin'
  /** Custom className */
  className?: string
}

// Helper pour obtenir la catégorie localisée
function useLocalizedCategory(category: CategoryTree, locale: 'fr' | 'en' = 'fr') {
  return React.useMemo(() => {
    const localized = category.i18n[locale]
    return {
      name: localized.name,
      description: localized.description
    }
  }, [category, locale])
}

export function CategoryCard({
  category,
  locale = 'fr',
  onEdit,
  onDelete,
  onView,
  onAddChild,
  showProductCount = false,
  productCount = 0,
  isDeleting = false,
  variant = 'default',
  className
}: CategoryCardProps) {
  const localized = useLocalizedCategory(category, locale)

  // Actions admin spécialisées categories
  const categoryActions: ContentCardAction[] = []

  // Action voir (toujours disponible)
  if (onView) {
    categoryActions.push({
      label: locale === 'fr' ? 'Voir' : 'View',
      onClick: () => onView(category),
      variant: 'ghost',
      icon: Eye
    })
  }

  // Action ajouter enfant si pas trop de niveaux
  if (onAddChild && category.level < 3) { // Max 3 niveaux
    categoryActions.push({
      label: locale === 'fr' ? 'Ajouter' : 'Add child',
      onClick: () => onAddChild(category),
      variant: 'secondary',
      icon: Plus
    })
  }

  // Action éditer
  if (onEdit) {
    categoryActions.push({
      label: locale === 'fr' ? 'Éditer' : 'Edit',
      onClick: () => onEdit(category),
      variant: 'default',
      icon: Edit
    })
  }

  // Action supprimer (attention)
  if (onDelete) {
    const hasChildren = Boolean(category.children && category.children.length > 0)
    const isDisabled = Boolean(isDeleting || hasChildren)
    categoryActions.push({
      label: locale === 'fr' ? 'Supprimer' : 'Delete',
      onClick: () => onDelete(category),
      variant: 'ghost',
      icon: Trash2,
      loading: isDeleting,
      disabled: isDisabled
    })
  }

  // Badges d'état
  const categoryBadges: ContentCardBadge[] = []

  // Badge niveau hiérarchique
  if (category.level > 0) {
    categoryBadges.push({
      label: `Niveau ${category.level}`,
      variant: 'category'
    })
  }

  // Badge catégorie racine
  if (category.level === 0) {
    categoryBadges.push({
      label: locale === 'fr' ? 'Racine' : 'Root',
      variant: 'status'
    })
  }

  // Badge inactif
  if (!category.is_active) {
    categoryBadges.push({
      label: locale === 'fr' ? 'Inactive' : 'Inactive',
      variant: 'rupture' // Rouge pour attirer attention
    })
  }

  // Métadonnées categories
  const categoryMetadata = {
    category: category.parent_id ? 'Sous-catégorie' : 'Catégorie principale',
    ...(showProductCount && { productCount }),
    // Date de création
    date: new Date(category.created_at)
  }

  // Contenu personnalisé hiérarchie
  const hierarchyContent = category.children && category.children.length > 0 && (
    <div className="mt-3 pt-3 border-t">
      <div className="flex items-center text-xs text-muted-foreground mb-2">
        <ChevronRight className="w-3 h-3 mr-1" />
        {category.children.length} {locale === 'fr' ? 'sous-catégorie(s)' : 'subcategory(ies)'}
      </div>
      <div className="space-y-1">
        {category.children.slice(0, 3).map(child => {
          const childLocalized = child.i18n[locale]
          return (
            <div key={child.id} className="text-xs text-muted-foreground flex items-center">
              <div className="w-2 h-2 rounded-full bg-muted mr-2" />
              {childLocalized.name}
            </div>
          )
        })}
        {category.children.length > 3 && (
          <div className="text-xs text-muted-foreground">
            ... et {category.children.length - 3} autre(s)
          </div>
        )}
      </div>
    </div>
  )

  return (
    <ContentCard
      // Identification
      slug={category.slug}
      title={localized.name}
      {...(localized.description && { description: localized.description })}
      {...(category.image_url && { imageUrl: category.image_url })}
      imageAlt={localized.name}
      
      // Configuration spécialisée catégorie
      variant="partner" // Aspect 2/1 adapté aux catégories
      layout={variant === 'compact' ? 'compact' : 'default'}
      
      // Données
      metadata={categoryMetadata}
      badges={categoryBadges}
      actions={categoryActions}
      
      // Navigation admin
      {...(variant === 'admin' && { href: `/admin/categories/${category.slug}` })}
      
      // État
      {...(className && { className })}
      
      // Contenu spécialisé hiérarchie
      customContent={hierarchyContent}
    />
  )
}

// Hook pour gestion état categories admin
export function useCategoryActions(locale: 'fr' | 'en' = 'fr') {
  const [isLoading, setIsLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleEdit = React.useCallback(async (category: CategoryTree) => {
    // TODO: Intégrer avec router admin
    console.log('Edit category:', category.id)
  }, [])

  const handleDelete = React.useCallback(async (category: CategoryTree) => {
    if (!confirm(locale === 'fr' ? 
      `Êtes-vous sûr de supprimer "${category.i18n[locale].name}" ?` :
      `Are you sure to delete "${category.i18n[locale].name}"?`
    )) {
      return
    }

    setIsLoading(category.id)
    setError(null)

    try {
      // TODO: Appel API suppression
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      console.log('Deleted category:', category.id)
    } catch (err) {
      setError(locale === 'fr' ? 'Erreur lors de la suppression' : 'Error during deletion')
      console.error('Delete error:', err)
    } finally {
      setIsLoading(null)
    }
  }, [locale])

  const handleView = React.useCallback(async (category: CategoryTree) => {
    // TODO: Navigation vers page catégorie
    console.log('View category:', category.slug)
  }, [])

  const handleAddChild = React.useCallback(async (category: CategoryTree) => {
    // TODO: Ouvrir modal création sous-catégorie
    console.log('Add child to category:', category.id)
  }, [])

  return {
    handleEdit,
    handleDelete,
    handleView,
    handleAddChild,
    isLoading,
    error
  }
}

// Export hook helper pour localization
export { useLocalizedCategory }