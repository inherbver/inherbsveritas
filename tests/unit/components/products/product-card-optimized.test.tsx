/**
 * Tests TDD pour ProductCard Optimisé
 * 
 * Validation de la compatibilité avec l'API existante
 * Tests spécifiques aux produits HerbisVeritas
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCardOptimized as ProductCard } from '@/components/products/product-card-optimized'
import { Product, ProductLabel } from '@/types/product'

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  }
})

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock du composant INCI
jest.mock('@/components/ui/inci-list', () => ({
  InciListCompact: ({ inciList, className }: any) => (
    <div className={className} data-testid="inci-list">
      INCI: {inciList.join(', ')}
    </div>
  )
}))

describe('ProductCard Optimisé', () => {
  const mockProduct: Product = {
    id: 'prod-1',
    slug: 'huile-essentielle-lavande',
    name: 'Huile Essentielle de Lavande',
    description_short: 'Huile bio certifiée, récolte manuelle Occitanie',
    price: 24.90,
    currency: 'EUR',
    stock: 15,
    unit: 'ml',
    image_url: '/products/lavande.jpg',
    inci_list: ['Lavandula Angustifolia Oil', 'Linalool', 'Geraniol'],
    labels: ['bio', 'recolte_main', 'origine_occitanie'] as ProductLabel[],
    status: 'active',
    is_active: true,
    is_new: true,
    is_on_promotion: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  describe('Rendu produit de base', () => {
    it('affiche les informations produit essentielles', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Huile Essentielle de Lavande')).toBeInTheDocument()
      expect(screen.getByText('Huile bio certifiée, récolte manuelle Occitanie')).toBeInTheDocument()
      expect(screen.getByText('24,90 €')).toBeInTheDocument()
      expect(screen.getByText('En stock')).toBeInTheDocument()
    })

    it('affiche l\'image produit avec alt approprié', () => {
      render(<ProductCard product={mockProduct} />)
      
      const image = screen.getByAltText('Huile Essentielle de Lavande')
      expect(image).toHaveAttribute('src', '/products/lavande.jpg')
    })

    it('génère le lien vers la page produit', () => {
      render(<ProductCard product={mockProduct} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/shop/huile-essentielle-lavande')
    })
  })

  describe('Labels HerbisVeritas', () => {
    it('affiche les badges des labels produit', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Bio')).toBeInTheDocument()
      expect(screen.getByText('Récolté à la main')).toBeInTheDocument()
      expect(screen.getByText('Origine Occitanie')).toBeInTheDocument()
    })

    it('affiche le badge "Nouveau" si produit nouveau', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Nouveau')).toBeInTheDocument()
    })

    it('affiche le badge "Promo" si produit en promotion', () => {
      const promoProduct = { ...mockProduct, is_on_promotion: true }
      
      render(<ProductCard product={promoProduct} />)
      
      expect(screen.getByText('Promo')).toBeInTheDocument()
    })
  })

  describe('Composition INCI cosmétique', () => {
    it('affiche la liste INCI en variant default', () => {
      render(<ProductCard product={mockProduct} variant="default" />)
      
      expect(screen.getByTestId('inci-list')).toBeInTheDocument()
      expect(screen.getByText(/Lavandula Angustifolia Oil, Linalool, Geraniol/)).toBeInTheDocument()
    })

    it('masque la liste INCI en variant compact', () => {
      render(<ProductCard product={mockProduct} variant="compact" />)
      
      expect(screen.queryByTestId('inci-list')).not.toBeInTheDocument()
    })

    it('n\'affiche pas la liste INCI si vide', () => {
      const productSansInci = { ...mockProduct, inci_list: [] }
      
      render(<ProductCard product={productSansInci} />)
      
      expect(screen.queryByTestId('inci-list')).not.toBeInTheDocument()
    })
  })

  describe('Actions panier', () => {
    it('affiche le bouton "Ajouter au panier"', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByRole('button', { name: /ajouter au panier/i })).toBeInTheDocument()
    })

    it('exécute onAddToCart au clic', async () => {
      const mockAddToCart = jest.fn().mockResolvedValue(undefined)
      
      render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByRole('button', { name: /ajouter au panier/i })
      fireEvent.click(addButton)
      
      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledWith(mockProduct)
      })
    })

    it('gère l\'état loading pendant l\'ajout', async () => {
      const mockAddToCart = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      
      render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByRole('button', { name: /ajouter au panier/i })
      fireEvent.click(addButton)
      
      expect(screen.getByText('Ajout...')).toBeInTheDocument()
      expect(addButton.querySelector('.animate-spin')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText('Ajouter au panier')).toBeInTheDocument()
      })
    })

    it('désactive le bouton si produit épuisé', () => {
      const produitEpuise = { ...mockProduct, stock: 0 }
      
      render(<ProductCard product={produitEpuise} />)
      
      const addButton = screen.getByRole('button', { name: /ajouter au panier/i })
      expect(addButton).toBeDisabled()
      expect(screen.getByText('Épuisé')).toHaveClass('text-red-600')
    })
  })

  describe('Gestion des favoris', () => {
    it('affiche le bouton favoris si handler fourni', () => {
      const mockToggleFavorite = jest.fn()
      
      render(<ProductCard product={mockProduct} onToggleFavorite={mockToggleFavorite} />)
      
      expect(screen.getByRole('button', { name: /favoris/i })).toBeInTheDocument()
    })

    it('n\'affiche pas le bouton favoris si pas de handler', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.queryByRole('button', { name: /favoris/i })).not.toBeInTheDocument()
    })

    it('toggle le statut favori au clic', async () => {
      const mockToggleFavorite = jest.fn()
      
      render(<ProductCard product={mockProduct} onToggleFavorite={mockToggleFavorite} />)
      
      const favButton = screen.getByRole('button', { name: /favoris/i })
      fireEvent.click(favButton)
      
      expect(mockToggleFavorite).toHaveBeenCalledWith(mockProduct)
      expect(screen.getByRole('button', { name: /retirer/i })).toBeInTheDocument()
    })
  })

  describe('Variants d\'affichage', () => {
    it('applique le variant default par défaut', () => {
      render(<ProductCard product={mockProduct} />)
      
      // L'INCI est visible en default
      expect(screen.getByTestId('inci-list')).toBeInTheDocument()
    })

    it('applique le variant compact', () => {
      render(<ProductCard product={mockProduct} variant="compact" />)
      
      // L'INCI est masqué en compact
      expect(screen.queryByTestId('inci-list')).not.toBeInTheDocument()
    })
  })

  describe('État de chargement', () => {
    it('affiche le skeleton en loading', () => {
      render(<ProductCard product={mockProduct} isLoading={true} />)
      
      // Le contenu principal n'est pas visible
      expect(screen.queryByText('Huile Essentielle de Lavande')).not.toBeInTheDocument()
      
      // Le skeleton est visible
      const skeletonCard = screen.getByRole('article')
      expect(skeletonCard.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Schema.org pour SEO', () => {
    it('applique le markup Schema.org Product', () => {
      render(<ProductCard product={mockProduct} />)
      
      const article = screen.getByRole('article')
      expect(article).toHaveAttribute('itemScope')
      expect(article).toHaveAttribute('itemType', 'https://schema.org/Product')
    })

    it('marque le nom et prix avec itemProp', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Huile Essentielle de Lavande')).toHaveAttribute('itemProp', 'name')
      expect(screen.getByText('24,90 €')).toHaveAttribute('itemProp', 'price')
    })
  })

  describe('Gestion d\'erreurs', () => {
    it('gère les erreurs d\'ajout au panier', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      const mockAddToCart = jest.fn().mockRejectedValue(new Error('Erreur réseau'))
      
      render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByRole('button', { name: /ajouter au panier/i })
      fireEvent.click(addButton)
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error adding to cart:', expect.any(Error))
        expect(screen.getByText('Ajouter au panier')).toBeInTheDocument() // Revient à l'état initial
      })
      
      consoleError.mockRestore()
    })
  })

  describe('Compatibilité API existante', () => {
    it('accepte tous les props de ProductCardProps', () => {
      const mockAddToCart = jest.fn()
      const mockToggleFavorite = jest.fn()
      
      expect(() => {
        render(
          <ProductCard 
            product={mockProduct}
            onAddToCart={mockAddToCart}
            onToggleFavorite={mockToggleFavorite}
            variant="compact"
            className="custom-class"
            isLoading={false}
          />
        )
      }).not.toThrow()
    })

    it('applique la className personnalisée', () => {
      render(<ProductCard product={mockProduct} className="custom-product-card" />)
      
      const card = screen.getByRole('article')
      expect(card).toHaveClass('custom-product-card')
    })
  })
})