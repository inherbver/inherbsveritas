/**
 * Tests RoleGate Component - Priority 2 Important
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { 
  RoleGate, 
  AdminOnly, 
  DevOnly, 
  UserOrHigher, 
  AdminOrDev 
} from '@/components/auth/role-gate'
import { useAuthState } from '@/components/auth/auth-guard'

// Mock useAuthState hook
jest.mock('@/components/auth/auth-guard', () => ({
  useAuthState: jest.fn()
}))

// Mock permissions module
jest.mock('@/lib/auth/permissions', () => ({
  canAccess: jest.fn()
}))

const mockUseAuthState = useAuthState as jest.MockedFunction<typeof useAuthState>
const mockCanAccess = require('@/lib/auth/permissions').canAccess

describe('RoleGate Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('États de chargement et authentification', () => {
    it('devrait afficher fallback pendant le chargement', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: true,
        isAuthenticated: false,
        userRole: 'user'
      })

      render(
        <RoleGate fallback={<div>Loading...</div>}>
          <div>Protected Content</div>
        </RoleGate>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('devrait afficher fallback si non authentifié', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: false,
        userRole: 'user'
      })

      render(
        <RoleGate fallback={<div>Please login</div>}>
          <div>Protected Content</div>
        </RoleGate>
      )

      expect(screen.getByText('Please login')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('devrait afficher null si pas de fallback et non authentifié', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: false,
        userRole: 'user'
      })

      const { container } = render(
        <RoleGate>
          <div>Protected Content</div>
        </RoleGate>
      )

      expect(container.firstChild).toBeNull()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('Vérification par rôles autorisés (allowedRoles)', () => {
    it('devrait afficher contenu si rôle utilisateur dans allowedRoles', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'admin'
      })

      render(
        <RoleGate allowedRoles={['admin', 'dev']}>
          <div>Admin Content</div>
        </RoleGate>
      )

      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })

    it('devrait afficher fallback si rôle utilisateur pas dans allowedRoles', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'user'
      })

      render(
        <RoleGate allowedRoles={['admin', 'dev']} fallback={<div>Access Denied</div>}>
          <div>Admin Content</div>
        </RoleGate>
      )

      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })

    it('devrait tester tous les rôles dans allowedRoles', () => {
      const roles = ['user', 'admin', 'dev'] as const
      
      roles.forEach(role => {
        mockUseAuthState.mockReturnValue({
          isLoading: false,
          isAuthenticated: true,
          userRole: role
        })

        const { rerender } = render(
          <RoleGate allowedRoles={['user', 'admin', 'dev']}>
            <div>Content for {role}</div>
          </RoleGate>
        )

        expect(screen.getByText(`Content for ${role}`)).toBeInTheDocument()
        
        rerender(<div></div>) // Clean between renders
      })
    })
  })

  describe('Vérification par rôle requis (requiredRole)', () => {
    it('devrait utiliser canAccess pour requiredRole', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'user'
      })

      mockCanAccess.mockReturnValue(true)

      render(
        <RoleGate requiredRole="admin">
          <div>Admin Required Content</div>
        </RoleGate>
      )

      expect(mockCanAccess).toHaveBeenCalledWith('user', 'admin')
      expect(screen.getByText('Admin Required Content')).toBeInTheDocument()
    })

    it('devrait afficher fallback si canAccess retourne false', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'user'
      })

      mockCanAccess.mockReturnValue(false)

      render(
        <RoleGate requiredRole="admin" fallback={<div>Insufficient permissions</div>}>
          <div>Admin Required Content</div>
        </RoleGate>
      )

      expect(mockCanAccess).toHaveBeenCalledWith('user', 'admin')
      expect(screen.getByText('Insufficient permissions')).toBeInTheDocument()
      expect(screen.queryByText('Admin Required Content')).not.toBeInTheDocument()
    })
  })

  describe('Logique inverse', () => {
    it('devrait afficher contenu si inverse=true et user n\'a PAS accès', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'user'
      })

      render(
        <RoleGate allowedRoles={['admin']} inverse={true}>
          <div>Non-admin content</div>
        </RoleGate>
      )

      expect(screen.getByText('Non-admin content')).toBeInTheDocument()
    })

    it('devrait afficher fallback si inverse=true et user a accès', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'admin'
      })

      render(
        <RoleGate allowedRoles={['admin']} inverse={true} fallback={<div>Admin detected</div>}>
          <div>Non-admin content</div>
        </RoleGate>
      )

      expect(screen.getByText('Admin detected')).toBeInTheDocument()
      expect(screen.queryByText('Non-admin content')).not.toBeInTheDocument()
    })
  })

  describe('Cas par défaut (ni requiredRole ni allowedRoles)', () => {
    it('devrait toujours afficher contenu si authentifié et aucune restriction', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'user'
      })

      render(
        <RoleGate>
          <div>Always visible when auth</div>
        </RoleGate>
      )

      expect(screen.getByText('Always visible when auth')).toBeInTheDocument()
    })
  })
})

describe('Composants spécialisés RoleGate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AdminOnly', () => {
    it('devrait afficher contenu pour admin', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'admin'
      })
      mockCanAccess.mockReturnValue(true)

      render(
        <AdminOnly>
          <div>Admin Panel</div>
        </AdminOnly>
      )

      expect(screen.getByText('Admin Panel')).toBeInTheDocument()
      expect(mockCanAccess).toHaveBeenCalledWith('admin', 'admin')
    })

    it('devrait afficher fallback pour user', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'user'
      })
      mockCanAccess.mockReturnValue(false)

      render(
        <AdminOnly fallback={<div>Admin required</div>}>
          <div>Admin Panel</div>
        </AdminOnly>
      )

      expect(screen.getByText('Admin required')).toBeInTheDocument()
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
    })
  })

  describe('DevOnly', () => {
    it('devrait afficher contenu pour dev', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'dev'
      })
      mockCanAccess.mockReturnValue(true)

      render(
        <DevOnly>
          <div>Dev Tools</div>
        </DevOnly>
      )

      expect(screen.getByText('Dev Tools')).toBeInTheDocument()
      expect(mockCanAccess).toHaveBeenCalledWith('dev', 'dev')
    })
  })

  describe('UserOrHigher', () => {
    it.each(['user', 'admin', 'dev'])('devrait afficher contenu pour rôle: %s', (role) => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: role as any
      })

      render(
        <UserOrHigher>
          <div>User Content</div>
        </UserOrHigher>
      )

      expect(screen.getByText('User Content')).toBeInTheDocument()
    })
  })

  describe('AdminOrDev', () => {
    it.each(['admin', 'dev'])('devrait afficher contenu pour rôle: %s', (role) => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: role as any
      })

      render(
        <AdminOrDev>
          <div>Admin or Dev Content</div>
        </AdminOrDev>
      )

      expect(screen.getByText('Admin or Dev Content')).toBeInTheDocument()
    })

    it('devrait afficher fallback pour user', () => {
      mockUseAuthState.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        userRole: 'user'
      })

      render(
        <AdminOrDev fallback={<div>Admin or Dev required</div>}>
          <div>Admin or Dev Content</div>
        </AdminOrDev>
      )

      expect(screen.getByText('Admin or Dev required')).toBeInTheDocument()
      expect(screen.queryByText('Admin or Dev Content')).not.toBeInTheDocument()
    })
  })
})

describe('Cas d\'usage business HerbisVeritas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('devrait afficher bouton "Gérer produits" seulement pour admin/dev', () => {
    mockUseAuthState.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userRole: 'admin'
    })

    render(
      <AdminOrDev>
        <button>Gérer produits</button>
      </AdminOrDev>
    )

    expect(screen.getByText('Gérer produits')).toBeInTheDocument()
  })

  it('devrait cacher prix de gros pour utilisateurs normaux', () => {
    mockUseAuthState.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userRole: 'user'
    })

    render(
      <div>
        <div>Prix public: 25€</div>
        <AdminOrDev>
          <div>Prix de gros: 15€</div>
        </AdminOrDev>
      </div>
    )

    expect(screen.getByText('Prix public: 25€')).toBeInTheDocument()
    expect(screen.queryByText('Prix de gros: 15€')).not.toBeInTheDocument()
  })

  it('devrait afficher outils debug seulement en mode dev', () => {
    mockUseAuthState.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userRole: 'dev'
    })
    mockCanAccess.mockReturnValue(true)

    render(
      <DevOnly>
        <div>Debug: User sessions</div>
      </DevOnly>
    )

    expect(screen.getByText('Debug: User sessions')).toBeInTheDocument()
  })
})