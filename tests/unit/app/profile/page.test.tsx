/**
 * Tests pour app/profile/page.tsx
 * TDD pour la page profile utilisateur
 */

import { render, screen, waitFor } from '@testing-library/react'
import ProfilePage from '@/app/profile/page'

// Mock des dépendances
jest.mock('@/lib/auth/server', () => ({
  requireAuth: jest.fn(),
  getServerSession: jest.fn()
}))

jest.mock('@/components/auth/logout-button', () => {
  return function MockLogoutButton({ variant }: { variant?: string }) {
    return <button data-testid="logout-button" data-variant={variant}>Logout</button>
  }
})

jest.mock('next/link', () => {
  return function MockLink({ href, children, className }: { 
    href: string; 
    children: React.ReactNode;
    className?: string;
  }) {
    return <a href={href} className={className} data-testid={`link-${href.replace(/\//g, '-')}`}>{children}</a>
  }
})

describe('ProfilePage (TDD)', () => {
  const mockRequireAuth = require('@/lib/auth/server').requireAuth
  const mockGetServerSession = require('@/lib/auth/server').getServerSession

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render profile page for regular user', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'user@herbisveritas.fr',
      created_at: '2025-01-01T10:00:00.000Z'
    }
    const mockSession = { role: 'user' }

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert
    expect(screen.getByText('Mon Profil')).toBeInTheDocument()
    expect(screen.getByText('✅ Authentifié')).toBeInTheDocument()
    expect(screen.getByText('user@herbisveritas.fr')).toBeInTheDocument()
    expect(screen.getByText('user-123')).toBeInTheDocument()
    expect(screen.getByText('user')).toBeInTheDocument()
    expect(screen.getByTestId('logout-button')).toBeInTheDocument()
  })

  it('should render profile page for admin user with admin links', async () => {
    // Arrange
    const mockUser = {
      id: 'admin-123',
      email: 'admin@herbisveritas.fr',
      created_at: '2025-01-01T10:00:00.000Z'
    }
    const mockSession = { role: 'admin' }

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByTestId('link--admin')).toBeInTheDocument()
    expect(screen.getByText('→ Interface Admin')).toBeInTheDocument()
    // Admin ne doit pas voir les liens dev
    expect(screen.queryByTestId('link--dev')).not.toBeInTheDocument()
  })

  it('should render profile page for dev user with all admin and dev links', async () => {
    // Arrange
    const mockUser = {
      id: 'dev-123',
      email: 'dev@herbisveritas.fr',
      created_at: '2025-01-01T10:00:00.000Z'
    }
    const mockSession = { role: 'dev' }

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert
    expect(screen.getByText('dev')).toBeInTheDocument()
    expect(screen.getByTestId('link--admin')).toBeInTheDocument()
    expect(screen.getByTestId('link--dev')).toBeInTheDocument()
    expect(screen.getByText('→ Interface Admin')).toBeInTheDocument()
    expect(screen.getByText('→ Tools Dev')).toBeInTheDocument()
  })

  it('should show appropriate message for regular user without admin access', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'user@herbisveritas.fr',
      created_at: '2025-01-01T10:00:00.000Z'
    }
    const mockSession = { role: 'user' }

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert
    expect(screen.getByText('Aucun accès administrateur (rôle: user)')).toBeInTheDocument()
    expect(screen.queryByTestId('link--admin')).not.toBeInTheDocument()
    expect(screen.queryByTestId('link--dev')).not.toBeInTheDocument()
  })

  it('should render user data in debug section', async () => {
    // Arrange  
    const mockUser = {
      id: 'user-123',
      email: 'user@herbisveritas.fr',
      created_at: '2025-01-01T10:00:00.000Z',
      app_metadata: { role: 'user' },
      user_metadata: {}
    }
    const mockSession = { role: 'user' }

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert
    expect(screen.getByText('Données Utilisateur Brutes')).toBeInTheDocument()
    expect(screen.getByText('Afficher les données utilisateur (debug)')).toBeInTheDocument()
  })

  it('should render quick action links', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'user@herbisveritas.fr',
      created_at: '2025-01-01T10:00:00.000Z'
    }
    const mockSession = { role: 'user' }

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert
    expect(screen.getByTestId('link--profile-addresses')).toBeInTheDocument()
    expect(screen.getByText('→ Gérer mes adresses')).toBeInTheDocument()
    expect(screen.getByTestId('link--profile-orders')).toBeInTheDocument()
    expect(screen.getByText('→ Mes commandes')).toBeInTheDocument()
    expect(screen.getByTestId('link--boutique')).toBeInTheDocument()
    expect(screen.getByText('→ Boutique')).toBeInTheDocument()
  })

  it('should render development status section', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'user@herbisveritas.fr',
      created_at: '2025-01-01T10:00:00.000Z'
    }
    const mockSession = { role: 'user' }

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert
    expect(screen.getByText('🚧 En développement')).toBeInTheDocument()
    expect(screen.getByText('• Gestion des adresses')).toBeInTheDocument()
    expect(screen.getByText('• Historique des commandes')).toBeInTheDocument()
    expect(screen.getByText('• Préférences utilisateur')).toBeInTheDocument()
    expect(screen.getByText('• Avatar et photo de profil')).toBeInTheDocument()
  })

  it('should format creation date correctly', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'user@herbisveritas.fr',
      created_at: '2025-01-15T14:30:00.000Z'
    }
    const mockSession = { role: 'user' }

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert
    // Date formatée en français (15/01/2025)
    expect(screen.getByText(/15\/01\/2025/)).toBeInTheDocument()
  })

  it('should handle missing session role gracefully', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'user@herbisveritas.fr',
      created_at: '2025-01-01T10:00:00.000Z'
    }
    const mockSession = null // Session manquante

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert  
    // Devrait utiliser 'user' par défaut
    expect(screen.getByText('user')).toBeInTheDocument()
    expect(screen.getByText('Aucun accès administrateur (rôle: user)')).toBeInTheDocument()
  })

  it('should render navigation back to home', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'user@herbisveritas.fr',
      created_at: '2025-01-01T10:00:00.000Z'
    }
    const mockSession = { role: 'user' }

    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetServerSession.mockResolvedValue(mockSession)

    // Act
    const ProfilePageComponent = await ProfilePage()
    render(ProfilePageComponent)

    // Assert
    expect(screen.getByTestId('link-')).toBeInTheDocument() // Lien vers "/"
    expect(screen.getByText('Retour à l\'accueil')).toBeInTheDocument()
  })
})