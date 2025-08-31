/**
 * Tests unitaires pour types/context7-patterns
 * Tests patterns et types Context7
 */

import type {
  Context7Pattern,
  AuthPattern,
  DataPattern,
  UIPattern,
  SecurityPattern,
  PatternCategory,
  PatternConfig,
  ValidationRule
} from '@/types/context7-patterns'

describe('types/context7-patterns', () => {
  describe('pattern type validation', () => {
    it('should validate AuthPattern structure', () => {
      const authPattern: AuthPattern = {
        id: 'auth-login',
        name: 'Login Pattern',
        category: 'authentication',
        implementation: {
          middleware: true,
          validation: ['email', 'password'],
          errors: {
            invalidCredentials: 'INVALID_CREDENTIALS',
            accountLocked: 'ACCOUNT_LOCKED'
          }
        },
        security: {
          rateLimiting: true,
          encryption: 'bcrypt'
        }
      }
      
      expect(authPattern.id).toBe('auth-login')
      expect(authPattern.category).toBe('authentication')
      expect(authPattern.implementation.middleware).toBe(true)
      expect(authPattern.security.rateLimiting).toBe(true)
    })

    it('should validate DataPattern structure', () => {
      const dataPattern: DataPattern = {
        id: 'data-products',
        name: 'Products Data Pattern',
        category: 'data',
        schema: {
          table: 'products',
          columns: ['id', 'name', 'price'],
          relationships: ['categories', 'labels']
        },
        queries: {
          findAll: 'SELECT * FROM products',
          findById: 'SELECT * FROM products WHERE id = $1'
        },
        validation: {
          required: ['name', 'price'],
          types: {
            price: 'number',
            name: 'string'
          }
        }
      }
      
      expect(dataPattern.schema.table).toBe('products')
      expect(dataPattern.queries.findAll).toContain('SELECT')
      expect(dataPattern.validation.required).toContain('name')
    })

    it('should validate UIPattern structure', () => {
      const uiPattern: UIPattern = {
        id: 'ui-button',
        name: 'Button Component Pattern',
        category: 'component',
        component: {
          props: ['variant', 'size', 'disabled'],
          variants: ['primary', 'secondary', 'destructive'],
          accessibility: {
            role: 'button',
            keyboard: true
          }
        },
        styling: {
          framework: 'tailwind',
          responsive: true
        }
      }
      
      expect(uiPattern.component.variants).toContain('primary')
      expect(uiPattern.component.accessibility.role).toBe('button')
      expect(uiPattern.styling.framework).toBe('tailwind')
    })
  })

  describe('pattern configuration', () => {
    it('should validate PatternConfig structure', () => {
      const config: PatternConfig = {
        environment: 'development',
        features: {
          authentication: true,
          ecommerce: true,
          analytics: false
        },
        database: {
          provider: 'supabase',
          migrations: true
        },
        api: {
          version: 'v1',
          rateLimit: 100
        }
      }
      
      expect(config.environment).toBe('development')
      expect(config.features.authentication).toBe(true)
      expect(config.database.provider).toBe('supabase')
    })
  })

  describe('validation rules', () => {
    it('should validate ValidationRule structure', () => {
      const rule: ValidationRule = {
        field: 'email',
        type: 'string',
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Email invalide'
      }
      
      expect(rule.field).toBe('email')
      expect(rule.required).toBe(true)
      expect(rule.pattern).toBeInstanceOf(RegExp)
      expect(rule.message).toContain('Email')
    })

    it('should handle optional validation rules', () => {
      const rule: ValidationRule = {
        field: 'phone',
        type: 'string',
        required: false
      }
      
      expect(rule.required).toBe(false)
      expect(rule.pattern).toBeUndefined()
      expect(rule.message).toBeUndefined()
    })
  })

  describe('pattern categories', () => {
    it('should have valid pattern categories', () => {
      const categories: PatternCategory[] = [
        'authentication',
        'data',
        'component',
        'api',
        'security'
      ]
      
      categories.forEach(category => {
        expect(typeof category).toBe('string')
        expect(category.length).toBeGreaterThan(0)
      })
    })
  })

  describe('type safety', () => {
    it('should enforce type constraints', () => {
      // Test that TypeScript enforces correct types
      const pattern: Context7Pattern = {
        id: 'test-pattern',
        name: 'Test Pattern',
        category: 'component',
        version: '1.0.0',
        description: 'Test description'
      }
      
      expect(pattern.id).toBe('test-pattern')
      expect(pattern.category).toBe('component')
      expect(typeof pattern.version).toBe('string')
    })
  })
})