/**
 * @file Tests unitaires ProductFilters - Semaine 4 MVP
 * @description Tests TDD pour composants filtres catalogue avec navigation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { 
  ProductFilters,
  SearchFilter, 
  CategoryFilter,
  LabelsFilter,
  ActiveFilters,
  HERBIS_VERITAS_LABELS
} from '@/components/shop/product-filters'
import type { CategoryWithChildren, ProductLabel } from '@/types/database'

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn()
}))

const mockPush = jest.fn()
const mockRouter = { push: mockPush }
const mockSearchParams = new URLSearchParams()
const mockPathname = '/shop'

// Messages pour tests
const messages = {
  'shop.filters.search.placeholder': 'Rechercher un produit...',
  'shop.filters.search.button': 'Rechercher',
  'shop.filters.categories.title': 'Catégories',
  'shop.filters.categories.all': 'Tous les produits',
  'shop.filters.labels.title': 'Labels HerbisVeritas',
  'shop.filters.active.title': 'Filtres actifs',
  'shop.filters.active.clearAll': 'Tout effacer'
}

// Données de test
const mockCategories: CategoryWithChildren[] = [
  {
    id: 'cat-1',
    name: 'Soins visage',
    slug: 'soins-visage',
    description: 'Soins pour le visage',
    sort_order: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    children: [
      {
        id: 'cat-1-1',
        name: 'Crèmes',
        slug: 'cremes',
        description: 'Crèmes visage',
        parent_id: 'cat-1',
        sort_order: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        children: []
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Soins corps',
    slug: 'soins-corps',
    description: 'Soins pour le corps',
    sort_order: 2,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    children: []
  }
]

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

describe('SearchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche le champ de recherche avec placeholder', () => {
    render(
      <TestWrapper>
        <SearchFilter />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('Rechercher un produit...')).toBeInTheDocument()
    expect(screen.getByText('Rechercher')).toBeInTheDocument()
  })

  it('met à jour la valeur de recherche', () => {
    render(
      <TestWrapper>
        <SearchFilter value="test" />
      </TestWrapper>
    )

    const input = screen.getByDisplayValue('test')
    expect(input).toBeInTheDocument()
  })

  it('appelle onSearchChange lors de la soumission', async () => {
    const onSearchChange = jest.fn()
    
    render(
      <TestWrapper>
        <SearchFilter onSearchChange={onSearchChange} />
      </TestWrapper>
    )

    const input = screen.getByPlaceholderText('Rechercher un produit...')
    const button = screen.getByText('Rechercher')

    fireEvent.change(input, { target: { value: 'lavande' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('lavande')
    })
  })

  it('efface la recherche avec le bouton X', async () => {
    const onSearchChange = jest.fn()
    
    render(
      <TestWrapper>
        <SearchFilter value="test" onSearchChange={onSearchChange} />
      </TestWrapper>
    )

    const input = screen.getByDisplayValue('test')
    fireEvent.change(input, { target: { value: 'nouveau test' } })
    
    // Le bouton X devrait apparaître
    const clearButton = screen.getByRole('button', { name: '' }) // X button
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('')
    })
  })
})

describe('CategoryFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche toutes les catégories avec hiérarchie', () => {
    render(
      <TestWrapper>
        <CategoryFilter categories={mockCategories} />
      </TestWrapper>
    )

    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('Tous les produits')).toBeInTheDocument()
    expect(screen.getByText('Soins visage')).toBeInTheDocument()
    expect(screen.getByText('Soins corps')).toBeInTheDocument()
    expect(screen.getByText('Crèmes')).toBeInTheDocument()
  })

  it('met en surbrillance la catégorie sélectionnée', () => {
    render(
      <TestWrapper>
        <CategoryFilter 
          categories={mockCategories} 
          selectedCategoryId="cat-1"
        />
      </TestWrapper>
    )

    const selectedButton = screen.getByText('Soins visage')
    expect(selectedButton).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('appelle onCategoryChange lors du clic', async () => {
    const onCategoryChange = jest.fn()
    
    render(
      <TestWrapper>
        <CategoryFilter 
          categories={mockCategories}
          onCategoryChange={onCategoryChange}
        />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('Soins visage'))

    await waitFor(() => {
      expect(onCategoryChange).toHaveBeenCalledWith('cat-1')
    })
  })

  it('désélectionne une catégorie déjà sélectionnée', async () => {
    const onCategoryChange = jest.fn()
    
    render(
      <TestWrapper>
        <CategoryFilter 
          categories={mockCategories}
          selectedCategoryId="cat-1"
          onCategoryChange={onCategoryChange}
        />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('Soins visage'))

    await waitFor(() => {
      expect(onCategoryChange).toHaveBeenCalledWith(null)
    })
  })
})

describe('LabelsFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche tous les labels HerbisVeritas', () => {
    render(
      <TestWrapper>
        <LabelsFilter />
      </TestWrapper>
    )

    expect(screen.getByText('Labels HerbisVeritas')).toBeInTheDocument()
    
    HERBIS_VERITAS_LABELS.forEach(({ label, description }) => {
      expect(screen.getByText(label)).toBeInTheDocument()
      expect(screen.getByText(description)).toBeInTheDocument()
    })
  })

  it('coche les labels sélectionnés', () => {
    render(
      <TestWrapper>
        <LabelsFilter selectedLabels={['bio', 'recolte_main']} />
      </TestWrapper>
    )

    const bioCheckbox = screen.getByRole('checkbox', { name: /Bio/ })
    const recolteCheckbox = screen.getByRole('checkbox', { name: /Récolté à la main/ })
    const origineCheckbox = screen.getByRole('checkbox', { name: /Origine Occitanie/ })

    expect(bioCheckbox).toBeChecked()
    expect(recolteCheckbox).toBeChecked()
    expect(origineCheckbox).not.toBeChecked()
  })

  it('appelle onLabelsChange lors du toggle', async () => {
    const onLabelsChange = jest.fn()
    
    render(
      <TestWrapper>
        <LabelsFilter 
          selectedLabels={['bio']}
          onLabelsChange={onLabelsChange}
        />
      </TestWrapper>
    )

    const recolteCheckbox = screen.getByRole('checkbox', { name: /Récolté à la main/ })
    fireEvent.click(recolteCheckbox)

    await waitFor(() => {
      expect(onLabelsChange).toHaveBeenCalledWith(['bio', 'recolte_main'])
    })
  })

  it('retire un label déjà sélectionné', async () => {
    const onLabelsChange = jest.fn()
    
    render(
      <TestWrapper>
        <LabelsFilter 
          selectedLabels={['bio', 'recolte_main']}
          onLabelsChange={onLabelsChange}
        />
      </TestWrapper>
    )

    const bioCheckbox = screen.getByRole('checkbox', { name: /Bio/ })
    fireEvent.click(bioCheckbox)

    await waitFor(() => {
      expect(onLabelsChange).toHaveBeenCalledWith(['recolte_main'])
    })
  })
})

describe('ActiveFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('n\'affiche rien si aucun filtre actif', () => {
    const { container } = render(
      <TestWrapper>
        <ActiveFilters />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })

  it('affiche les filtres actifs avec compteur', () => {
    render(
      <TestWrapper>
        <ActiveFilters
          categories={mockCategories}
          selectedCategoryId="cat-1"
          selectedLabels={['bio', 'recolte_main'] as ProductLabel[]}
          searchTerm="lavande"
        />
      </TestWrapper>
    )

    expect(screen.getByText('Filtres actifs (3)')).toBeInTheDocument()
    expect(screen.getByText('Soins visage')).toBeInTheDocument()
    expect(screen.getByText('Bio')).toBeInTheDocument()
    expect(screen.getByText('Récolté à la main')).toBeInTheDocument()
    expect(screen.getByText('"lavande"')).toBeInTheDocument()
  })

  it('affiche le bouton Tout effacer si plusieurs filtres', () => {
    render(
      <TestWrapper>
        <ActiveFilters
          selectedCategoryId="cat-1"
          selectedLabels={['bio'] as ProductLabel[]}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Tout effacer')).toBeInTheDocument()
  })

  it('appelle les callbacks de suppression', async () => {
    const onClearCategory = jest.fn()
    const onClearLabel = jest.fn()
    const onClearSearch = jest.fn()
    
    render(
      <TestWrapper>
        <ActiveFilters
          categories={mockCategories}
          selectedCategoryId="cat-1"
          selectedLabels={['bio'] as ProductLabel[]}
          searchTerm="test"
          onClearCategory={onClearCategory}
          onClearLabel={onClearLabel}
          onClearSearch={onClearSearch}
        />
      </TestWrapper>
    )

    // Simuler clics sur les boutons X (difficile à cibler précisément)
    const clearButtons = screen.getAllByRole('button')
    
    // Le premier bouton X devrait être pour la catégorie
    fireEvent.click(clearButtons[1]) // Skip "Tout effacer"

    await waitFor(() => {
      expect(onClearCategory).toHaveBeenCalled()
    })
  })
})

describe('ProductFilters (composant principal)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(usePathname as jest.Mock).mockReturnValue(mockPathname)
  })

  it('rend tous les sous-composants', () => {
    render(
      <TestWrapper>
        <ProductFilters categories={mockCategories} />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('Rechercher un produit...')).toBeInTheDocument()
    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('Labels HerbisVeritas')).toBeInTheDocument()
  })

  it('utilise les paramètres URL pour l\'état initial', () => {
    const searchParams = new URLSearchParams('category=cat-1&labels=bio,recolte_main&search=lavande')
    ;(useSearchParams as jest.Mock).mockReturnValue(searchParams)

    render(
      <TestWrapper>
        <ProductFilters 
          categories={mockCategories}
          selectedCategoryId="cat-1"
          selectedLabels={['bio', 'recolte_main'] as ProductLabel[]}
          searchTerm="lavande"
        />
      </TestWrapper>
    )

    expect(screen.getByText('Filtres actifs (3)')).toBeInTheDocument()
  })

  it('met à jour l\'URL lors des changements de filtres', () => {
    const onFiltersChange = jest.fn()
    
    render(
      <TestWrapper>
        <ProductFilters 
          categories={mockCategories}
          onFiltersChange={onFiltersChange}
        />
      </TestWrapper>
    )

    // Simuler sélection d'une catégorie
    fireEvent.click(screen.getByText('Soins visage'))

    expect(mockPush).toHaveBeenCalled()
  })

  it('efface la page lors du changement de filtres', () => {
    const searchParams = new URLSearchParams('page=2&category=cat-1')
    ;(useSearchParams as jest.Mock).mockReturnValue(searchParams)

    render(
      <TestWrapper>
        <ProductFilters categories={mockCategories} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('Soins corps'))

    // Vérifier que 'page' est supprimé des params
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/shop\?(?!.*page=)/))
  })
})

describe('Configuration HERBIS_VERITAS_LABELS', () => {
  it('contient les 7 labels métier attendus', () => {
    expect(HERBIS_VERITAS_LABELS).toHaveLength(7)
    
    const expectedLabels = [
      'bio',
      'recolte_main', 
      'origine_occitanie',
      'partenariat_producteurs',
      'rituel_bien_etre',
      'essence_precieuse',
      'rupture_recolte'
    ]

    expectedLabels.forEach(labelKey => {
      const label = HERBIS_VERITAS_LABELS.find(l => l.key === labelKey)
      expect(label).toBeDefined()
      expect(label?.label).toBeTruthy()
      expect(label?.description).toBeTruthy()
    })
  })

  it('a des descriptions explicites pour chaque label', () => {
    HERBIS_VERITAS_LABELS.forEach(({ key, label, description }) => {
      expect(label).toMatch(/^[A-Z]/) // Commence par majuscule
      expect(description).toMatch(/^[A-Z]/) // Description commence par majuscule
      expect(description.length).toBeGreaterThan(10) // Description suffisamment détaillée
    })
  })
})