/**
 * @file Utilitaires pour les filtres produits - Semaine 4 MVP
 * @description Fonctions utilitaires et helpers pour les filtres
 */

import type { CategoryWithChildren } from '@/types/database'

/**
 * Récupère le nom localisé d'une catégorie
 */
export function getCategoryName(category: CategoryWithChildren, locale: string): string {
  return category.translations[locale]?.name || 
         category.translations['fr']?.name || 
         category.slug
}

/**
 * Trouve une catégorie par ID de manière récursive
 */
export function findCategoryById(
  categories: CategoryWithChildren[], 
  id: string
): CategoryWithChildren | null {
  for (const category of categories) {
    if (category.id === id) return category
    if (category.children) {
      const found = findCategoryById(category.children, id)
      if (found) return found
    }
  }
  return null
}