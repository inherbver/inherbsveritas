import type { CategoryWithChildren } from '@/types/database'

// Utilitaire pour récupérer le nom localisé d'une catégorie
export function getCategoryName(category: CategoryWithChildren, locale: string): string {
  return category.translations[locale]?.name || 
         category.translations['fr']?.name || 
         category.slug
}