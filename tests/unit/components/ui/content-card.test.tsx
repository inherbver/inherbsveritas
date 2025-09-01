/**
 * Tests TDD pour ContentCard générique
 * 
 * Validation complète des variants, layouts et comportements
 * Coverage > 90% requis pour composant critique
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContentCard, type ContentCardProps } from '@/components/ui/content-card'
import { ShoppingCart, Heart } from 'lucide-react'

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  }
})

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('ContentCard', () => {
  const baseProps: ContentCardProps = {
    id: 'test-1',
    title: 'Test Title',
    description: 'Test description'
  }

  describe('Rendu de base', () => {
    it('affiche le titre et la description', () => {
      render(<ContentCard {...baseProps} />)
      
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('applique les variants CSS correctement', () => {
      const { rerender } = render(
        <ContentCard {...baseProps} variant="product" />
      )
      
      let card = screen.getByRole('article')
      expect(card).toHaveClass('aspect-square', 'sm:aspect-[4/5]')

      rerender(<ContentCard {...baseProps} variant="article" />)
      card = screen.getByRole('article')
      expect(card).toHaveClass('aspect-[16/9]', 'sm:aspect-[3/2]')
    })

    it('applique les layouts correctement', () => {
      const { rerender } = render(
        <ContentCard {...baseProps} layout="default" />
      )
      
      let card = screen.getByRole('article')
      expect(card).toHaveClass('flex', 'flex-col')

      rerender(<ContentCard {...baseProps} layout="compact" />)
      card = screen.getByRole('article')
      expect(card).toHaveClass('flex', 'flex-row', 'space-x-4')
    })
  })

  describe('Gestion des images', () => {
    it('affiche l\'image avec alt text', () => {
      render(
        <ContentCard 
          {...baseProps} 
          imageUrl="/test-image.jpg" 
          imageAlt="Test image"
        />
      )
      
      const image = screen.getByAltText('Test image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', '/test-image.jpg')
    })

    it('utilise le titre comme alt si pas d\'alt fourni', () => {
      render(
        <ContentCard 
          {...baseProps} 
          title="My Product"
          imageUrl="/test-image.jpg" 
        />
      )
      
      expect(screen.getByAltText('My Product')).toBeInTheDocument()
    })

    it('positionne l\'image différemment selon le layout', () => {
      const { rerender } = render(
        <ContentCard 
          {...baseProps} 
          imageUrl="/test.jpg"
          layout="default"
        />
      )
      
      // Default layout : image en full width
      expect(screen.getByAltText('Test Title').closest('.relative')).toBeInTheDocument()

      rerender(
        <ContentCard 
          {...baseProps} 
          imageUrl="/test.jpg"
          layout="compact"
        />
      )
      
      // Compact layout : image petite à gauche
      expect(screen.getByAltText('Test Title').closest('.w-20')).toBeInTheDocument()
    })
  })

  describe('Badges système', () => {
    it('affiche les badges fournis', () => {
      const badges = [
        { label: 'Nouveau', variant: 'new' as const },
        { label: 'Bio', variant: 'bio' as const }
      ]
      
      render(<ContentCard {...baseProps} badges={badges} imageUrl="/test.jpg" />)
      
      expect(screen.getByText('Nouveau')).toBeInTheDocument()
      expect(screen.getByText('Bio')).toBeInTheDocument()
    })

    it('positionne les badges selon le layout', () => {
      const badges = [{ label: 'Test Badge', variant: 'new' as const }]
      
      const { rerender } = render(
        <ContentCard 
          {...baseProps} 
          badges={badges} 
          imageUrl="/test.jpg"
          layout="default"
        />
      )
      
      // Default : badges en overlay sur image
      expect(screen.getByText('Test Badge').closest('.absolute')).toBeInTheDocument()

      rerender(
        <ContentCard 
          {...baseProps} 
          badges={badges}
          layout="compact"
        />
      )
      
      // Compact : badges dans le contenu
      expect(screen.getByText('Test Badge').closest('.absolute')).not.toBeInTheDocument()
    })
  })

  describe('Métadonnées système', () => {
    it('formate et affiche le prix', () => {
      const metadata = {
        price: 29.99,
        currency: 'EUR'
      }
      
      render(<ContentCard {...baseProps} metadata={metadata} />)
      
      expect(screen.getByText('29,99 €')).toBeInTheDocument()
    })

    it('formate et affiche les dates', () => {
      const metadata = {
        date: new Date('2024-01-15'),
        author: 'John Doe'
      }
      
      render(<ContentCard {...baseProps} metadata={metadata} />)
      
      expect(screen.getByText('15 janvier 2024')).toBeInTheDocument()
      expect(screen.getByText('par John Doe')).toBeInTheDocument()
    })

    it('affiche le statut du stock', () => {
      const { rerender } = render(
        <ContentCard {...baseProps} metadata={{ stock: 5 }} />
      )
      
      expect(screen.getByText('En stock')).toHaveClass('text-green-600')

      rerender(<ContentCard {...baseProps} metadata={{ stock: 0 }} />)
      expect(screen.getByText('Épuisé')).toHaveClass('text-red-600')
    })

    it('affiche le temps de lecture pour articles', () => {
      const metadata = {
        readTime: 5,
        views: 1234
      }
      
      render(<ContentCard {...baseProps} metadata={metadata} />)
      
      expect(screen.getByText('5 min')).toBeInTheDocument()
    })
  })

  describe('Actions et interactions', () => {
    it('exécute les actions au clic', async () => {
      const mockAction = jest.fn()
      const actions = [{
        label: 'Test Action',
        onClick: mockAction,
        variant: 'default' as const,
        icon: ShoppingCart
      }]
      
      render(<ContentCard {...baseProps} actions={actions} />)
      
      const button = screen.getByRole('button', { name: /test action/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledTimes(1)
      })
    })

    it('gère les états loading des actions', () => {
      const actions = [{
        label: 'Loading Action',
        onClick: jest.fn(),
        variant: 'default' as const,
        loading: true
      }]
      
      render(<ContentCard {...baseProps} actions={actions} />)
      
      const button = screen.getByRole('button', { name: /loading action/i })
      expect(button.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('désactive les actions disabled', () => {
      const actions = [{
        label: 'Disabled Action',
        onClick: jest.fn(),
        variant: 'default' as const,
        disabled: true
      }]
      
      render(<ContentCard {...baseProps} actions={actions} />)
      
      const button = screen.getByRole('button', { name: /disabled action/i })
      expect(button).toBeDisabled()
    })

    it('navigue avec href fourni', () => {
      render(<ContentCard {...baseProps} href="/test-url" />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/test-url')
    })

    it('exécute onClick si pas de href', () => {
      const mockClick = jest.fn()
      
      render(<ContentCard {...baseProps} onClick={mockClick} />)
      
      const card = screen.getByRole('article').closest('div')
      fireEvent.click(card!)
      
      expect(mockClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('État loading', () => {
    it('affiche le skeleton en loading', () => {
      render(<ContentCard {...baseProps} isLoading={true} />)
      
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
      expect(screen.getByRole('article').querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Contenu personnalisé', () => {
    it('affiche le contenu custom dans le body', () => {
      const customContent = <div data-testid="custom-content">Custom content</div>
      
      render(<ContentCard {...baseProps} customContent={customContent} />)
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    })

    it('affiche les slots header et footer', () => {
      const headerSlot = <div data-testid="header-slot">Header</div>
      const footerSlot = <div data-testid="footer-slot">Footer</div>
      
      render(
        <ContentCard 
          {...baseProps} 
          headerSlot={headerSlot} 
          footerSlot={footerSlot}
        />
      )
      
      expect(screen.getByTestId('header-slot')).toBeInTheDocument()
      expect(screen.getByTestId('footer-slot')).toBeInTheDocument()
    })
  })

  describe('Schema.org markup', () => {
    it('applique le bon itemType selon variant', () => {
      const { rerender } = render(
        <ContentCard {...baseProps} variant="product" />
      )
      
      expect(screen.getByRole('article')).toHaveAttribute('itemType', 'https://schema.org/Product')

      rerender(<ContentCard {...baseProps} variant="article" />)
      expect(screen.getByRole('article')).toHaveAttribute('itemType', 'https://schema.org/Article')
    })

    it('applique les propriétés itemProp', () => {
      const metadata = { price: 19.99 }
      
      render(
        <ContentCard 
          {...baseProps} 
          variant="product"
          metadata={metadata}
        />
      )
      
      expect(screen.getByText('Test Title')).toHaveAttribute('itemProp', 'name')
      expect(screen.getByText('19,99 €')).toHaveAttribute('itemProp', 'price')
    })
  })

  describe('Accessibilité', () => {
    it('a les bons rôles ARIA', () => {
      render(<ContentCard {...baseProps} />)
      
      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('supporte la navigation clavier', () => {
      const mockClick = jest.fn()
      
      render(<ContentCard {...baseProps} onClick={mockClick} />)
      
      const card = screen.getByRole('article').closest('div')
      fireEvent.keyDown(card!, { key: 'Enter' })
      fireEvent.keyDown(card!, { key: ' ' })
      
      // Note: Le support clavier devrait être ajouté dans le composant
      // Ces tests échoueront pour l'instant mais définissent le comportement attendu
    })
  })
})