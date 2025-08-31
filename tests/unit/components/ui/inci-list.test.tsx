/**
 * Tests pour le composant InciList
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { InciList, InciListCompact } from '@/components/ui/inci-list'

// Mock des dépendances Lucide
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
  ChevronUp: () => <div data-testid="chevron-up">ChevronUp</div>,
  Info: () => <div data-testid="info">Info</div>,
  AlertTriangle: () => <div data-testid="alert-triangle">AlertTriangle</div>
}))

const mockInciList = [
  'Olea Europaea Fruit Oil',
  'Lavandula Angustifolia Oil', 
  'Cocos Nucifera Oil',
  'Butyrospermum Parkii Butter',
  'Aloe Barbadensis Leaf Juice',
  'Tocopherol',
  'Citric Acid'
]

describe('InciList', () => {
  it('devrait s\'afficher correctement avec une liste INCI', () => {
    render(<InciList inciList={mockInciList.slice(0, 3)} />)
    
    expect(screen.getByText('Liste INCI :')).toBeInTheDocument()
    expect(screen.getByText('Olea Europaea Fruit Oil')).toBeInTheDocument()
    expect(screen.getByText('Lavandula Angustifolia Oil')).toBeInTheDocument()
    expect(screen.getByText('Cocos Nucifera Oil')).toBeInTheDocument()
  })

  it('devrait afficher le message "non disponible" si liste vide', () => {
    render(<InciList inciList={[]} />)
    
    expect(screen.getByText('Liste INCI non disponible')).toBeInTheDocument()
  })

  it('devrait afficher les noms communs quand showCommonNames=true', () => {
    render(
      <InciList 
        inciList={['Olea Europaea Fruit Oil']} 
        showCommonNames={true}
      />
    )
    
    expect(screen.getByText('(Huile d\'olive)')).toBeInTheDocument()
  })

  it('ne devrait pas afficher les noms communs quand showCommonNames=false', () => {
    render(
      <InciList 
        inciList={['Olea Europaea Fruit Oil']} 
        showCommonNames={false}
      />
    )
    
    expect(screen.queryByText('(Huile d\'olive)')).not.toBeInTheDocument()
  })

  it('devrait afficher les fonctions quand showFunctions=true', () => {
    render(
      <InciList 
        inciList={['Olea Europaea Fruit Oil']} 
        showFunctions={true}
      />
    )
    
    expect(screen.getByText('Hydratant')).toBeInTheDocument()
    expect(screen.getByText('Émollient')).toBeInTheDocument()
  })

  it('devrait gérer le mode compact avec bouton "Voir plus"', () => {
    render(
      <InciList 
        inciList={mockInciList} 
        variant="compact"
      />
    )
    
    // Par défaut, seuls les 5 premiers devraient être visibles
    expect(screen.getByText('Olea Europaea Fruit Oil')).toBeInTheDocument()
    expect(screen.queryByText('Tocopherol')).not.toBeInTheDocument()
    
    // Bouton "Voir plus" devrait être présent
    const showMoreButton = screen.getByText(/Voir tous les ingrédients/)
    expect(showMoreButton).toBeInTheDocument()
    
    // Cliquer pour voir plus
    fireEvent.click(showMoreButton)
    
    // Maintenant tous les ingrédients devraient être visibles
    expect(screen.getByText('Tocopherol')).toBeInTheDocument()
    
    // Le bouton devrait maintenant dire "Voir moins"
    expect(screen.getByText(/Voir moins/)).toBeInTheDocument()
  })

  it('devrait afficher les avertissements d\'allergènes', () => {
    render(
      <InciList 
        inciList={['Lavandula Angustifolia Oil']} 
        showWarnings={true}
      />
    )
    
    // L'icône d'avertissement devrait être présente
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument()
  })

  it('devrait gérer la locale anglaise', () => {
    render(
      <InciList 
        inciList={['Olea Europaea Fruit Oil']} 
        locale="en"
        showCommonNames={true}
        showFunctions={true}
      />
    )
    
    expect(screen.getByText('(Olive Oil)')).toBeInTheDocument()
    expect(screen.getByText('Moisturizer')).toBeInTheDocument()
  })

  it('devrait afficher la note réglementaire', () => {
    render(<InciList inciList={['Olea Europaea Fruit Oil']} />)
    
    expect(screen.getByText(/Ingrédients listés par ordre décroissant/)).toBeInTheDocument()
    expect(screen.getByText(/réglementation européenne/)).toBeInTheDocument()
  })

  it('devrait appliquer les classes CSS personnalisées', () => {
    render(
      <InciList 
        inciList={['Olea Europaea Fruit Oil']} 
        className="custom-class"
      />
    )
    
    const container = screen.getByText('Liste INCI :').closest('.space-y-2')
    expect(container).toHaveClass('custom-class')
  })
})

describe('InciListCompact', () => {
  it('devrait s\'afficher correctement avec une liste courte', () => {
    render(<InciListCompact inciList={['Olea Europaea Fruit Oil', 'Aloe Vera']} />)
    
    expect(screen.getByText('INCI:')).toBeInTheDocument()
    expect(screen.getByText(/Olea Europaea Fruit Oil, Aloe Vera/)).toBeInTheDocument()
  })

  it('devrait tronquer et afficher le compte pour les listes longues', () => {
    render(<InciListCompact inciList={mockInciList} />)
    
    expect(screen.getByText('INCI:')).toBeInTheDocument()
    expect(screen.getByText(/\(\+4\)/)).toBeInTheDocument()
    
    // Seuls les 3 premiers devraient être affichés
    const text = screen.getByText(/Olea Europaea Fruit Oil, Lavandula Angustifolia Oil, Cocos Nucifera Oil/)
    expect(text).toBeInTheDocument()
  })

  it('ne devrait rien afficher si liste vide', () => {
    const { container } = render(<InciListCompact inciList={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('ne devrait rien afficher si liste null', () => {
    const { container } = render(<InciListCompact inciList={null as any} />)
    expect(container.firstChild).toBeNull()
  })

  it('devrait appliquer les classes CSS personnalisées', () => {
    render(
      <InciListCompact 
        inciList={['Olea Europaea Fruit Oil']} 
        className="custom-compact-class"
      />
    )
    
    const element = screen.getByText('INCI:')
    expect(element).toHaveClass('custom-compact-class')
  })
})

describe('InciList - Edge cases', () => {
  it('devrait gérer les listes avec exactement 5 éléments', () => {
    const exactlyFive = mockInciList.slice(0, 5)
    render(
      <InciList 
        inciList={exactlyFive} 
        variant="compact"
      />
    )
    
    // Avec exactement 5 éléments, le bouton "Voir plus" ne devrait pas apparaître
    expect(screen.queryByText(/Voir tous les ingrédients/)).not.toBeInTheDocument()
  })

  it('devrait gérer une liste null', () => {
    render(<InciList inciList={null as any} />)
    expect(screen.getByText('Liste INCI non disponible')).toBeInTheDocument()
  })

  it('devrait gérer une liste undefined', () => {
    render(<InciList inciList={undefined as any} />)
    expect(screen.getByText('Liste INCI non disponible')).toBeInTheDocument()
  })

  it('devrait gérer le mode full avec showWarnings=false', () => {
    render(
      <InciList 
        inciList={['Lavandula Angustifolia Oil']} 
        variant="full"
        showWarnings={false}
      />
    )
    
    expect(screen.queryByTestId('alert-triangle')).not.toBeInTheDocument()
  })
})