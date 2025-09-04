/**
 * Tests TDD pour CategoryCard - Admin CRUD
 * 
 * Validation wrapper ContentCard spécialisé categories
 * Tests i18n, hiérarchie, actions admin
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CategoryCard, useCategoryActions } from '@/components/content/category-card'
import { CategoryTree } from '@/types/herbis-veritas'

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

describe('CategoryCard', () => {
  const mockCategoryRoot: CategoryTree = {
    id: 'cat-1',
    slug: 'cosmetiques',
    parent_id: null,
    i18n: {
      fr: {
        name: 'Cosmétiques',
        description: 'Produits cosmétiques naturels'
      },
      en: {
        name: 'Cosmetics',
        description: 'Natural cosmetic products'
      }
    },
    image_url: '/categories/cosmetiques.jpg',
    sort_order: 1,
    is_active: true,
    level: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'cat-2',
        slug: 'soins-visage',
        parent_id: 'cat-1',
        i18n: {
          fr: { name: 'Soins du visage' },
          en: { name: 'Face care' }
        },
        sort_order: 1,
        is_active: true,
        level: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
  }

  const mockCategoryChild: CategoryTree = {
    id: 'cat-2',
    slug: 'soins-visage',
    parent_id: 'cat-1',
    i18n: {
      fr: {
        name: 'Soins du visage',
        description: 'Crèmes et sérums pour le visage'
      },
      en: {
        name: 'Face care',
        description: 'Face creams and serums'
      }
    },
    sort_order: 1,
    is_active: true,
    level: 1,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }

  describe('Rendu de base', () => {
    it('affiche le nom et description de la catégorie', () => {
      render(<CategoryCard category={mockCategoryRoot} />)
      
      expect(screen.getByText('Cosmétiques')).toBeInTheDocument()
      expect(screen.getByText('Produits cosmétiques naturels')).toBeInTheDocument()
    })

    it('affiche la version anglaise avec locale="en"', () => {
      render(<CategoryCard category={mockCategoryRoot} locale="en" />)
      
      expect(screen.getByText('Cosmetics')).toBeInTheDocument()
      expect(screen.getByText('Natural cosmetic products')).toBeInTheDocument()
    })

    it('affiche l\'image de la catégorie', () => {
      render(<CategoryCard category={mockCategoryRoot} />)
      
      const image = screen.getByAltText('Cosmétiques')
      expect(image).toHaveAttribute('src', '/categories/cosmetiques.jpg')
    })
  })

  describe('Badges hiérarchiques', () => {
    it('affiche badge "Racine" pour catégorie niveau 0', () => {
      render(<CategoryCard category={mockCategoryRoot} />)
      
      expect(screen.getByText('Racine')).toBeInTheDocument()
    })

    it('affiche badge niveau pour sous-catégories', () => {
      render(<CategoryCard category={mockCategoryChild} />)
      
      expect(screen.getByText('Niveau 1')).toBeInTheDocument()
    })

    it('affiche badge "Inactive" si catégorie désactivée', () => {
      const inactiveCategory = { ...mockCategoryRoot, is_active: false }
      
      render(<CategoryCard category={inactiveCategory} />)
      
      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })
  })

  describe('Actions admin', () => {
    it('affiche toutes les actions admin disponibles', () => {
      const mockHandlers = {
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onView: jest.fn(),
        onAddChild: jest.fn()
      }
      
      render(<CategoryCard category={mockCategoryRoot} {...mockHandlers} />)
      
      expect(screen.getByRole('button', { name: /voir/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /éditer/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
    })

    it('exécute onEdit au clic sur Éditer', () => {
      const mockEdit = jest.fn()
      
      render(<CategoryCard category={mockCategoryRoot} onEdit={mockEdit} />)
      
      fireEvent.click(screen.getByRole('button', { name: /éditer/i }))
      
      expect(mockEdit).toHaveBeenCalledWith(mockCategoryRoot)
    })

    it('exécute onView au clic sur Voir', () => {
      const mockView = jest.fn()
      
      render(<CategoryCard category={mockCategoryRoot} onView={mockView} />)
      
      fireEvent.click(screen.getByRole('button', { name: /voir/i }))
      
      expect(mockView).toHaveBeenCalledWith(mockCategoryRoot)
    })

    it('exécute onAddChild au clic sur Ajouter', () => {
      const mockAddChild = jest.fn()
      
      render(<CategoryCard category={mockCategoryRoot} onAddChild={mockAddChild} />)
      
      fireEvent.click(screen.getByRole('button', { name: /ajouter/i }))
      
      expect(mockAddChild).toHaveBeenCalledWith(mockCategoryRoot)
    })

    it('désactive bouton Supprimer si catégorie a des enfants', () => {
      const mockDelete = jest.fn()
      
      render(<CategoryCard category={mockCategoryRoot} onDelete={mockDelete} />)
      
      const deleteButton = screen.getByRole('button', { name: /supprimer/i })
      expect(deleteButton).toBeDisabled()
    })

    it('masque bouton Ajouter si niveau trop profond (>= 3)', () => {
      const deepCategory = { ...mockCategoryChild, level: 3 }
      const mockAddChild = jest.fn()
      
      render(<CategoryCard category={deepCategory} onAddChild={mockAddChild} />)
      
      expect(screen.queryByRole('button', { name: /ajouter/i })).not.toBeInTheDocument()
    })
  })

  describe('Contenu hiérarchique', () => {
    it('affiche les sous-catégories si présentes', () => {
      render(<CategoryCard category={mockCategoryRoot} />)
      
      expect(screen.getByText('1 sous-catégorie(s)')).toBeInTheDocument()
      expect(screen.getByText('Soins du visage')).toBeInTheDocument()
    })

    it('limite l\'affichage à 3 sous-catégories max', () => {
      const categoryWithManyChildren = {
        ...mockCategoryRoot,
        children: Array.from({ length: 5 }, (_, i) => ({
          ...mockCategoryChild,
          id: `cat-${i + 2}`,
          i18n: {
            fr: { name: `Sous-catégorie ${i + 1}` },
            en: { name: `Subcategory ${i + 1}` }
          }
        }))
      }
      
      render(<CategoryCard category={categoryWithManyChildren} />)
      
      expect(screen.getByText('5 sous-catégorie(s)')).toBeInTheDocument()
      expect(screen.getByText('... et 2 autre(s)')).toBeInTheDocument()
    })
  })

  describe('Compteur produits', () => {
    it('affiche le nombre de produits si showProductCount=true', () => {
      render(
        <CategoryCard 
          category={mockCategoryRoot} 
          showProductCount={true}
          productCount={15}
        />
      )
      
      // Le compteur est affiché dans les métadonnées
      expect(screen.getByText(/15/)).toBeInTheDocument()
    })
  })

  describe('Variants et layouts', () => {
    it('applique le variant compact', () => {
      render(<CategoryCard category={mockCategoryRoot} variant="compact" />)
      
      const card = screen.getByRole('article')
      expect(card).toHaveClass('flex-row') // Layout compact
    })

    it('génère le lien admin si variant="admin"', () => {
      render(<CategoryCard category={mockCategoryRoot} variant="admin" />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/admin/categories/cosmetiques')
    })
  })

  describe('États de chargement', () => {
    it('affiche état loading sur bouton supprimer', () => {
      const mockDelete = jest.fn()
      
      render(
        <CategoryCard 
          category={mockCategoryChild} // Pas d'enfants
          onDelete={mockDelete} 
          isDeleting={true}
        />
      )
      
      const deleteButton = screen.getByRole('button', { name: /supprimer/i })
      expect(deleteButton.querySelector('.animate-spin')).toBeInTheDocument()
      expect(deleteButton).toBeDisabled()
    })
  })

  describe('Localisation complète', () => {
    it('traduit tous les textes en anglais', () => {
      const mockHandlers = {
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onView: jest.fn(),
        onAddChild: jest.fn()
      }
      
      render(
        <CategoryCard 
          category={mockCategoryRoot} 
          locale="en"
          {...mockHandlers}
        />
      )
      
      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add child/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      expect(screen.getByText('Root')).toBeInTheDocument()
    })
  })
})

describe('useCategoryActions Hook', () => {
  // Helper pour tester les hooks
  function TestComponent({ category, locale }: { category: CategoryTree, locale?: 'fr' | 'en' }) {
    const { handleEdit, handleDelete, handleView, handleAddChild, isLoading, error } = useCategoryActions(locale)
    
    return (
      <div>
        <button onClick={() => handleEdit(category)}>Edit</button>
        <button onClick={() => handleDelete(category)}>Delete</button>
        <button onClick={() => handleView(category)}>View</button>
        <button onClick={() => handleAddChild(category)}>Add Child</button>
        {isLoading && <div data-testid="loading">Loading: {isLoading}</div>}
        {error && <div data-testid="error">{error}</div>}
      </div>
    )
  }

  beforeEach(() => {
    // Mock window.confirm
    global.confirm = jest.fn()
    // Mock console
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('gère les actions edit, view, addChild sans confirmation', () => {
    render(<TestComponent category={mockCategoryChild} />)
    
    fireEvent.click(screen.getByText('Edit'))
    fireEvent.click(screen.getByText('View'))
    fireEvent.click(screen.getByText('Add Child'))
    
    expect(console.log).toHaveBeenCalledWith('Edit category:', 'cat-2')
    expect(console.log).toHaveBeenCalledWith('View category:', 'soins-visage')
    expect(console.log).toHaveBeenCalledWith('Add child to category:', 'cat-2')
  })

  it('demande confirmation avant suppression', () => {
    (global.confirm as jest.Mock).mockReturnValue(false)
    
    render(<TestComponent category={mockCategoryChild} />)
    
    fireEvent.click(screen.getByText('Delete'))
    
    expect(global.confirm).toHaveBeenCalledWith('Êtes-vous sûr de supprimer "Soins du visage" ?')
    expect(console.log).not.toHaveBeenCalledWith('Deleted category:', 'cat-2')
  })

  it('affiche loading state pendant suppression', async () => {
    (global.confirm as jest.Mock).mockReturnValue(true)
    
    render(<TestComponent category={mockCategoryChild} />)
    
    fireEvent.click(screen.getByText('Delete'))
    
    // Loading state immédiat
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading: cat-2')
    
    // Attendre fin de suppression simulée
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('utilise la localisation anglaise pour confirmation', () => {
    (global.confirm as jest.Mock).mockReturnValue(false)
    
    render(<TestComponent category={mockCategoryChild} locale="en" />)
    
    fireEvent.click(screen.getByText('Delete'))
    
    expect(global.confirm).toHaveBeenCalledWith('Are you sure to delete "Face care"?')
  })
})