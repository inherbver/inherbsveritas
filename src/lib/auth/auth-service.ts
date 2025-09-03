/**
 * Service d'authentification HerbisVeritas
 * Implémentation TDD Red → Green selon CLAUDE.md
 */

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { z } from 'zod'

// Validation Zod pour inputs
const signInSchema = z.object({
  email: z.string().email('Format email invalide').toLowerCase().trim(),
  password: z.string().min(1, 'Mot de passe requis')
})

const signUpSchema = z.object({
  email: z.string().email('Format email invalide').toLowerCase().trim(), 
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Doit contenir au moins : 1 minuscule, 1 majuscule, 1 chiffre'),
  firstName: z.string().min(1, 'Prénom requis').trim(),
  lastName: z.string().min(1, 'Nom requis').trim()
})

// Types de permissions HerbisVeritas
type Permission = 
  | 'view:products' | 'edit:products'
  | 'view:orders' | 'edit:orders' 
  | 'view:users' | 'edit:users'
  | 'view:content' | 'edit:content'
  | 'debug:system'

type Role = 'user' | 'admin' | 'dev'

// Matrice des permissions par rôle
const rolePermissions: Record<Role, Permission[]> = {
  user: [
    'view:products'
  ],
  admin: [
    'view:products', 'edit:products',
    'view:orders', 'edit:orders',
    'view:users', 'edit:users', 
    'view:content', 'edit:content'
  ],
  dev: [
    'view:products', 'edit:products',
    'view:orders', 'edit:orders',
    'view:users', 'edit:users',
    'view:content', 'edit:content',
    'debug:system'
  ]
}

// Rate limiting simple (mémoire)
const rateLimitStore = new Map<string, { count: number, resetAt: number }>()
const RATE_LIMIT_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

// Types de retour
interface AuthResult {
  success: boolean
  user?: User | null
  error?: string | null
  requiresConfirmation?: boolean
}

class AuthService {
  private supabase = createClient()

  /**
   * Authentification utilisateur
   */
  async signIn({ email, password }: { email: string; password: string }): Promise<AuthResult> {
    try {
      // Validation input
      const validated = signInSchema.parse({ email, password })
      
      // Rate limiting
      if (this.isRateLimited(validated.email)) {
        return {
          success: false,
          user: null,
          error: 'Trop de tentatives. Réessayez dans 15 minutes.'
        }
      }

      // Appel Supabase
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password
      })

      if (error) {
        this.recordFailedAttempt(validated.email)
        return {
          success: false,
          user: null,
          error: error.message
        }
      }

      // Succès - reset rate limit
      this.clearFailedAttempts(validated.email)

      return {
        success: true,
        user: data.user,
        error: null
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          user: null,
          error: error.errors[0]?.message || 'Erreur de validation'
        }
      }

      return {
        success: false,
        user: null,
        error: 'Erreur de connexion'
      }
    }
  }

  /**
   * Création de compte utilisateur
   */
  async signUp({ 
    email, 
    password, 
    firstName, 
    lastName 
  }: {
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<AuthResult> {
    try {
      // Validation input
      const validated = signUpSchema.parse({ email, password, firstName, lastName })

      // Appel Supabase avec métadonnées
      const { data, error } = await this.supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            first_name: validated.firstName,
            last_name: validated.lastName,
            role: 'user' // Rôle par défaut
          }
        }
      })

      if (error) {
        return {
          success: false,
          user: null,
          error: error.message
        }
      }

      return {
        success: true,
        user: data.user,
        error: null,
        requiresConfirmation: !data.session // Pas de session = confirmation email
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          user: null,
          error: error.errors[0]?.message || 'Erreur de validation'
        }
      }

      return {
        success: false,
        user: null,
        error: 'Erreur de création de compte'
      }
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de déconnexion'
      }
    }
  }

  /**
   * Récupère le rôle d'un utilisateur
   */
  async getUserRole(user: User): Promise<Role> {
    // Rôle depuis user_metadata (défini lors de l'inscription)
    const role = user.user_metadata?.['role'] as Role
    return role || 'user' // Défaut user
  }

  /**
   * Vérifie si utilisateur a une permission
   */
  async hasPermission(user: User, permission: Permission): Promise<boolean> {
    const role = await this.getUserRole(user)
    return rolePermissions[role].includes(permission)
  }

  /**
   * Requiert un rôle spécifique (throw si insuffisant)
   */
  async requireRole(user: User, requiredRole: Role): Promise<void> {
    const userRole = await this.getUserRole(user)
    
    // Hiérarchie: dev > admin > user
    const roleHierarchy: Record<Role, number> = {
      'user': 1,
      'admin': 2, 
      'dev': 3
    }

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      throw new Error(`Access denied: ${requiredRole} role required`)
    }
  }

  /**
   * Récupère l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser()
      
      if (error) return null
      
      return data.user
    } catch {
      return null
    }
  }

  /**
   * Vérifie si utilisateur est authentifié
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.getSession()
      
      if (error) return false
      
      return !!data.session
    } catch {
      return false
    }
  }

  /**
   * Rate limiting - vérifie si IP/email est limitée
   */
  private isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    if (!record) return false

    // Reset si fenêtre expirée
    if (now > record.resetAt) {
      rateLimitStore.delete(identifier)
      return false
    }

    return record.count >= RATE_LIMIT_ATTEMPTS
  }

  /**
   * Enregistre une tentative échouée
   */
  private recordFailedAttempt(identifier: string): void {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    if (!record || now > record.resetAt) {
      // Nouveau record ou reset
      rateLimitStore.set(identifier, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW
      })
    } else {
      // Incrémente le compteur
      record.count++
    }
  }

  /**
   * Supprime les tentatives échouées (succès de connexion)
   */
  private clearFailedAttempts(identifier: string): void {
    rateLimitStore.delete(identifier)
  }
}

// Instance singleton
export const authService = new AuthService()
export type { AuthResult, Permission, Role }