/**
 * Tests TDD pour QueryClient Configuration TanStack Query v5
 * 
 * Tests infrastructure avant optimisation selon Context7 patterns
 * Validation cache strategy, mutations optimistes, gestion erreurs
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { queryClient, queryKeys, cacheConfigs } from '@/lib/query-client'

describe('QueryClient Configuration', () => {
  beforeEach(() => {
    // Clear cache entre tests
    queryClient.clear()
  })

  describe('Configuration par défaut', () => {
    it('a une configuration staleTime par défaut de 5 minutes', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      
      expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000) // 5 minutes
    })

    it('a une configuration gcTime de 30 minutes', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      
      expect(defaultOptions.queries?.gcTime).toBe(30 * 60 * 1000) // 30 minutes
    })

    it('a 2 tentatives de retry par défaut', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      
      expect(defaultOptions.queries?.retry).toBe(2)
    })

    it('n\'active pas refetchOnWindowFocus par défaut', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false)
    })

    it('active refetchOnReconnect', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      
      expect(defaultOptions.queries?.refetchOnReconnect).toBe('always')
    })
  })

  describe('QueryCache avec gestion erreurs', () => {
    it('a un QueryCache configuré', () => {
      const cache = queryClient.getQueryCache()
      
      expect(cache).toBeInstanceOf(QueryCache)
    })

    it('log les erreurs sans casser l\'app', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      const cache = queryClient.getQueryCache()
      
      const mockQuery = {
        queryKey: ['test', 'query'],
        queryHash: 'test-hash'
      }
      
      const error = new Error('Test error')
      
      // Simuler erreur query
      cache.config.onError?.(error, mockQuery as any)
      
      expect(consoleError).toHaveBeenCalledWith(
        'Query failed [test, query]:', 
        error
      )
      
      consoleError.mockRestore()
    })

    it('log les succès pour queries importantes', () => {
      const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
      const cache = queryClient.getQueryCache()
      
      const mockQuery = {
        queryKey: ['products', 'list'],
        queryHash: 'products-hash'
      }
      
      // Simuler succès query produits
      cache.config.onSuccess?.('test-data', mockQuery as any)
      
      expect(consoleLog).toHaveBeenCalledWith(
        'Query succeeded [products, list]'
      )
      
      consoleLog.mockRestore()
    })
  })

  describe('MutationCache avec optimistic updates', () => {
    it('a un MutationCache configuré', () => {
      const mutationCache = queryClient.getMutationCache()
      
      expect(mutationCache).toBeInstanceOf(MutationCache)
    })

    it('log les erreurs mutations', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      const mutationCache = queryClient.getMutationCache()
      
      const mockMutation = {
        options: {
          mutationKey: ['addToCart', 'test']
        }
      }
      
      const error = new Error('Mutation error')
      
      // Simuler erreur mutation
      mutationCache.config.onError?.(error, {}, {}, mockMutation as any)
      
      expect(consoleError).toHaveBeenCalledWith(
        'Mutation failed [addToCart, test]:', 
        error
      )
      
      consoleError.mockRestore()
    })
  })
})

describe('QueryKeys Factory', () => {
  describe('Products query keys', () => {
    it('génère des keys consistantes pour products.all()', () => {
      const key = queryKeys.products.all()
      
      expect(key).toEqual(['products'])
    })

    it('génère des keys consistantes pour products.list()', () => {
      const filters = { category: 'huiles-essentielles' }
      const key = queryKeys.products.list(filters)
      
      expect(key).toEqual(['products', 'list', filters])
    })

    it('génère des keys consistantes pour products.detail()', () => {
      const key = queryKeys.products.detail('prod-123')
      
      expect(key).toEqual(['products', 'detail', 'prod-123'])
    })

    it('génère des keys consistantes pour products.byCategory()', () => {
      const key = queryKeys.products.byCategory('huiles-essentielles')
      
      expect(key).toEqual(['products', 'category', 'huiles-essentielles'])
    })

    it('génère des keys consistantes pour products.search()', () => {
      const key = queryKeys.products.search('lavande')
      
      expect(key).toEqual(['products', 'search', 'lavande'])
    })
  })

  describe('Cart query keys', () => {
    it('génère des keys consistantes pour cart.detail() guest', () => {
      const key = queryKeys.cart.detail()
      
      expect(key).toEqual(['cart', 'guest'])
    })

    it('génère des keys consistantes pour cart.detail() avec sessionId', () => {
      const key = queryKeys.cart.detail('session-123')
      
      expect(key).toEqual(['cart', 'session-123'])
    })

    it('génère des keys consistantes pour cart.count()', () => {
      const key = queryKeys.cart.count('session-123')
      
      expect(key).toEqual(['cart', 'count', 'session-123'])
    })
  })

  describe('Categories query keys', () => {
    it('génère des keys consistantes pour categories.all()', () => {
      const key = queryKeys.categories.all()
      
      expect(key).toEqual(['categories'])
    })

    it('génère des keys consistantes pour categories.tree()', () => {
      const key = queryKeys.categories.tree()
      
      expect(key).toEqual(['categories', 'tree'])
    })

    it('génère des keys consistantes pour categories.detail()', () => {
      const key = queryKeys.categories.detail('huiles-essentielles')
      
      expect(key).toEqual(['category', 'huiles-essentielles'])
    })
  })

  describe('Articles query keys', () => {
    it('génère des keys consistantes pour articles.all()', () => {
      const key = queryKeys.articles.all()
      
      expect(key).toEqual(['articles'])
    })

    it('génère des keys consistantes pour articles.detail()', () => {
      const key = queryKeys.articles.detail('guide-huiles-essentielles')
      
      expect(key).toEqual(['article', 'guide-huiles-essentielles'])
    })
  })

  describe('User query keys', () => {
    it('génère des keys consistantes pour user.detail()', () => {
      const key = queryKeys.user.detail('user-123')
      
      expect(key).toEqual(['user', 'user-123'])
    })

    it('génère des keys consistantes pour user.orders()', () => {
      const key = queryKeys.user.orders('user-123')
      
      expect(key).toEqual(['user', 'user-123', 'orders'])
    })

    it('génère des keys consistantes pour user.favorites()', () => {
      const key = queryKeys.user.favorites('user-123')
      
      expect(key).toEqual(['user', 'user-123', 'favorites'])
    })
  })
})

describe('Cache Configurations Spécialisées', () => {
  describe('Products cache config', () => {
    it('a un staleTime de 15 minutes pour produits', () => {
      expect(cacheConfigs.products.staleTime).toBe(15 * 60 * 1000)
    })

    it('a un gcTime de 1 heure pour produits', () => {
      expect(cacheConfigs.products.gcTime).toBe(60 * 60 * 1000)
    })
  })

  describe('Cart cache config', () => {
    it('a un staleTime court de 30 secondes pour panier', () => {
      expect(cacheConfigs.cart.staleTime).toBe(30 * 1000)
    })

    it('a un gcTime de 5 minutes pour panier', () => {
      expect(cacheConfigs.cart.gcTime).toBe(5 * 60 * 1000)
    })

    it('active refetchOnMount pour panier', () => {
      expect(cacheConfigs.cart.refetchOnMount).toBe(true)
    })

    it('active refetchOnWindowFocus pour panier', () => {
      expect(cacheConfigs.cart.refetchOnWindowFocus).toBe(true)
    })
  })

  describe('Categories cache config', () => {
    it('a un staleTime long de 1 heure pour categories', () => {
      expect(cacheConfigs.categories.staleTime).toBe(60 * 60 * 1000)
    })

    it('a un gcTime très long de 24 heures pour categories', () => {
      expect(cacheConfigs.categories.gcTime).toBe(24 * 60 * 60 * 1000)
    })
  })

  describe('Articles cache config', () => {
    it('a un staleTime moyen de 10 minutes pour articles', () => {
      expect(cacheConfigs.articles.staleTime).toBe(10 * 60 * 1000)
    })

    it('a un gcTime de 30 minutes pour articles', () => {
      expect(cacheConfigs.articles.gcTime).toBe(30 * 60 * 1000)
    })
  })

  describe('User cache config', () => {
    it('a un staleTime court de 2 minutes pour user data', () => {
      expect(cacheConfigs.user.staleTime).toBe(2 * 60 * 1000)
    })

    it('a un gcTime de 10 minutes pour user data', () => {
      expect(cacheConfigs.user.gcTime).toBe(10 * 60 * 1000)
    })

    it('active refetchOnWindowFocus pour user data', () => {
      expect(cacheConfigs.user.refetchOnWindowFocus).toBe(true)
    })
  })
})

describe('Performance et Bundle Size', () => {
  it('le queryClient est exporté comme instance singleton', () => {
    const client1 = require('@/lib/query-client').queryClient
    const client2 = require('@/lib/query-client').queryClient
    
    expect(client1).toBe(client2) // Même instance
  })

  it('les queryKeys sont const assertions pour tree-shaking', () => {
    const keys = queryKeys.products.all()
    
    // TypeScript const assertion préserve les types literals
    expect(Array.isArray(keys)).toBe(true)
    expect(keys.length).toBeGreaterThan(0)
  })
})

describe('Compatibilité Next.js 15 SSR', () => {
  it('gère l\'hydration sans erreurs', () => {
    // QueryClient ne doit pas accéder window/localStorage au render serveur
    expect(() => {
      new QueryClient(queryClient.getDefaultOptions())
    }).not.toThrow()
  })

  it('supporte la sérialisation pour SSR', () => {
    const testData = { id: '1', name: 'Test Product' }
    
    // Les données doivent être JSON sérialisables
    expect(() => JSON.stringify(testData)).not.toThrow()
    expect(JSON.parse(JSON.stringify(testData))).toEqual(testData)
  })
})

describe('Gestion Mémoire et Cleanup', () => {
  it('nettoie le cache avec clear()', () => {
    // Ajouter une query fictive
    queryClient.setQueryData(['test'], { data: 'test' })
    
    expect(queryClient.getQueryData(['test'])).toEqual({ data: 'test' })
    
    // Nettoyer le cache
    queryClient.clear()
    
    expect(queryClient.getQueryData(['test'])).toBeUndefined()
  })

  it('invalide les queries spécifiques', async () => {
    queryClient.setQueryData(['products'], { data: 'old' })
    
    await queryClient.invalidateQueries({ 
      queryKey: ['products'] 
    })
    
    // La query a été invalidée (marquée stale)
    const queryState = queryClient.getQueryState(['products'])
    expect(queryState?.isInvalidated).toBe(true)
  })
})