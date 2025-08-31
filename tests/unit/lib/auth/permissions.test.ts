/**
 * Tests unitaires pour lib/auth/permissions
 * Tests système de permissions RBAC
 */

import { 
  hasPermission,
  canAccessAdminPanel,
  canModifyProduct,
  canViewOrderDetails,
  getPermissionsForRole,
  validateResourceAccess
} from '@/lib/auth/permissions'

describe('lib/auth/permissions', () => {
  describe('role-based permissions', () => {
    it('should grant admin full permissions', () => {
      expect(hasPermission('admin', 'products:create')).toBe(true)
      expect(hasPermission('admin', 'orders:read')).toBe(true)
      expect(hasPermission('admin', 'users:delete')).toBe(true)
      expect(canAccessAdminPanel('admin')).toBe(true)
    })

    it('should grant user basic permissions only', () => {
      expect(hasPermission('user', 'profile:read')).toBe(true)
      expect(hasPermission('user', 'orders:read_own')).toBe(true)
      expect(hasPermission('user', 'products:create')).toBe(false)
      expect(canAccessAdminPanel('user')).toBe(false)
    })

    it('should grant dev permissions for development', () => {
      expect(hasPermission('dev', 'debug:access')).toBe(true)
      expect(hasPermission('dev', 'logs:read')).toBe(true)
      expect(hasPermission('dev', 'products:create')).toBe(true)
      expect(canAccessAdminPanel('dev')).toBe(true)
    })
  })

  describe('resource-specific permissions', () => {
    it('should validate product modification rights', () => {
      expect(canModifyProduct('admin')).toBe(true)
      expect(canModifyProduct('dev')).toBe(true)
      expect(canModifyProduct('user')).toBe(false)
    })

    it('should validate order access rights', () => {
      const userOrder = { user_id: 'user-123' }
      const adminOrder = { user_id: 'admin-456' }

      expect(canViewOrderDetails('user', 'user-123', userOrder)).toBe(true)
      expect(canViewOrderDetails('user', 'user-123', adminOrder)).toBe(false)
      expect(canViewOrderDetails('admin', 'admin-456', userOrder)).toBe(true)
    })
  })

  describe('permission aggregation', () => {
    it('should return complete permission set for admin', () => {
      const permissions = getPermissionsForRole('admin')
      
      expect(permissions).toContain('products:create')
      expect(permissions).toContain('products:read')
      expect(permissions).toContain('products:update')
      expect(permissions).toContain('products:delete')
      expect(permissions).toContain('orders:read')
      expect(permissions).toContain('users:read')
    })

    it('should return limited permissions for user', () => {
      const permissions = getPermissionsForRole('user')
      
      expect(permissions).toContain('profile:read')
      expect(permissions).toContain('profile:update')
      expect(permissions).toContain('orders:read_own')
      expect(permissions).not.toContain('products:create')
      expect(permissions).not.toContain('users:read')
    })
  })

  describe('resource access validation', () => {
    it('should validate user access to own resources', () => {
      const result = validateResourceAccess('user', 'user-123', {
        type: 'order',
        owner_id: 'user-123'
      })
      
      expect(result.allowed).toBe(true)
    })

    it('should deny user access to other resources', () => {
      const result = validateResourceAccess('user', 'user-123', {
        type: 'order',
        owner_id: 'user-456'
      })
      
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Insufficient permissions')
    })

    it('should allow admin access to all resources', () => {
      const result = validateResourceAccess('admin', 'orders', 'admin')
      
      expect(result).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle invalid roles gracefully', () => {
      expect(hasPermission('invalid_role' as any, 'products:read')).toBe(false)
      expect(canAccessAdminPanel('invalid_role' as any)).toBe(false)
    })

    it('should handle missing permissions', () => {
      expect(hasPermission('user', 'nonexistent:permission')).toBe(false)
    })

    it('should handle null/undefined resources', () => {
      const result = validateResourceAccess('user', 'admin', 'write')
      expect(result).toBe(false)
    })
  })
})