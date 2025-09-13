/**
 * @file Service pour gestion produits - STUB TEMPORAIRE
 * @description Stub temporaire pour éviter les erreurs de build TypeScript
 */

import type { Product, ProductLabel } from '@/types/database'

export interface InciValidationResult {
  isValid: boolean
  errors: string[]
}

export class ProductsService {
  /**
   * Récupère tous les produits actifs triés par date de création
   */
  async getAllProducts(): Promise<Product[]> {
    return []
  }

  /**
   * Récupère les produits filtrés par label spécifique
   */
  async getProductsByLabel(_label: ProductLabel): Promise<Product[]> {
    return []
  }

  /**
   * Récupère les produits avec stock faible
   */
  async getProductsWithLowStock(_threshold: number = 10): Promise<Product[]> {
    return []
  }

  /**
   * Récupère un produit par son slug
   */
  async getProductBySlug(_slug: string): Promise<Product | null> {
    return null
  }

  /**
   * Récupère les produits d'une catégorie
   */
  async getProductsByCategory(_categoryId: string): Promise<Product[]> {
    return []
  }

  /**
   * Recherche de produits par nom ou description
   */
  async searchProducts(_searchTerm: string): Promise<Product[]> {
    return []
  }
}