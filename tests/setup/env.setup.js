/**
 * @file Setup environnement tests - Semaine 4 MVP
 * @description Variables d'environnement pour tests shop
 */

// Mock variables d'environnement pour tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.NODE_ENV = 'test'

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/'
}

jest.mock('next/router', () => ({
  useRouter: () => mockRouter
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/shop'
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => `${namespace}.${key}`,
  useLocale: () => 'fr'
}))

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null })
  })
}))

// Console warnings supression for tests
const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('React.createRef')
  ) {
    return
  }
  originalWarn.call(console, ...args)
}