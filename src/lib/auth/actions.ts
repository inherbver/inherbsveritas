/**
 * Actions d'authentification - REFACTOR avec messages centralisés
 * Code optimisé avec système de rôles corrigé et messages factoriser
 */

import { createClient } from '@/lib/supabase/client'
import { validateEmail } from '@/utils/validateEmail'
import { AUTH_MESSAGES, type AuthMessage } from '@/lib/messages/auth-messages'
import { USER_ROLES, type UserRole, getRoleRedirect, normalizeRole } from '@/lib/auth/roles'

// Types pour les actions auth avec messages structurés
export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  success: boolean
  user?: AuthUser
  message?: string
  error?: string
  redirectTo?: string
}

export interface LogoutResult {
  success: boolean
  message?: AuthMessage
  redirectTo?: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
  acceptTerms?: boolean
}

export interface RegisterResult {
  success: boolean
  user?: AuthUser
  message?: string
  error?: string  
  requiresConfirmation?: boolean
}

// Types utilisateur avec rôles corrects
export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

// Constantes métier
const MIN_PASSWORD_LENGTH_REGISTER = 8

// Helpers internes avec rôles corrigés
function createAuthUser(supabaseUser: any, email: string): AuthUser {
  const role = normalizeRole(supabaseUser.app_metadata?.role)
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || email,
    role
  }
}

// Login user avec messages centralisés
export async function loginUser(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    // Validation entrées
    if (!validateEmail(credentials.email)) {
      return {
        success: false,
        error: 'Email invalide'
      }
    }

    if (credentials.password.length < MIN_PASSWORD_LENGTH_REGISTER) {
      return {
        success: false,
        error: `Mot de passe trop court (min ${MIN_PASSWORD_LENGTH_REGISTER} caractères)`
      }
    }

    const supabase = createClient()
    
    // Tentative de connexion
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error || !data.user) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect'
      }
    }

    // Création utilisateur et redirection
    const user = createAuthUser(data.user, credentials.email)
    const redirectTo = getRoleRedirect(user.role)

    return {
      success: true,
      user,
      redirectTo
    }
  } catch (error) {
    // Gestion erreurs réseau
    return {
      success: false,
      error: 'Erreur de connexion, réessayez plus tard'
    }
  }
}

// Logout user avec messages centralisés
export async function logoutUser(): Promise<LogoutResult> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return {
        success: false,
        message: AUTH_MESSAGES.logout.error
      }
    }

    return {
      success: true,
      message: AUTH_MESSAGES.logout.success,
      redirectTo: getRoleRedirect(USER_ROLES.GUEST)
    }
  } catch (error) {
    return {
      success: false,
      message: AUTH_MESSAGES.logout.error
    }
  }
}

// Récupérer utilisateur actuel
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.getUser()
    
    if (error || !data.user) {
      return null
    }

    return createAuthUser(data.user, data.user.email || '')
  } catch (error) {
    return null
  }
}

// Register user avec messages centralisés
export async function registerUser(credentials: RegisterCredentials): Promise<RegisterResult> {
  try {
    // Validation email (trimmer et normaliser)
    const normalizedEmail = credentials.email.trim().toLowerCase()
    if (!validateEmail(normalizedEmail)) {
      return {
        success: false,
        error: 'Email invalide'
      }
    }

    // Validation password longueur
    if (credentials.password.length < MIN_PASSWORD_LENGTH_REGISTER) {
      return {
        success: false,
        error: `Mot de passe trop court (min ${MIN_PASSWORD_LENGTH_REGISTER} caractères)`
      }
    }

    // Validation confirmation password
    if (credentials.password !== credentials.confirmPassword) {
      return {
        success: false,
        error: 'Les mots de passe ne correspondent pas'
      }
    }

    // Validation acceptation conditions
    if (credentials.acceptTerms === false || credentials.acceptTerms === undefined) {
      return {
        success: false,
        error: 'Vous devez accepter les conditions d\'utilisation'
      }
    }

    const supabase = createClient()
    
    // Tentative de création de compte
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: credentials.password // Pas de trim sur password (espaces peuvent être intentionnels)
    })

    if (error) {
      // Gestion erreurs spécifiques avec traduction
      let errorMessage = error.message || 'Erreur de création du compte'
      
      // Traduction des erreurs Supabase courantes
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'Un compte existe déjà avec cet email'
      } else if (errorMessage.includes('Password should be at least') || errorMessage.includes('Password too weak')) {
        errorMessage = 'Le mot de passe doit respecter les critères de sécurité'
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Impossible de créer le compte'
      }
    }

    // Création utilisateur avec rôles corrigés
    const user = createAuthUser(data.user, normalizedEmail)
    
    // Vérifier si confirmation email requise
    const requiresConfirmation = !data.user.email_confirmed_at && !data.session
    
    return {
      success: true,
      user,
      requiresConfirmation,
      message: requiresConfirmation 
        ? 'Vérifiez votre email pour confirmer votre compte'
        : 'Compte créé avec succès'
    }
  } catch (error) {
    // Gestion erreurs réseau 
    return {
      success: false,
      error: 'Erreur de connexion, réessayez plus tard'
    }
  }
}