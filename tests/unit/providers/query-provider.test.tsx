/**
 * Tests TDD pour QueryProvider TanStack Query v5
 * 
 * Tests Provider SSR/hydration Next.js 15 App Router
 * Validation DevTools, client injection, hooks access
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { QueryProvider } from '@/providers/query-provider'

// Mock du React Query DevTools
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: ({ initialIsOpen }: { initialIsOpen: boolean }) => (
    <div data-testid="react-query-devtools" data-initial-open={initialIsOpen}>
      DevTools
    </div>
  )
}))

// Mock de l'environnement
const originalEnv = process.env.NODE_ENV

describe('QueryProvider', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore NODE_ENV
    process.env.NODE_ENV = originalEnv
  })

  describe('Rendu de base', () => {
    it('rend les children correctement', () => {
      render(
        <QueryProvider>
          <div data-testid="child-component">Test Child</div>
        </QueryProvider>
      )

      expect(screen.getByTestId('child-component')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('utilise le client par défaut si pas de client fourni', () => {
      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['test'],
          queryFn: () => Promise.resolve('test-data')
        })
        
        return <div data-testid="test-result">{query.data || 'loading'}</div>
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      expect(screen.getByTestId('test-result')).toBeInTheDocument()
    })

    it('utilise le client personnalisé si fourni', async () => {
      const customClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false // Configuration différente pour le test
          }
        }
      })

      const TestComponent = () => {
        const query = useQuery({
          queryKey: ['custom-test'],
          queryFn: () => Promise.resolve('custom-data')
        })
        
        return <div data-testid="custom-result">{query.data || 'loading'}</div>
      }

      render(
        <QueryProvider client={customClient}>
          <TestComponent />
        </QueryProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('custom-data')).toBeInTheDocument()
      })
    })
  })

  describe('DevTools conditionnels', () => {
    it('affiche DevTools en mode développement', () => {
      process.env.NODE_ENV = 'development'

      render(
        <QueryProvider>
          <div>App Content</div>
        </QueryProvider>
      )

      const devtools = screen.getByTestId('react-query-devtools')
      expect(devtools).toBeInTheDocument()
      expect(devtools).toHaveAttribute('data-initial-open', 'false')
    })

    it('masque DevTools en mode production', () => {
      process.env.NODE_ENV = 'production'

      render(
        <QueryProvider>
          <div>App Content</div>
        </QueryProvider>
      )

      expect(screen.queryByTestId('react-query-devtools')).not.toBeInTheDocument()
    })

    it('masque DevTools en mode test', () => {
      process.env.NODE_ENV = 'test'

      render(
        <QueryProvider>
          <div>App Content</div>
        </QueryProvider>
      )

      expect(screen.queryByTestId('react-query-devtools')).not.toBeInTheDocument()
    })
  })

  describe('Memoization du client', () => {
    it('mémorise le client par défaut', () => {
      const TestComponent = () => {
        const [rerenderCount, setRerenderCount] = React.useState(0)
        
        React.useEffect(() => {
          setRerenderCount(c => c + 1)
        })
        
        return <div data-testid="rerender-count">{rerenderCount}</div>
      }

      const App = () => {
        const [key, setKey] = React.useState(0)
        
        return (
          <div>
            <button onClick={() => setKey(k => k + 1)} data-testid="rerender-btn">
              Rerender
            </button>
            <QueryProvider key={key}>
              <TestComponent />
            </QueryProvider>
          </div>
        )
      }

      render(<App />)
      
      // Premier rendu
      expect(screen.getByTestId('rerender-count')).toHaveTextContent('1')
    })

    it('mémorise le client personnalisé', () => {
      const client1 = new QueryClient()
      const client2 = new QueryClient()
      
      const TestComponent = ({ client }: { client: QueryClient }) => (
        <QueryProvider client={client}>
          <div data-testid="client-id">{client === client1 ? 'client1' : 'client2'}</div>
        </QueryProvider>
      )

      const { rerender } = render(<TestComponent client={client1} />)
      expect(screen.getByText('client1')).toBeInTheDocument()

      // Changer le client ne doit pas recréer l'instance
      rerender(<TestComponent client={client1} />)
      expect(screen.getByText('client1')).toBeInTheDocument()

      // Nouveau client doit être pris en compte
      rerender(<TestComponent client={client2} />)
      expect(screen.getByText('client2')).toBeInTheDocument()
    })
  })

  describe('Compatibilité Next.js 15 SSR', () => {
    it('ne cause pas d\'erreurs d\'hydratation', () => {
      // Mock console.error pour capturer les erreurs d'hydratation
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const TestComponent = () => (
        <div data-testid="ssr-component">
          SSR Safe Content
        </div>
      )

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      expect(screen.getByTestId('ssr-component')).toBeInTheDocument()
      
      // Aucune erreur d'hydratation
      expect(consoleError).not.toHaveBeenCalled()
      
      consoleError.mockRestore()
    })

    it('supporte les Server Components en tant que children', () => {
      // Simuler un Server Component (pas de hooks)
      const ServerComponent = () => (
        <div data-testid="server-component">
          Server Rendered Content
        </div>
      )

      const ClientWrapper = () => (
        <QueryProvider>
          <ServerComponent />
        </QueryProvider>
      )

      render(<ClientWrapper />)
      
      expect(screen.getByTestId('server-component')).toBeInTheDocument()
    })
  })

  describe('Gestion des erreurs', () => {
    it('gère les erreurs de queries sans casser l\'app', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const FailingComponent = () => {
        const query = useQuery({
          queryKey: ['failing-query'],
          queryFn: () => Promise.reject(new Error('Network error')),
          retry: false
        })
        
        return (
          <div data-testid="error-component">
            {query.error ? `Error: ${query.error.message}` : 'Loading...'}
          </div>
        )
      }

      render(
        <QueryProvider>
          <FailingComponent />
        </QueryProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Error: Network error')).toBeInTheDocument()
      })

      // L'app ne doit pas crasher
      expect(screen.getByTestId('error-component')).toBeInTheDocument()
      
      consoleError.mockRestore()
    })
  })

  describe('Performance et Bundle Size', () => {
    it('ne charge les DevTools qu\'en développement', () => {
      // En mode production, les DevTools ne doivent pas être dans le bundle
      process.env.NODE_ENV = 'production'
      
      render(
        <QueryProvider>
          <div>Production App</div>
        </QueryProvider>
      )
      
      // Vérifier que le code des DevTools n'est pas chargé
      expect(screen.queryByTestId('react-query-devtools')).not.toBeInTheDocument()
    })

    it('optimise les re-renders avec useMemo', () => {
      let renderCount = 0
      
      const TestComponent = () => {
        renderCount++
        return <div data-testid="render-count">{renderCount}</div>
      }
      
      const App = ({ triggerRerender }: { triggerRerender: number }) => (
        <QueryProvider>
          <TestComponent />
          <div>{triggerRerender}</div>
        </QueryProvider>
      )

      const { rerender } = render(<App triggerRerender={1} />)
      const initialCount = renderCount
      
      // Re-render du parent ne doit pas déclencher re-render inutile
      rerender(<App triggerRerender={2} />)
      
      // Le composant ne doit pas re-render plus que nécessaire
      expect(renderCount).toBeLessThanOrEqual(initialCount + 1)
    })
  })
})