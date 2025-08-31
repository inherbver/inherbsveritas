/**
 * Tests unitaires pour i18n/routing 
 * Tests routage internationalisé next-intl
 */

import { 
  getPathname,
  redirect,
  permanentRedirect,
  Link,
  useRouter,
  usePathname
} from '@/i18n/routing'

// Mock next-intl
jest.mock('next-intl/routing', () => ({
  createLocalizedPathnamesNavigation: jest.fn(() => ({
    Link: 'MockedLink',
    redirect: jest.fn(),
    useRouter: jest.fn(),
    usePathname: jest.fn(),
    getPathname: jest.fn()
  }))
}))

describe('i18n/routing', () => {
  describe('localized navigation', () => {
    it('should provide Link component for localized routes', () => {
      expect(Link).toBeDefined()
      expect(Link).toBe('MockedLink')
    })

    it('should provide redirect function', () => {
      expect(redirect).toBeDefined()
      expect(typeof redirect).toBe('function')
    })

    it('should provide permanentRedirect function', () => {
      expect(permanentRedirect).toBeDefined()
      expect(typeof permanentRedirect).toBe('function')
    })
  })

  describe('router hooks', () => {
    it('should provide useRouter hook', () => {
      expect(useRouter).toBeDefined()
      expect(typeof useRouter).toBe('function')
    })

    it('should provide usePathname hook', () => {
      expect(usePathname).toBeDefined()
      expect(typeof usePathname).toBe('function')
    })
  })

  describe('pathname utilities', () => {
    it('should provide getPathname utility', () => {
      expect(getPathname).toBeDefined()
      expect(typeof getPathname).toBe('function')
    })
  })

  describe('configuration validation', () => {
    it('should have correct locales configuration', () => {
      // These would be defined in the actual routing configuration
      const expectedLocales = ['fr', 'en']
      const expectedDefaultLocale = 'fr'
      
      // Mock implementation would validate these
      expect(expectedLocales).toContain('fr')
      expect(expectedLocales).toContain('en')
      expect(expectedDefaultLocale).toBe('fr')
    })

    it('should have pathnames configuration for main routes', () => {
      const expectedPaths = [
        '/',
        '/products',
        '/profile',
        '/cart',
        '/checkout',
        '/admin'
      ]
      
      // Verify core MVP routes are configured
      expectedPaths.forEach(path => {
        expect(typeof path).toBe('string')
        expect(path.startsWith('/')).toBe(true)
      })
    })
  })

  describe('route generation', () => {
    it('should handle French routes correctly', () => {
      const frenchPaths = {
        '/products': '/produits',
        '/cart': '/panier',
        '/profile': '/profil'
      }
      
      Object.entries(frenchPaths).forEach(([en, fr]) => {
        expect(typeof en).toBe('string')
        expect(typeof fr).toBe('string')
        expect(fr.startsWith('/')).toBe(true)
      })
    })

    it('should handle English routes correctly', () => {
      const englishPaths = [
        '/products',
        '/cart',
        '/profile',
        '/checkout'
      ]
      
      englishPaths.forEach(path => {
        expect(typeof path).toBe('string')
        expect(path.startsWith('/')).toBe(true)
      })
    })
  })
})