/**
 * Actions d'authentification - REFACTOR avec messages centralisés
 * Code optimisé avec système de rôles corrigé et messages factoriser
 */

import { createClient } from '@/lib/supabase/client'
import { validateEmail } from '@/utils/validateEmail'
import { AUTH_MESSAGES, parseSupabaseError, type AuthMessage } from '@/lib/messages/auth-messages'
import { USER_ROLES, type UserRole, getRoleRedirect, normalizeRole } from '@/lib/auth/roles'

// Types pour les actions auth avec messages structurés
export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  success: boolean
  user?: AuthUser
  message?: AuthMessage
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
  message?: AuthMessage
  requiresConfirmation?: boolean
}

// Types utilisateur avec rôles corrects
export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

// Constantes métier
const MIN_PASSWORD_LENGTH = 8

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
    // Validation entrées avec messages centralisés
    if (!validateEmail(credentials.email)) {
      return {
        success: false,
        message: AUTH_MESSAGES.validation.emailInvalid
      }
    }

    if (credentials.password.length < MIN_PASSWORD_LENGTH) {
      return {
        success: false,
        message: {
          ...AUTH_MESSAGES.validation.passwordTooShort,
          params: { minLength: MIN_PASSWORD_LENGTH }
        }
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
        message: AUTH_MESSAGES.login.invalidCredentials
      }
    }

    // Création utilisateur et redirection
    const user = createAuthUser(data.user, credentials.email)
    const redirectTo = getRoleRedirect(user.role)

    return {
      success: true,
      user,
      message: AUTH_MESSAGES.login.success,
      redirectTo
    }
  } catch (error) {
    // Gestion erreurs réseau avec messages centralisés
    return {
      success: false,
      message: AUTH_MESSAGES.login.networkError
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
        message: AUTH_MESSAGES.validation.emailInvalid
      }
    }

    // Validation password longueur
    if (credentials.password.length < MIN_PASSWORD_LENGTH) {
      return {
        success: false,
        message: {
          ...AUTH_MESSAGES.validation.passwordTooShort,
          params: { minLength: MIN_PASSWORD_LENGTH }
        }
      }
    }

    // Validation confirmation password
    if (credentials.password !== credentials.confirmPassword) {
      return {
        success: false,
        message: AUTH_MESSAGES.validation.passwordMismatch
      }
    }

    // Validation acceptation conditions
    if (!credentials.acceptTerms) {
      return {
        success: false,
        message: AUTH_MESSAGES.validation.termsNotAccepted
      }
    }

    const supabase = createClient()
    
    // Tentative de création de compte
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: credentials.password // Pas de trim sur password (espaces peuvent être intentionnels)
    })

    if (error) {
      // Gestion erreurs spécifiques avec parsing centralisé
      const parsedError = parseSupabaseError(error)
      return {
        success: false,
        message: parsedError
      }
    }

    if (!data.user) {
      return {
        success: false,
        message: AUTH_MESSAGES.register.accountCreationError
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
        ? AUTH_MESSAGES.register.emailVerificationRequired
        : AUTH_MESSAGES.register.success
    }
  } catch (error) {
    // Gestion erreurs réseau avec messages centralisés
    return {
      success: false,
      message: AUTH_MESSAGES.register.networkError
    }
  }
}