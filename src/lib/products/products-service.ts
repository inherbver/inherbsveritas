/**
 * @file Service pour gestion produits avec labels HerbisVeritas
 * @description CRUD products avec labels cosmétiques et validation INCI
 */

import { createClient } from '@/lib/supabase/client'
import type { 
  Product, 
  ProductInput,
  ProductLabel 
} from '@/types/database'

export interface InciValidationResult {
  isValid: boolean
  errors: string[]
}

export class ProductsService {
  private supabase = createClient()

  /**
   * Récupère tous les produits actifs triés par date de création
   */
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erreur lors de la récupération des produits: ${error.message}`)
    }

    return data || []
  }

  /**
   * Crée un nouveau produit avec labels HerbisVeritas
   */
  async createProduct(productInput: ProductInput): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .insert(productInput)
      .select()

    if (error) {
      throw new Error(`Erreur lors de la création du produit: ${error.message}`)
    }

    return data[0]
  }

  /**
   * Récupère les produits filtrés par label spécifique
   */
  async getProductsByLabel(label: ProductLabel): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .contains('labels', [label])

    if (error) {
      throw new Error(`Erreur lors de la récupération des produits par label: ${error.message}`)
    }

    return data || []
  }

  /**
   * Met à jour un produit existant
   */
  async updateProduct(productId: string, updates: Partial<ProductInput>): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()

    if (error) {
      throw new Error(`Erreur lors de la mise à jour du produit: ${error.message}`)
    }

    return data[0]
  }

  /**
   * Valide une liste d'ingrédients INCI selon les règles cosmétiques
   */
  validateInciList(inciList: string[]): InciValidationResult {
    const errors: string[] = []
    
    inciList.forEach(ingredient => {
      // Vérifier si l'ingrédient n'est pas vide
      if (!ingredient || ingredient.trim() === '') {
        errors.push('Nom INCI vide détecté')
        return
      }

      // Vérifier le format INCI (commence par une majuscule, contient seulement lettres, espaces et certains caractères)
      const inciPattern = /^[A-Z][a-zA-Z\s\-()0-9]*$/
      if (!inciPattern.test(ingredient.trim())) {
        errors.push(`Nom INCI invalide: "${ingredient}"`)
        return
      }

      // Vérifier que ce n'est pas un nom français courant
      const frenchNames = ['eau', 'huile', 'beurre', 'parfum']
      if (frenchNames.includes(ingredient.toLowerCase())) {
        errors.push(`Nom INCI invalide: "${ingredient}"`)
        return
      }
    })

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * Récupère les produits avec stock faible
   */
  async getProductsWithLowStock(threshold: number = 10): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .lte('stock', threshold)
      .order('stock', { ascending: true })

    if (error) {
      throw new Error(`Erreur lors de la récupération des produits en stock faible: ${error.message}`)
    }

    return data || []
  }

  /**
   * Récupère un produit par son slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Produit non trouvé
      }
      throw new Error(`Erreur lors de la récupération du produit: ${error.message}`)
    }

    return data
  }

  /**
   * Récupère les produits d'une catégorie
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erreur lors de la récupération des produits par catégorie: ${error.message}`)
    }

    return data || []
  }

  /**
   * Supprime un produit (soft delete)
   */
  async deleteProduct(productId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('products')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (error) {
      throw new Error(`Erreur lors de la suppression du produit: ${error.message}`)
    }

    return true
  }

  /**
   * Recherche de produits par nom ou description
   */
  async searchProducts(searchTerm: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description_short.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erreur lors de la recherche de produits: ${error.message}`)
    }

    return data || []
  }
}