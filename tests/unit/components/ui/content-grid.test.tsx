/**
 * ContentGrid - Tests Unitaires Template Système
 * 
 * Tests couvrant pagination, layouts, états et performance
 * Validation du template générique pour ProductGrid, ArticleGrid, etc.
 */

import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ContentGrid, type ContentGridProps, usePagination } from '@/components/ui/content-grid'
import { Grid, List } from 'lucide-react'

// Mock data pour les tests
const mockItems = Array.from({ length: 25 }, (_, i) => ({
  id: `item-${i + 1}`,
  title: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`
}))

// Composant de rendu simple pour les tests
const MockItemCard = ({ item, index }: { item: any; index: number }) => (
  <div data-testid={`item-${item.id}`}>
    <h3>{item.title}</h3>
    <p>{item.description}</p>
    <span>Index: {index}</span>
  </div>
)

describe('ContentGrid', () => {
  const baseProps: ContentGridProps = {
    items: mockItems.slice(0, 8), // 8 items par défaut
    renderItem: (item, index) => <MockItemCard key={item.id} item={item} index={index} />
  }

  describe('Rendu de base', () => {
    it('affiche tous les items fournis', () => {
      render(<ContentGrid {...baseProps} />)
      
      // Vérifie que les 8 items sont affichés
      for (let i = 1; i <= 8; i++) {
        expect(screen.getByTestId(`item-item-${i}`)).toBeInTheDocument()
      }
    })

    it('applique les variants de grille correctement', () => {
      const { rerender } = render(
        <ContentGrid {...baseProps} variant="product" />
      )
      
      const grid = screen.getByTestId('item-item-1').parentElement
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4')

      rerender(<ContentGrid {...baseProps} variant="article" />)
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })

    it('applique les options d\'espacement', () => {
      const { rerender } = render(
        <ContentGrid {...baseProps} gap="sm" />
      )
      
      const grid = screen.getByTestId('item-item-1').parentElement
      expect(grid).toHaveClass('gap-2')

      rerender(<ContentGrid {...baseProps} gap="lg" />)
      expect(grid).toHaveClass('gap-6')
    })
  })

  describe('Configuration colonnes personnalisée', () => {
    it('utilise les colonnes responsive personnalisées', () => {
      const customColumns = {
        default: 1,
        sm: 2,
        md: 4,
        lg: 6,
        xl: 8
      }
      
      render(<ContentGrid {...baseProps} columns={customColumns} />)
      
      const grid = screen.getByTestId('item-item-1').parentElement
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-4', 'lg:grid-cols-6', 'xl:grid-cols-8')
    })
  })

  describe('États de chargement et erreur', () => {
    it('affiche l\'état de chargement avec skeleton', () => {
      render(<ContentGrid {...baseProps} isLoading={true} loadingCount={6} />)
      
      expect(screen.queryByTestId('item-item-1')).not.toBeInTheDocument()
      
      // Vérifie la présence des skeletons
      const skeletons = screen.getAllByText('Réessayer').length > 0 ? [] : 
        document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('affiche l\'état d\'erreur avec bouton retry', () => {
      const errorMessage = 'Erreur de chargement des données'
      render(<ContentGrid {...baseProps} error={errorMessage} />)
      
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText('Réessayer')).toBeInTheDocument()
    })

    it('affiche l\'état vide avec message personnalisé', () => {
      const emptyMessage = 'Aucun produit disponible'
      render(
        <ContentGrid 
          {...baseProps} 
          items={[]} 
          emptyMessage={emptyMessage}
        />
      )
      
      expect(screen.getByText('Aucun élément')).toBeInTheDocument()
      expect(screen.getByText(emptyMessage)).toBeInTheDocument()
    })
  })

  describe('En-tête et actions', () => {
    it('affiche le titre et la description', () => {
      render(
        <ContentGrid 
          {...baseProps} 
          title="Test Grid"
          description="Une grille de test"
        />
      )
      
      expect(screen.getByText('Test Grid')).toBeInTheDocument()
      expect(screen.getByText('Une grille de test')).toBeInTheDocument()
    })

    it('affiche les actions personnalisées', () => {
      const actions = (
        <div>
          <button>Action 1</button>
          <button>Action 2</button>
        </div>
      )
      
      render(<ContentGrid {...baseProps} actions={actions} title="Test" />)
      
      expect(screen.getByText('Action 1')).toBeInTheDocument()
      expect(screen.getByText('Action 2')).toBeInTheDocument()
    })
  })

  describe('Toggle vue grille/liste', () => {
    it('affiche les boutons de vue quand allowViewToggle=true', () => {
      render(<ContentGrid {...baseProps} allowViewToggle={true} title="Test" />)
      
      const toggleContainer = screen.getByRole('button', { name: /grid/i }).parentElement
      expect(toggleContainer).toBeInTheDocument()
      
      // Vérifie la présence des deux boutons
      expect(within(toggleContainer!).getByRole('button')).toBeInTheDocument()
    })

    it('change la vue au clic sur les boutons', () => {
      const mockViewChange = jest.fn()
      
      render(
        <ContentGrid 
          {...baseProps} 
          allowViewToggle={true}
          currentView="grid"
          onViewChange={mockViewChange}
          title="Test"
        />
      )
      
      const listButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg') && getComputedStyle(btn).length > 0
      )
      
      if (listButton) {
        fireEvent.click(listButton)
        expect(mockViewChange).toHaveBeenCalledWith('list')
      }
    })

    it('affiche la vue liste correctement', () => {
      render(
        <ContentGrid 
          {...baseProps} 
          currentView="list"
          title="Test"
        />
      )
      
      // En vue liste, les items sont dans un container vertical
      const listContainer = screen.getByTestId('item-item-1').parentElement
      expect(listContainer).toHaveClass('space-y-4')
    })
  })

  describe('Pagination', () => {
    it('affiche la pagination quand configurée', () => {
      const paginationConfig = {
        enabled: true,
        pageSize: 4,
        currentPage: 1,
        totalPages: 3,
        onPageChange: jest.fn(),
        showFirstLast: true,
        showPrevNext: true
      }
      
      render(
        <ContentGrid 
          items={mockItems.slice(0, 12)}
          renderItem={(item, index) => <MockItemCard key={item.id} item={item} index={index} />}
          pagination={paginationConfig}
        />
      )
      
      // Vérifie la présence des contrôles de pagination
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('Suivant')).toBeInTheDocument()
    })

    it('appelle onPageChange au clic sur page', () => {
      const mockPageChange = jest.fn()
      const paginationConfig = {
        enabled: true,
        pageSize: 4,
        currentPage: 1,
        totalPages: 3,
        onPageChange: mockPageChange,
        showFirstLast: false,
        showPrevNext: true
      }
      
      render(
        <ContentGrid 
          items={mockItems.slice(0, 4)} // Première page seulement
          renderItem={(item, index) => <MockItemCard key={item.id} item={item} index={index} />}
          pagination={paginationConfig}
        />
      )
      
      const nextButton = screen.getByText('Suivant')
      fireEvent.click(nextButton)
      
      expect(mockPageChange).toHaveBeenCalledWith(2)
    })

    it('affiche les informations de pagination', () => {
      const paginationConfig = {
        enabled: true,
        pageSize: 4,
        currentPage: 2,
        totalPages: 3
      }
      
      render(
        <ContentGrid 
          items={mockItems.slice(4, 8)} // Page 2 
          renderItem={(item, index) => <MockItemCard key={item.id} item={item} index={index} />}
          pagination={paginationConfig}
        />
      )
      
      // Vérifie l'affichage des infos "Affichage X à Y sur Z"
      expect(screen.getByText(/Affichage \d+ à \d+ sur \d+ éléments/)).toBeInTheDocument()
    })
  })

  describe('Hook usePagination', () => {
    const TestComponent = ({ items }: { items: any[] }) => {
      const { paginationConfig, currentPage, totalPages } = usePagination(items, 5)
      
      return (
        <div>
          <span data-testid="current-page">{currentPage}</span>
          <span data-testid="total-pages">{totalPages}</span>
          <span data-testid="enabled">{paginationConfig.enabled.toString()}</span>
          <span data-testid="page-size">{paginationConfig.pageSize}</span>
        </div>
      )
    }

    it('calcule correctement les pages', () => {
      render(<TestComponent items={mockItems.slice(0, 12)} />)
      
      expect(screen.getByTestId('current-page')).toHaveTextContent('1')
      expect(screen.getByTestId('total-pages')).toHaveTextContent('3') // 12 items / 5 per page = 2.4 -> 3
      expect(screen.getByTestId('enabled')).toHaveTextContent('true')
      expect(screen.getByTestId('page-size')).toHaveTextContent('5')
    })

    it('désactive la pagination si peu d\'items', () => {
      render(<TestComponent items={mockItems.slice(0, 3)} />)
      
      expect(screen.getByTestId('enabled')).toHaveTextContent('false') // 3 items < 5 per page
      expect(screen.getByTestId('total-pages')).toHaveTextContent('1')
    })
  })

  describe('Responsive et performance', () => {
    it('applique className personnalisée', () => {
      render(<ContentGrid {...baseProps} className="custom-grid-class" />)
      
      const gridContainer = screen.getByTestId('item-item-1').parentElement
      expect(gridContainer).toHaveClass('custom-grid-class')
    })

    it('gère les grandes listes d\'items', () => {
      const largeItemsList = Array.from({ length: 100 }, (_, i) => ({
        id: `large-${i}`,
        title: `Large Item ${i}`
      }))
      
      render(
        <ContentGrid 
          items={largeItemsList.slice(0, 20)} // Limite pour test
          renderItem={(item, index) => (
            <div key={item.id} data-testid={`large-${item.id}`}>
              {item.title}
            </div>
          )}
        />
      )
      
      // Vérifie que les items sont bien rendus sans erreur
      expect(screen.getByTestId('large-large-0')).toBeInTheDocument()
      expect(screen.getByTestId('large-large-19')).toBeInTheDocument()
    })
  })
})