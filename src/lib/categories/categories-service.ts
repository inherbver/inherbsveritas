/**
 * @file Service pour gestion catégories hiérarchiques - STUB TEMPORAIRE
 * @description Stub temporaire pour éviter les erreurs de build TypeScript
 */

import type { Category, CategoryWithChildren } from '@/types/database'

export class CategoriesService {
  /**
   * Récupère toutes les catégories racine (parent_id = null)
   * triées par sort_order
   */
  async getRootCategories(): Promise<Category[]> {
    return []
  }

  /**
   * Récupère une catégorie avec ses sous-catégories
   */
  async getCategoryWithChildren(_categoryId: string): Promise<CategoryWithChildren | null> {
    return null
  }

  /**
   * Construit l'arbre hiérarchique complet des catégories
   */
  async getCategoryHierarchy(): Promise<CategoryWithChildren[]> {
    return []
  }
}