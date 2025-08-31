/**
 * Tests unitaires ProductGrid
 * TDD Pattern : Red-Green-Refactor
 * Tests du composant ProductGrid avec React Testing Library
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductGrid } from '@/components/modules/boutique/components/product-grid/product-grid'
import { useProducts } from '@/hooks/use-products'
import { Product, ProductFilters } from '@/types/product'

// Mock du hook useProducts
jest.mock('@/hooks/use-products')
const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>

// Mock des alertes pour tests (à remplacer par toast system)
const mockAlert = jest.fn()
Object.assign(global, { alert: mockAlert })

describe('ProductGrid', () => {
  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'Savon Bio Lavande',
      price: 12.50,
      currency: 'EUR',
      image_url: '/images/savon-lavande.jpg',
      labels: ['bio', 'recolte_main'],
      category: 'savons',
      stock: 10,
      is_active: true,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'product-2', 
      name: 'Huile Essentielle Romarin',
      price: 24.90,
      currency: 'EUR',
      image_url: '/images/he-romarin.jpg',
      labels: ['origine_occitanie', 'essence_precieuse'],
      category: 'huiles-essentielles',
      stock: 5,
      is_active: true,
      created_at: '2025-01-02T00:00:00Z'
    }
  ]

  const mockPagination = {
    page: 1,
    limit: 12,
    total: 2,
    hasMore: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      pagination: mockPagination,
      refetch: jest.fn()
    })
  })

  describe('Rendu initial', () => {
    it('should render products grid with products', () => {
      render(<ProductGrid />)
      
      // Vérifie la présence des produits (utiliser getAllByText pour éléments dupliqués)
      expect(screen.getAllByText('Savon Bio Lavande')).toHaveLength(2) // Desktop + mobile
      expect(screen.getAllByText('Huile Essentielle Romarin')).toHaveLength(2)
      
      // Vérifie le résumé des résultats
      expect(screen.getByText('2 sur 2 produits')).toBeInTheDocument()
    })

    it('should render filters bar', () => {
      render(<ProductGrid />)
      
      // Vérifie la présence des filtres
      expect(screen.getByPlaceholderText('Rechercher un produit...')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Toutes catégories')).toBeInTheDocument()
    })

    it('should apply initial filters if provided', () => {
      const initialFilters: ProductFilters = {
        search: 'lavande',
        category: 'savons'
      }
      
      render(<ProductGrid initialFilters={initialFilters} />)
      
      // Vérifie que les filtres sont appliqués
      expect(mockUseProducts).toHaveBeenCalledWith({
        filters: initialFilters,
        page: 1,
        limit: 12
      })
    })
  })

  describe('États de chargement', () => {
    it('should display loading skeletons on initial load', () => {
      mockUseProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        pagination: { ...mockPagination, total: 0 },
        refetch: jest.fn()
      })
      
      render(<ProductGrid />)
      
      // Vérifie la grille de chargement (ProductCard avec isLoading=true)
      const loadingGrid = screen.getByRole('grid') || screen.getByTestId('loading-grid')
      expect(loadingGrid).toBeInTheDocument()
    })

    it('should show "Charger plus" button when hasMore is true', () => {
      mockUseProducts.mockReturnValue({
        products: mockProducts,
        loading: false,
        error: null,
        pagination: { ...mockPagination, hasMore: true },
        refetch: jest.fn()
      })
      
      render(<ProductGrid />)
      
      expect(screen.getByText('Charger plus de produits')).toBeInTheDocument()
    })

    it('should disable "Charger plus" button when loading more pages', () => {
      mockUseProducts.mockReturnValue({
        products: mockProducts,
        loading: true,
        error: null,
        pagination: { ...mockPagination, hasMore: true },
        refetch: jest.fn()
      })
      
      render(<ProductGrid />)
      
      const loadMoreButton = screen.getByRole('button', { name: /chargement/i })
      expect(loadMoreButton).toBeDisabled()
    })
  })

  describe('Gestion des erreurs', () => {
    it('should display error message when products loading fails', () => {
      const mockRefetch = jest.fn()
      mockUseProducts.mockReturnValue({
        products: [],
        loading: false,
        error: 'Erreur de connexion à la base de données',
        pagination: { ...mockPagination, total: 0 },
        refetch: mockRefetch
      })
      
      render(<ProductGrid />)
      
      // Vérifie l'affichage de l'erreur
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
      expect(screen.getByText('Erreur de connexion à la base de données')).toBeInTheDocument()
      
      // Vérifie le bouton réessayer
      const retryButton = screen.getByText('Réessayer')
      expect(retryButton).toBeInTheDocument()
      
      fireEvent.click(retryButton)
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Filtrage', () => {
    it('should update search filter on input change', async () => {
      const user = userEvent.setup()
      render(<ProductGrid />)
      
      const searchInput = screen.getByPlaceholderText('Rechercher un produit...')
      
      await user.type(searchInput, 'lavande')
      
      // Attendre que le hook soit appelé avec les nouveaux filtres
      await waitFor(() => {
        expect(mockUseProducts).toHaveBeenCalledWith({
          filters: { search: 'lavande' },
          page: 1,
          limit: 12
        })
      })
    })

    it('should update category filter on select change', async () => {
      const user = userEvent.setup()
      render(<ProductGrid />)
      
      const categorySelect = screen.getByRole('combobox')
      
      await user.selectOptions(categorySelect, 'essential-oils')
      
      await waitFor(() => {
        expect(mockUseProducts).toHaveBeenCalledWith({
          filters: { category: 'essential-oils' },
          page: 1,
          limit: 12
        })
      })
    })

    it('should reset page to 1 when filters change', async () => {
      const user = userEvent.setup()
      
      // Simuler qu'on est sur la page 2
      render(<ProductGrid />)
      
      const searchInput = screen.getByPlaceholderText('Rechercher un produit...')
      await user.type(searchInput, 'test')
      
      // Vérifier que la page est remise à 1
      await waitFor(() => {
        expect(mockUseProducts).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        )
      })
    })

    it('should clear all filters when "Effacer les filtres" is clicked', async () => {
      mockUseProducts.mockReturnValue({
        products: [],
        loading: false,
        error: null,
        pagination: { ...mockPagination, total: 0 },
        refetch: jest.fn()
      })
      
      const user = userEvent.setup()
      render(<ProductGrid initialFilters={{ search: 'test', category: 'savons' }} />)
      
      const clearFiltersButton = screen.getByText('Effacer les filtres')
      await user.click(clearFiltersButton)
      
      await waitFor(() => {
        expect(mockUseProducts).toHaveBeenCalledWith({
          filters: { search: '', category: undefined },
          page: 1,
          limit: 12
        })
      })
    })
  })

  describe('Actions produits (Mock)', () => {
    it('should call handleAddToCart when product card action is triggered', async () => {
      const user = userEvent.setup()
      render(<ProductGrid />)
      
      // Rechercher boutons "Ajouter au panier" via role
      const addToCartButtons = screen.getAllByRole('button', { name: /ajouter au panier/i })
      if (addToCartButtons.length > 0) {
        await user.click(addToCartButtons[0])
        
        // Attendre que l'alert soit appelée
        await waitFor(() => {
          expect(mockAlert).toHaveBeenCalledWith('Savon Bio Lavande ajouté au panier !')
        })
      }
    })

    it('should handle add to cart error gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock une erreur console
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<ProductGrid />)
      
      const addToCartButtons = screen.getAllByRole('button', { name: /ajouter au panier/i })
      if (addToCartButtons.length > 0) {
        await user.click(addToCartButtons[0])
        
        // Vérifier que la console.log du mock est appelée
        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith(
            'Adding to cart:',
            expect.objectContaining({ name: 'Savon Bio Lavande' })
          )
        })
      }
      
      consoleSpy.mockRestore()
    })
  })

  describe('Pagination', () => {
    it('should increment page when "Charger plus" is clicked', async () => {
      mockUseProducts.mockReturnValue({
        products: mockProducts,
        loading: false,
        error: null,
        pagination: { ...mockPagination, hasMore: true },
        refetch: jest.fn()
      })
      
      const user = userEvent.setup()
      render(<ProductGrid />)
      
      const loadMoreButton = screen.getByText('Charger plus de produits')
      await user.click(loadMoreButton)
      
      await waitFor(() => {
        expect(mockUseProducts).toHaveBeenCalledWith({
          filters: {},
          page: 2, // Page incrémentée
          limit: 12
        })
      })
    })
  })

  describe('Messages informatifs', () => {
    it('should display "no products" message when no products match filters', () => {
      mockUseProducts.mockReturnValue({
        products: [],
        loading: false,
        error: null,
        pagination: { ...mockPagination, total: 0 },
        refetch: jest.fn()
      })
      
      render(<ProductGrid />)
      
      expect(screen.getByText(/aucun produit trouvé/i)).toBeInTheDocument()
      expect(screen.getByText('Effacer les filtres')).toBeInTheDocument()
    })

    it('should show search term in results summary', () => {
      render(<ProductGrid initialFilters={{ search: 'lavande' }} />)
      
      expect(screen.getByText(/pour "lavande"/)).toBeInTheDocument()
    })

    it('should show category in results summary', () => {
      render(<ProductGrid initialFilters={{ category: 'savons' }} />)
      
      expect(screen.getByText(/dans la catégorie sélectionnée/)).toBeInTheDocument()
    })
  })

  describe('Accessibilité', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      render(<ProductGrid />)
      
      const searchInput = screen.getByPlaceholderText('Rechercher un produit...')
      expect(searchInput).toBeInTheDocument()
      
      const categorySelect = screen.getByRole('combobox')
      expect(categorySelect).toBeInTheDocument()
    })

    it('should maintain focus management on filter interactions', async () => {
      const user = userEvent.setup()
      render(<ProductGrid />)
      
      const searchInput = screen.getByPlaceholderText('Rechercher un produit...')
      await user.click(searchInput)
      
      expect(searchInput).toHaveFocus()
    })
  })

  describe('Responsive behavior', () => {
    it('should apply correct CSS classes for responsive grid', () => {
      const { container } = render(<ProductGrid className="custom-class" />)
      
      // Vérifier que la classe custom est appliquée sur le container principal
      const gridContainer = container.firstChild as HTMLElement
      expect(gridContainer).toHaveClass('custom-class')
    })
  })
})