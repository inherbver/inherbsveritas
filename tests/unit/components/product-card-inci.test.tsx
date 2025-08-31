/**
 * Tests pour l'intégration INCI dans ProductCard
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCard } from '@/components/modules/boutique/components/product-card/product-card'
import { Product } from '@/types/product'

// Mock des composants UI
jest.mock('@/components/ui/inci-list', () => ({
  InciListCompact: ({ inciList, className }: { inciList: string[], className?: string }) => (
    <div className={className} data-testid="inci-list-compact">
      INCI: {inciList.slice(0, 3).join(', ')}
      {inciList.length > 3 && ` (+${inciList.length - 3})`}
    </div>
  )
}))

const mockProductWithInci: Product = {
  id: 'product-1',
  slug: 'huile-lavande-bio',
  name: 'Huile de Lavande Bio',
  description_short: 'Huile essentielle de lavande certifiée bio',
  price: 15.99,
  currency: 'EUR',
  stock: 10,
  unit: 'flacon 10ml',
  image_url: '/images/lavande.jpg',
  inci_list: [
    'Lavandula Angustifolia Oil',
    'Olea Europaea Fruit Oil',
    'Tocopherol',
    'Limonene',
    'Linalool'
  ],
  labels: ['bio', 'recolte_main'],
  status: 'active',
  is_active: true,
  is_new: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockProductWithoutInci: Product = {
  id: 'product-2',
  slug: 'savon-artisanal',
  name: 'Savon Artisanal',
  description_short: 'Savon fait main',
  price: 8.50,
  currency: 'EUR',
  stock: 25,
  unit: 'pièce',
  inci_list: undefined,
  labels: ['recolte_main'],
  status: 'active',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

describe('ProductCard with INCI', () => {
  it('devrait afficher la liste INCI en mode default', () => {
    render(
      <ProductCard
        product={mockProductWithInci}
        variant="default"
      />
    )

    const inciList = screen.getByTestId('inci-list-compact')
    expect(inciList).toBeInTheDocument()
    expect(inciList).toHaveTextContent('INCI: Lavandula Angustifolia Oil, Olea Europaea Fruit Oil, Tocopherol (+2)')
  })

  it('ne devrait PAS afficher la liste INCI en mode compact', () => {
    render(
      <ProductCard
        product={mockProductWithInci}
        variant="compact"
      />
    )

    expect(screen.queryByTestId('inci-list-compact')).not.toBeInTheDocument()
  })

  it('ne devrait rien afficher si pas de liste INCI', () => {
    render(
      <ProductCard
        product={mockProductWithoutInci}
        variant="default"
      />
    )

    expect(screen.queryByTestId('inci-list-compact')).not.toBeInTheDocument()
  })

  it('ne devrait rien afficher si liste INCI vide', () => {
    const productWithEmptyInci = {
      ...mockProductWithInci,
      inci_list: []
    }

    render(
      <ProductCard
        product={productWithEmptyInci}
        variant="default"
      />
    )

    expect(screen.queryByTestId('inci-list-compact')).not.toBeInTheDocument()
  })

  it('devrait appliquer les bonnes classes CSS à la liste INCI', () => {
    render(
      <ProductCard
        product={mockProductWithInci}
        variant="default"
      />
    )

    const inciList = screen.getByTestId('inci-list-compact')
    expect(inciList).toHaveClass('border-t', 'pt-2', 'mt-2')
  })

  it('devrait afficher tous les autres éléments du ProductCard normalement', () => {
    render(
      <ProductCard
        product={mockProductWithInci}
        variant="default"
      />
    )

    // Vérifier les éléments principaux
    expect(screen.getByText('Huile de Lavande Bio')).toBeInTheDocument()
    expect(screen.getByText('15,99 €')).toBeInTheDocument()
    expect(screen.getByText('Huile essentielle de lavande certifiée bio')).toBeInTheDocument()
    expect(screen.getByText('Ajouter au panier')).toBeInTheDocument()
    
    // Vérifier les labels HerbisVeritas
    expect(screen.getByText('Bio')).toBeInTheDocument()
    expect(screen.getByText('Récolté à la main')).toBeInTheDocument()
  })

  it('devrait gérer l\'ajout au panier même avec liste INCI', async () => {
    const mockOnAddToCart = jest.fn()

    render(
      <ProductCard
        product={mockProductWithInci}
        onAddToCart={mockOnAddToCart}
        variant="default"
      />
    )

    const addButton = screen.getByText('Ajouter au panier')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockProductWithInci)
    })
  })

  it('devrait afficher le skeleton loading sans erreur même avec INCI', () => {
    render(
      <ProductCard
        product={mockProductWithInci}
        isLoading={true}
      />
    )

    // Le skeleton ne devrait pas afficher la liste INCI
    expect(screen.queryByTestId('inci-list-compact')).not.toBeInTheDocument()
    
    // Devrait afficher les éléments de skeleton (animations pulse)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})

describe('ProductCard INCI Integration', () => {
  it('devrait gérer une liste INCI très longue', () => {
    const longInciList = [
      'Aqua', 'Glycerin', 'Sodium Laureth Sulfate', 'Cocamidopropyl Betaine',
      'Sodium Chloride', 'Parfum', 'Citric Acid', 'Sodium Benzoate',
      'Potassium Sorbate', 'Tocopherol', 'CI 19140', 'CI 42090'
    ]

    const productWithLongInci = {
      ...mockProductWithInci,
      inci_list: longInciList
    }

    render(
      <ProductCard
        product={productWithLongInci}
        variant="default"
      />
    )

    const inciList = screen.getByTestId('inci-list-compact')
    expect(inciList).toBeInTheDocument()
    expect(inciList).toHaveTextContent('INCI: Aqua, Glycerin, Sodium Laureth Sulfate (+9)')
  })

  it('devrait gérer une liste INCI avec exactement 3 éléments', () => {
    const exactlyThreeInci = [
      'Olea Europaea Fruit Oil',
      'Lavandula Angustifolia Oil', 
      'Tocopherol'
    ]

    const productWithThreeInci = {
      ...mockProductWithInci,
      inci_list: exactlyThreeInci
    }

    render(
      <ProductCard
        product={productWithThreeInci}
        variant="default"
      />
    )

    const inciList = screen.getByTestId('inci-list-compact')
    expect(inciList).toBeInTheDocument()
    expect(inciList).toHaveTextContent('INCI: Olea Europaea Fruit Oil, Lavandula Angustifolia Oil, Tocopherol')
    expect(inciList).not.toHaveTextContent('(+')
  })

  it('devrait maintenir la responsiveness avec la liste INCI', () => {
    render(
      <ProductCard
        product={mockProductWithInci}
        variant="default"
        className="custom-class"
      />
    )

    // Vérifier que la classe personnalisée est appliquée
    const card = screen.getByText('Huile de Lavande Bio').closest('.group')
    expect(card).toHaveClass('custom-class')

    // Vérifier que la liste INCI n'interfère pas avec le layout
    const inciList = screen.getByTestId('inci-list-compact')
    expect(inciList).toHaveClass('border-t', 'pt-2', 'mt-2')
  })
})