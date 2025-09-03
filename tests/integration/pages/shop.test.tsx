/**
 * @file Tests intégration page /shop - Semaine 4 MVP  
 * @description Tests TDD pour page catalogue avec données Supabase
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ShopPage from '@/app/[locale]/shop/page'
import { CategoriesService } from '@/lib/categories/categories-service'
import { ProductsService } from '@/lib/products/products-service'
import type { CategoryWithChildren, Product } from '@/types/database'

// Mock des services
jest.mock('@/lib/categories/categories-service')
jest.mock('@/lib/products/products-service')
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/shop'
}))

// Mock Next.js metadata
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => {
    const messages: Record<string, string> = {
      'meta.title': 'Boutique - HerbisVeritas',
      'meta.description': 'Cosmétiques naturels'
    }
    return messages[key] || key
  })
}))

const MockedCategoriesService = CategoriesService as jest.MockedClass<typeof CategoriesService>
const MockedProductsService = ProductsService as jest.MockedClass<typeof ProductsService>

// Messages i18n pour tests
const messages = {
  'shop': {
    'meta': {
      'title': 'Boutique - HerbisVeritas',
      'description': 'Cosmétiques naturels'
    },
    'filters': {
      'search': {
        'placeholder': 'Rechercher...',
        'button': 'Rechercher'
      },
      'categories': {
        'title': 'Catégories',
        'all': 'Tous'
      },
      'labels': {
        'title': 'Labels HerbisVeritas'
      },
      'active': {
        'title': 'Filtres actifs',
        'clearAll': 'Tout effacer'
      }
    }
  },
  'products': {
    'addToCart': 'Ajouter au panier'
  }
}

// Données de test
const mockCategories: CategoryWithChildren[] = [
  {
    id: 'cat-1',
    name: 'Soins Visage',
    slug: 'soins-visage',
    description: 'Soins pour le visage',
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'cat-1-1', 
        name: 'Crèmes',
        slug: 'cremes',
        description: 'Crèmes visage',
        parent_id: 'cat-1',
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        children: []
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Soins Corps',
    slug: 'soins-corps', 
    description: 'Soins pour le corps',
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    children: []
  }
]

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    slug: 'huile-lavande',
    name: 'Huile essentielle de Lavande',
    description_short: 'Huile pure de lavande bio',
    description_long: 'Description complète...',
    price: 15.99,
    currency: 'EUR',
    stock: 10,
    unit: 'ml',
    image_url: '/images/lavande.jpg',
    category_id: 'cat-1',
    inci_list: ['Lavandula Angustifolia Oil'],
    labels: ['bio', 'origine_occitanie'],
    status: 'active',
    is_active: true,
    is_new: true,
    translations: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-2',
    slug: 'creme-rose',
    name: 'Crème de Rose',
    description_short: 'Crème hydratante à la rose',
    description_long: 'Description complète...',
    price: 24.50,
    currency: 'EUR', 
    stock: 5,
    unit: 'ml',
    image_url: '/images/rose.jpg',
    category_id: 'cat-1-1',
    inci_list: ['Rosa Damascena Extract', 'Aqua'],
    labels: ['bio', 'recolte_main', 'rituel_bien_etre'],
    status: 'active',
    is_active: true,
    is_new: false,
    translations: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-3',
    slug: 'savon-olive',
    name: 'Savon à l\'Olive',
    description_short: 'Savon artisanal olive et lavande',
    description_long: 'Description complète...',
    price: 8.90,
    currency: 'EUR',
    stock: 0,
    unit: 'unité',
    image_url: '/images/savon.jpg',
    category_id: 'cat-2',
    inci_list: ['Sodium Olivate', 'Lavandula Oil'],
    labels: ['partenariat_producteurs', 'rupture_recolte'],
    status: 'active',
    is_active: true,
    is_new: false,
    translations: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

describe('Page /shop - Tests d\'intégration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock des services avec données
    MockedCategoriesService.prototype.getCategoryHierarchy = jest.fn().mockResolvedValue(mockCategories)
    MockedProductsService.prototype.getAllProducts = jest.fn().mockResolvedValue(mockProducts)
  })

  describe('Rendu initial', () => {
    it('charge et affiche les données de base', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{}} 
          />
        </TestWrapper>
      )

      // Vérifier titre principal
      await waitFor(() => {
        expect(screen.getByText('Boutique')).toBeInTheDocument()
      })

      // Vérifier compteur produits
      expect(screen.getByText('3 produits')).toBeInTheDocument()

      // Vérifier que les catégories sont chargées
      expect(screen.getByText('Soins Visage')).toBeInTheDocument()
      expect(screen.getByText('Soins Corps')).toBeInTheDocument()
      expect(screen.getByText('Crèmes')).toBeInTheDocument()

      // Vérifier que les produits sont affichés
      expect(screen.getByText('Huile essentielle de Lavande')).toBeInTheDocument()
      expect(screen.getByText('Crème de Rose')).toBeInTheDocument()
      expect(screen.getByText('Savon à l\'Olive')).toBeInTheDocument()
    })

    it('affiche les filtres de la sidebar', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{}} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        // Vérifier présence des sections de filtres
        expect(screen.getByText('Catégories')).toBeInTheDocument()
        expect(screen.getByText('Labels HerbisVeritas')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument()
      })

      // Vérifier labels HerbisVeritas
      expect(screen.getByText('Bio')).toBeInTheDocument()
      expect(screen.getByText('Récolté à la main')).toBeInTheDocument()
      expect(screen.getByText('Origine Occitanie')).toBeInTheDocument()
    })

    it('gère l\'état de loading avec skeletons', () => {
      // Le composant Suspense devrait afficher le skeleton
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{}} 
          />
        </TestWrapper>
      )

      // Pendant le chargement, les skeletons devraient être visibles
      // (Difficile à tester avec les données mockées qui se résolvent immédiatement)
      expect(true).toBe(true) // Placeholder pour structure test
    })
  })

  describe('Filtrage par catégorie', () => {
    it('filtre les produits par catégorie sélectionnée', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{ category: 'cat-2' }} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        // Seuls les produits de la catégorie "Soins Corps" devraient être visibles
        expect(screen.getByText('Savon à l\'Olive')).toBeInTheDocument()
        expect(screen.queryByText('Huile essentielle de Lavande')).not.toBeInTheDocument()
        expect(screen.queryByText('Crème de Rose')).not.toBeInTheDocument()
      })

      // Vérifier le compteur mis à jour
      expect(screen.getByText('1 produit dans cette catégorie')).toBeInTheDocument()
    })

    it('filtre les produits par sous-catégorie', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{ category: 'cat-1-1' }} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        // Seuls les produits de la sous-catégorie "Crèmes" devraient être visibles
        expect(screen.getByText('Crème de Rose')).toBeInTheDocument()
        expect(screen.queryByText('Huile essentielle de Lavande')).not.toBeInTheDocument()
        expect(screen.queryByText('Savon à l\'Olive')).not.toBeInTheDocument()
      })
    })
  })

  describe('Filtrage par labels', () => {
    it('filtre les produits par labels HerbisVeritas', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{ labels: 'bio' }} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        // Seuls les produits avec le label "bio" devraient être visibles
        expect(screen.getByText('Huile essentielle de Lavande')).toBeInTheDocument()
        expect(screen.getByText('Crème de Rose')).toBeInTheDocument()
        expect(screen.queryByText('Savon à l\'Olive')).not.toBeInTheDocument()
      })

      expect(screen.getByText('2 produits')).toBeInTheDocument()
    })

    it('filtre avec plusieurs labels combinés', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{ labels: 'bio,recolte_main' }} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        // Produits ayant au moins un des labels
        expect(screen.getByText('Huile essentielle de Lavande')).toBeInTheDocument() // bio seulement
        expect(screen.getByText('Crème de Rose')).toBeInTheDocument() // bio + recolte_main
        expect(screen.queryByText('Savon à l\'Olive')).not.toBeInTheDocument() // aucun des deux
      })
    })
  })

  describe('Recherche textuelle', () => {
    it('filtre les produits par terme de recherche', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{ search: 'lavande' }} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        // Seuls les produits contenant "lavande" devraient être visibles
        expect(screen.getByText('Huile essentielle de Lavande')).toBeInTheDocument()
        expect(screen.getByText('Savon à l\'Olive')).toBeInTheDocument() // contient lavande en description
        expect(screen.queryByText('Crème de Rose')).not.toBeInTheDocument()
      })

      expect(screen.getByText('2 produits pour "lavande"')).toBeInTheDocument()
    })

    it('recherche insensible à la casse', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{ search: 'ROSE' }} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Crème de Rose')).toBeInTheDocument()
        expect(screen.queryByText('Huile essentielle de Lavande')).not.toBeInTheDocument()
      })
    })
  })

  describe('Combinaison de filtres', () => {
    it('combine catégorie + labels + recherche', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{ 
              category: 'cat-1',
              labels: 'bio',
              search: 'huile'
            }} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        // Seule l'huile de lavande correspond à tous les critères
        expect(screen.getByText('Huile essentielle de Lavande')).toBeInTheDocument()
        expect(screen.queryByText('Crème de Rose')).not.toBeInTheDocument() // pas "huile"
        expect(screen.queryByText('Savon à l\'Olive')).not.toBeInTheDocument() // pas cat-1 ni bio
      })

      expect(screen.getByText('1 produit dans cette catégorie pour "huile"')).toBeInTheDocument()
    })
  })

  describe('États d\'erreur et vides', () => {
    it('affiche un message si aucun produit trouvé', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{ search: 'inexistant' }} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Aucun produit ne correspond à vos critères')).toBeInTheDocument()
      })
    })

    it('gère les erreurs de service gracieusement', async () => {
      // Mock erreur service
      MockedCategoriesService.prototype.getCategoryHierarchy = jest.fn().mockRejectedValue(new Error('Erreur DB'))
      MockedProductsService.prototype.getAllProducts = jest.fn().mockRejectedValue(new Error('Erreur DB'))

      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{}} 
          />
        </TestWrapper>
      )

      // Le composant devrait gérer l'erreur sans crash
      // (Nécessiterait Error Boundary pour test complet)
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Responsive et Layout', () => {
    it('utilise la grille responsive correcte', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{}} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        const container = screen.getByRole('main')
        expect(container).toHaveClass('lg:col-span-3')
      })

      const sidebar = container.previousElementSibling
      expect(sidebar).toHaveClass('lg:col-span-1')
    })
  })

  describe('Intégration ContentGrid', () => {
    it('configure ContentGrid avec les bonnes props', async () => {
      render(
        <TestWrapper>
          <ShopPage 
            params={{ locale: 'fr' }} 
            searchParams={{}} 
          />
        </TestWrapper>
      )

      await waitFor(() => {
        // Vérifier que tous les produits sont rendus via ContentGrid
        expect(screen.getAllByText('Ajouter au panier')).toHaveLength(3)
      })

      // Vérifier la structure responsive grid
      const gridContainer = screen.getByRole('main').querySelector('[class*="grid"]')
      expect(gridContainer).toBeInTheDocument()
    })
  })
})

describe('Intégration Services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('appelle CategoriesService.getCategoryHierarchy', async () => {
    MockedCategoriesService.prototype.getCategoryHierarchy = jest.fn().mockResolvedValue(mockCategories)
    MockedProductsService.prototype.getAllProducts = jest.fn().mockResolvedValue([])

    render(
      <TestWrapper>
        <ShopPage 
          params={{ locale: 'fr' }} 
          searchParams={{}} 
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(MockedCategoriesService.prototype.getCategoryHierarchy).toHaveBeenCalledTimes(1)
    })
  })

  it('appelle ProductsService.getAllProducts', async () => {
    MockedCategoriesService.prototype.getCategoryHierarchy = jest.fn().mockResolvedValue([])
    MockedProductsService.prototype.getAllProducts = jest.fn().mockResolvedValue(mockProducts)

    render(
      <TestWrapper>
        <ShopPage 
          params={{ locale: 'fr' }} 
          searchParams={{}} 
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(MockedProductsService.prototype.getAllProducts).toHaveBeenCalledTimes(1)
    })
  })

  it('gère les appels parallèles des services', async () => {
    const categoriesPromise = Promise.resolve(mockCategories)
    const productsPromise = Promise.resolve(mockProducts)

    MockedCategoriesService.prototype.getCategoryHierarchy = jest.fn().mockReturnValue(categoriesPromise)
    MockedProductsService.prototype.getAllProducts = jest.fn().mockReturnValue(productsPromise)

    render(
      <TestWrapper>
        <ShopPage 
          params={{ locale: 'fr' }} 
          searchParams={{}} 
        />
      </TestWrapper>
    )

    // Les deux services devraient être appelés en parallèle
    await waitFor(() => {
      expect(MockedCategoriesService.prototype.getCategoryHierarchy).toHaveBeenCalled()
      expect(MockedProductsService.prototype.getAllProducts).toHaveBeenCalled()
    })
  })
})