import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProductCard } from '@/components/modules/boutique/components/product-card'
import { Product } from '@/types/product'

// Mock product data
const mockProduct: Product = {
  id: '1',
  slug: 'huile-lavande-bio',
  name: 'Huile essentielle de lavande bio',
  description_short: 'Huile essentielle bio de lavande vraie, distillée en Provence.',
  price: 15.99,
  currency: 'EUR',
  stock: 10,
  unit: 'ml',
  image_url: '/images/lavande.jpg',
  inci_list: ['Lavandula Angustifolia Oil'],
  labels: ['bio', 'origine_occitanie'],
  status: 'active',
  is_active: true,
  is_new: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockProductOutOfStock: Product = {
  ...mockProduct,
  stock: 0
}

describe('ProductCard', () => {
  describe('Product Information Display', () => {
    it('should render product name and description', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.description_short!)).toBeInTheDocument()
    })

    it('should display formatted price with currency', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('15,99 €')).toBeInTheDocument()
      expect(screen.getByText('/ ml')).toBeInTheDocument()
    })

    it('should show product image with correct alt text', () => {
      render(<ProductCard product={mockProduct} />)
      
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', mockProduct.image_url)
      expect(image).toHaveAttribute('alt', mockProduct.name)
    })

    it('should display placeholder when no image is provided', () => {
      const productWithoutImage = { ...mockProduct, image_url: undefined }
      render(<ProductCard product={productWithoutImage} />)
      
      expect(screen.getByText('Image à venir')).toBeInTheDocument()
    })
  })

  describe('HerbisVeritas Labels', () => {
    it('should display product labels as badges', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Bio')).toBeInTheDocument()
      expect(screen.getByText('Origine Occitanie')).toBeInTheDocument()
    })

    it('should limit displayed labels to 2 and show count for additional ones', () => {
      const productWithManyLabels: Product = {
        ...mockProduct,
        labels: ['bio', 'origine_occitanie', 'recolte_main', 'essence_precieuse']
      }
      
      render(<ProductCard product={productWithManyLabels} />)
      
      expect(screen.getByText('Bio')).toBeInTheDocument()
      expect(screen.getByText('Origine Occitanie')).toBeInTheDocument()
      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('should not display labels section when product has no labels', () => {
      const productWithoutLabels = { ...mockProduct, labels: [] }
      render(<ProductCard product={productWithoutLabels} />)
      
      expect(screen.queryByText('Bio')).not.toBeInTheDocument()
    })
  })

  describe('Product States', () => {
    it('should show "Nouveau" badge for new products', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Nouveau')).toBeInTheDocument()
    })

    it('should not show "Nouveau" badge for non-new products', () => {
      const regularProduct = { ...mockProduct, is_new: false }
      render(<ProductCard product={regularProduct} />)
      
      expect(screen.queryByText('Nouveau')).not.toBeInTheDocument()
    })

    it('should show stock warning for low stock products', () => {
      const lowStockProduct = { ...mockProduct, stock: 3 }
      render(<ProductCard product={lowStockProduct} />)
      
      expect(screen.getByText('Plus que 3 en stock')).toBeInTheDocument()
    })

    it('should show out of stock overlay and disable button when stock is 0', () => {
      render(<ProductCard product={mockProductOutOfStock} />)
      
      expect(screen.getByText('Rupture de stock')).toBeInTheDocument()
      const button = screen.getByRole('button', { name: /rupture/i })
      expect(button).toBeDisabled()
    })
  })

  describe('Add to Cart Functionality', () => {
    it('should call onAddToCart when button is clicked', async () => {
      const onAddToCart = jest.fn().mockResolvedValue(undefined)
      render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)
      
      const button = screen.getByText('Ajouter au panier')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(onAddToCart).toHaveBeenCalledWith(mockProduct)
      })
    })

    it('should show loading state during add to cart', async () => {
      const onAddToCart = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)
      
      const button = screen.getByText('Ajouter au panier')
      fireEvent.click(button)
      
      expect(screen.getByText('Ajout...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText('Ajouter au panier')).toBeInTheDocument()
      })
    })

    it('should not allow multiple simultaneous add to cart clicks', async () => {
      const onAddToCart = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)
      
      const button = screen.getByText('Ajouter au panier')
      fireEvent.click(button)
      fireEvent.click(button) // Second click should be ignored
      
      await waitFor(() => {
        expect(onAddToCart).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Favorite Functionality', () => {
    it('should show favorite button when onToggleFavorite is provided', () => {
      const onToggleFavorite = jest.fn()
      render(
        <ProductCard 
          product={mockProduct} 
          onToggleFavorite={onToggleFavorite} 
        />
      )
      
      expect(screen.getByLabelText('Ajouter aux favoris')).toBeInTheDocument()
    })

    it('should not show favorite button when onToggleFavorite is not provided', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.queryByLabelText('Ajouter aux favoris')).not.toBeInTheDocument()
    })

    it('should call onToggleFavorite when favorite button is clicked', () => {
      const onToggleFavorite = jest.fn()
      render(
        <ProductCard 
          product={mockProduct} 
          onToggleFavorite={onToggleFavorite} 
        />
      )
      
      const favoriteButton = screen.getByLabelText('Ajouter aux favoris')
      fireEvent.click(favoriteButton)
      
      expect(onToggleFavorite).toHaveBeenCalledWith(mockProduct)
    })
  })

  describe('Variants', () => {
    it('should apply compact styles for compact variant', () => {
      render(<ProductCard product={mockProduct} variant="compact" />)
      
      const card = screen.getByRole('img').closest('.group')
      expect(card).toHaveClass('max-w-sm')
    })

    it('should not show description in compact variant', () => {
      render(<ProductCard product={mockProduct} variant="compact" />)
      
      expect(screen.queryByText(mockProduct.description_short!)).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show skeleton when isLoading is true', () => {
      render(<ProductCard product={mockProduct} isLoading={true} />)
      
      // Check for skeleton elements (animated divs)
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
      
      // Product info should not be visible
      expect(screen.queryByText(mockProduct.name)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ProductCard product={mockProduct} />)
      
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', mockProduct.name)
      
      const button = screen.getByRole('button', { name: /ajouter au panier/i })
      expect(button).toBeInTheDocument()
    })

    it('should have loading attribute on image for lazy loading', () => {
      render(<ProductCard product={mockProduct} />)
      
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('loading', 'lazy')
    })
  })
})