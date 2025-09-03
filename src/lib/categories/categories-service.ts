/**
 * @file Service pour gestion catégories hiérarchiques
 * @description CRUD categories avec i18n JSONB et navigation hiérarchique
 */

import { createClient } from '@/lib/supabase/client'
import type { 
  Category, 
  CategoryWithChildren, 
  CategoryInput 
} from '@/types/database'

export class CategoriesService {
  private supabase = createClient()

  /**
   * Récupère toutes les catégories racine (parent_id = null)
   * triées par sort_order
   */
  async getRootCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('sort_order', { ascending: true })

    if (error) {
      throw new Error(`Erreur lors de la récupération des catégories racine: ${error.message}`)
    }

    return data || []
  }

  /**
   * Récupère une catégorie avec ses sous-catégories
   */
  async getCategoryWithChildren(categoryId: string): Promise<CategoryWithChildren | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select(`
        *,
        children:categories!parent_id(*)
      `)
      .eq('id', categoryId)

    if (error) {
      throw new Error(`Erreur lors de la récupération de la catégorie: ${error.message}`)
    }

    return data?.[0] || null
  }

  /**
   * Crée une nouvelle catégorie
   */
  async createCategory(categoryInput: CategoryInput): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert(categoryInput)
      .select()

    if (error) {
      throw new Error(`Erreur lors de la création de la catégorie: ${error.message}`)
    }

    return data[0]
  }

  /**
   * Met à jour une catégorie existante
   */
  async updateCategory(categoryId: string, updates: Partial<CategoryInput>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la catégorie: ${error.message}`)
    }

    return data[0]
  }

  /**
   * Supprime une catégorie (vérifie qu'elle n'a pas d'enfants)
   */
  async deleteCategory(categoryId: string): Promise<boolean> {
    // Vérifier d'abord s'il y a des sous-catégories
    const { data: children, error: childrenError } = await this.supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)

    if (childrenError) {
      throw new Error(`Erreur lors de la vérification des sous-catégories: ${childrenError.message}`)
    }

    if (children && children.length > 0) {
      throw new Error('Impossible de supprimer une catégorie qui a des sous-catégories')
    }

    // Supprimer la catégorie
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      throw new Error(`Erreur lors de la suppression de la catégorie: ${error.message}`)
    }

    return true
  }

  /**
   * Construit l'arbre hiérarchique complet des catégories
   */
  async getCategoryHierarchy(): Promise<CategoryWithChildren[]> {
    // Récupérer toutes les catégories
    const { data: allCategories, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      throw new Error(`Erreur lors de la récupération de la hiérarchie: ${error.message}`)
    }

    if (!allCategories) return []

    // Construire l'arbre
    const categoryMap = new Map<string, CategoryWithChildren>()
    const rootCategories: CategoryWithChildren[] = []

    // Créer la map des catégories
    allCategories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Construire l'arbre
    allCategories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!
      
      if (category.parent_id) {
        // C'est une sous-catégorie
        const parent = categoryMap.get(category.parent_id)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(categoryWithChildren)
        }
      } else {
        // C'est une catégorie racine
        rootCategories.push(categoryWithChildren)
      }
    })

    return rootCategories
  }
}