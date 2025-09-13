/**
 * Tests unitaires pour types/context7-patterns
 * Tests patterns et types Context7
 */

import type {
  Context7Pattern,
  AuthPattern,
  DataPattern,
  UIPattern,
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
        description: 'Authentication pattern for login',
        category: 'auth',
        implementation: 'middleware with validation',
        examples: ['email/password login', 'oauth2 flow'],
        permissions: ['read', 'write'],
        roles: ['user', 'admin']
      }
      
      expect(authPattern.id).toBe('auth-login')
      expect(authPattern.category).toBe('auth')
      expect(authPattern.permissions).toContain('read')
      expect(authPattern.roles).toContain('user')
    })

    it('should validate DataPattern structure', () => {
      const dataPattern: DataPattern = {
        id: 'data-products',
        name: 'Products Data Pattern',
        description: 'Data pattern for products',
        category: 'data',
        implementation: 'PostgreSQL with Supabase',
        examples: ['SELECT queries', 'INSERT operations'],
        schema: {
          table: 'products',
          columns: ['id', 'name', 'price'],
          relationships: ['categories', 'labels']
        },
        validations: [
          {
            field: 'name',
            type: 'string',
            required: true
          },
          {
            field: 'price',
            type: 'number',
            required: true
          }
        ]
      }
      
      expect(dataPattern.schema['table']).toBe('products')
      expect(dataPattern.validations[0]?.field).toBe('name')
      expect(dataPattern.validations[0]?.required).toBe(true)
    })

    it('should validate UIPattern structure', () => {
      const uiPattern: UIPattern = {
        id: 'ui-button',
        name: 'Button Component Pattern',
        description: 'Reusable button component',
        category: 'ui',
        implementation: 'React with TypeScript',
        examples: ['<Button variant="primary" />', '<Button size="large" />'],
        components: ['Button', 'IconButton', 'LinkButton'],
        styling: {
          framework: 'tailwind',
          responsive: true,
          variants: ['primary', 'secondary', 'destructive']
        }
      }
      
      expect(uiPattern.components).toContain('Button')
      expect(uiPattern.styling['framework']).toBe('tailwind')
      expect(uiPattern.category).toBe('ui')
    })
  })

  describe('pattern configuration', () => {
    it('should validate PatternConfig structure', () => {
      const config: PatternConfig = {
        enabled: true,
        priority: 1,
        settings: {
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
      }
      
      expect(config.enabled).toBe(true)
      expect(config.priority).toBe(1)
      expect(config.settings['environment']).toBe('development')
    })
  })

  describe('validation rules', () => {
    it('should validate ValidationRule structure', () => {
      const rule: ValidationRule = {
        field: 'email',
        type: 'string',
        required: true,
        constraints: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Email invalide'
        }
      }
      
      expect(rule.field).toBe('email')
      expect(rule.required).toBe(true)
      expect(rule.constraints?.['pattern']).toBeInstanceOf(RegExp)
      expect(rule.constraints?.['message']).toContain('Email')
    })

    it('should handle optional validation rules', () => {
      const rule: ValidationRule = {
        field: 'phone',
        type: 'string',
        required: false
      }
      
      expect(rule.required).toBe(false)
      expect(rule.constraints?.['pattern']).toBeUndefined()
      expect(rule.constraints?.['message']).toBeUndefined()
    })
  })

  describe('pattern categories', () => {
    it('should have valid pattern categories', () => {
      const categories: PatternCategory[] = [
        'auth',
        'data',
        'ui',
        'security',
        'performance'
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
        description: 'Test description',
        category: 'ui',
        implementation: 'React component',
        examples: ['<TestComponent />']
      }
      
      expect(pattern.id).toBe('test-pattern')
      expect(pattern.category).toBe('ui')
      expect(pattern.description).toBe('Test description')
    })
  })
})