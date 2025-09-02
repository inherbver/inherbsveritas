// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />
  },
}))

// ===== MOCKS SUPABASE CENTRALISÉS =====

// Factory function pour créer des mocks Supabase cohérents
const createMockSupabaseClient = (overrides = {}) => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    }),
    getSession: jest.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    }),
    signInWithPassword: jest.fn().mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: null 
    }),
    signUp: jest.fn().mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: null 
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    }),
    ...overrides.auth
  },
  from: jest.fn((table) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ 
      data: null, 
      error: null 
    }),
    maybeSingle: jest.fn().mockResolvedValue({ 
      data: null, 
      error: null 
    }),
    ...overrides.queries
  })),
  ...overrides
})

// Mock global pour @/lib/supabase/client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => global.createMockSupabaseClient()),
  supabase: global.createMockSupabaseClient()
}))

// Mock global pour @/lib/supabase/server  
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => createMockSupabaseClient()),
}))

// Mock global pour @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => createMockSupabaseClient()),
  createBrowserClient: jest.fn(() => createMockSupabaseClient()),
  CookieOptions: {}
}))

// Factory disponible globalement pour les tests spécialisés
global.createMockSupabaseClient = createMockSupabaseClient

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'