/**
 * Tests de validation du Design System MVP
 * Vérification de l'intégrité et cohérence du design system shadcn/ui HerbisVeritas
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Spinner,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  InciListCompact
} from '@/components/ui'

// Mock Radix UI components for testing
jest.mock('@radix-ui/react-select', () => ({
  Root: ({ children }: any) => <div data-testid="select-root">{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="select-trigger" {...props}>{children}</button>,
  Value: ({ children }: any) => <span data-testid="select-value">{children}</span>,
  Portal: ({ children }: any) => <div data-testid="select-portal">{children}</div>,
  Content: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  Viewport: ({ children }: any) => <div data-testid="select-viewport">{children}</div>,
  Item: ({ children }: any) => <div data-testid="select-item">{children}</div>,
  ItemText: ({ children }: any) => <span>{children}</span>,
  ItemIndicator: ({ children }: any) => <span>{children}</span>,
  Group: ({ children }: any) => <div>{children}</div>,
  Label: ({ children }: any) => <div>{children}</div>,
  Separator: () => <hr />,
  ScrollUpButton: ({ children }: any) => <div>{children}</div>,
  ScrollDownButton: ({ children }: any) => <div>{children}</div>,
  Icon: ({ children }: any) => <span>{children}</span>
}))

jest.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon">✓</div>,
  ChevronDown: () => <div data-testid="chevron-down">⌄</div>,
  ChevronUp: () => <div data-testid="chevron-up">⌃</div>,
  Info: () => <div data-testid="info">ℹ</div>,
  AlertTriangle: () => <div data-testid="alert-triangle">⚠</div>
}))

describe('Design System MVP - Composants Base', () => {
  describe('Button Component', () => {
    it('devrait s\'afficher avec les variantes de base', () => {
      render(
        <div>
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      )

      expect(screen.getByText('Default Button')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      expect(screen.getByText('Outline')).toBeInTheDocument()
      expect(screen.getByText('Destructive')).toBeInTheDocument()
    })

    it('devrait supporter les différentes tailles', () => {
      render(
        <div>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      )

      expect(screen.getByText('Small')).toHaveClass('h-9')
      expect(screen.getByText('Default')).toHaveClass('h-10')
      expect(screen.getByText('Large')).toHaveClass('h-11')
    })
  })

  describe('Card Component', () => {
    it('devrait s\'afficher avec header et contenu', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('devrait avoir les classes CSS appropriées', () => {
      render(
        <Card data-testid="card">
          <CardContent>Content</CardContent>
        </Card>
      )

      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
    })
  })

  describe('Badge Component', () => {
    it('devrait supporter les variants standards', () => {
      render(
        <div>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      )

      expect(screen.getByText('Default')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      expect(screen.getByText('Destructive')).toBeInTheDocument()
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })

    it('devrait supporter les variants HerbisVeritas', () => {
      render(
        <div>
          <Badge variant="bio">Bio</Badge>
          <Badge variant="recolte">Récolte</Badge>
          <Badge variant="origine">Origine</Badge>
        </div>
      )

      const bioLabel = screen.getByText('Bio')
      const recolteLabel = screen.getByText('Récolte')
      const origineLabel = screen.getByText('Origine')

      expect(bioLabel).toHaveClass('bg-green-100', 'text-green-800')
      expect(recolteLabel).toHaveClass('bg-amber-100', 'text-amber-800')
      expect(origineLabel).toHaveClass('bg-blue-100', 'text-blue-800')
    })
  })

  describe('Input Component', () => {
    it('devrait s\'afficher et accepter des valeurs', () => {
      render(
        <Input placeholder="Test input" data-testid="test-input" />
      )

      const input = screen.getByTestId('test-input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Test input')
    })

    it('devrait avoir les bonnes classes CSS', () => {
      render(<Input data-testid="input" />)
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border')
    })
  })

  describe('Alert Component', () => {
    it('devrait s\'afficher avec titre et description', () => {
      render(
        <Alert>
          <AlertTitle>Test Alert</AlertTitle>
          <AlertDescription>Alert description</AlertDescription>
        </Alert>
      )

      expect(screen.getByText('Test Alert')).toBeInTheDocument()
      expect(screen.getByText('Alert description')).toBeInTheDocument()
    })
  })

  describe('Spinner Component', () => {
    it('devrait s\'afficher avec label d\'accessibilité', () => {
      render(<Spinner label="Loading products" />)
      
      expect(screen.getByLabelText('Loading products')).toBeInTheDocument()
      expect(screen.getByText('Loading products')).toHaveClass('sr-only')
    })

    it('devrait supporter différentes tailles', () => {
      render(
        <div>
          <Spinner size="sm" data-testid="small" />
          <Spinner size="default" data-testid="default" />
          <Spinner size="lg" data-testid="large" />
        </div>
      )

      expect(screen.getByTestId('small')).toHaveClass('h-4', 'w-4')
      expect(screen.getByTestId('default')).toHaveClass('h-6', 'w-6')
      expect(screen.getByTestId('large')).toHaveClass('h-8', 'w-8')
    })
  })
})

describe('Design System MVP - Cohérence', () => {
  it('tous les composants devraient utiliser les mêmes tokens de design', () => {
    render(
      <div>
        <Button className="test-button">Button</Button>
        <Card className="test-card"><CardContent>Card</CardContent></Card>
        <Input className="test-input" />
        <Badge className="test-badge">Badge</Badge>
      </div>
    )

    // Vérifier que tous utilisent rounded-md ou similaire
    const button = document.querySelector('.test-button')
    const card = document.querySelector('.test-card')
    const input = document.querySelector('.test-input')

    expect(button).toHaveClass('rounded-md')
    expect(card).toHaveClass('rounded-lg')
    expect(input).toHaveClass('rounded-md')
  })

  it('les variants de couleur devraient être cohérents', () => {
    render(
      <div>
        <Button variant="destructive">Delete</Button>
        <Badge variant="destructive">Error</Badge>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
        </Alert>
      </div>
    )

    // Tous les variants destructive devraient utiliser des couleurs similaires
    expect(screen.getByText('Delete')).toHaveClass('bg-destructive')
    expect(screen.getByText('Error')).toHaveClass('bg-destructive')
  })
})

describe('Design System MVP - Integration HerbisVeritas', () => {
  it('devrait intégrer les composants spécialisés HerbisVeritas', () => {
    const mockInciList = ['Olea Europaea Fruit Oil', 'Lavandula Oil']
    
    render(
      <InciListCompact inciList={mockInciList} />
    )

    expect(screen.getByText('INCI:')).toBeInTheDocument()
    expect(screen.getByText(/Olea Europaea Fruit Oil/)).toBeInTheDocument()
  })

  it('devrait maintenir la cohérence avec les labels HerbisVeritas', () => {
    render(
      <div>
        <Badge variant="bio">Bio Certifié</Badge>
        <Badge variant="origine">Occitanie</Badge>
        <Badge variant="essence">Essence Précieuse</Badge>
      </div>
    )

    // Vérifier les couleurs spécifiques HerbisVeritas
    expect(screen.getByText('Bio Certifié')).toHaveClass('text-green-800')
    expect(screen.getByText('Occitanie')).toHaveClass('text-blue-800')
    expect(screen.getByText('Essence Précieuse')).toHaveClass('text-indigo-800')
  })
})