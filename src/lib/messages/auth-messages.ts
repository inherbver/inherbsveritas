/**
 * Messages utilisateur centralisés - Authentification
 * Système factoriser pour feedback UX cohérent
 * Support i18n intégré pour FR/EN MVP
 */

// Types pour messages structurés
export interface AuthMessage {
  type: 'success' | 'error' | 'info' | 'warning'
  key: string
  defaultMessage: string
  params?: Record<string, string | number>
}

// Configuration messages par contexte
export const AUTH_MESSAGES = {
  // === VALIDATION ===
  validation: {
    emailInvalid: {
      type: 'error' as const,
      key: 'auth.validation.email_invalid',
      defaultMessage: 'Email invalide'
    },
    passwordTooShort: {
      type: 'error' as const,
      key: 'auth.validation.password_too_short',
      defaultMessage: 'Mot de passe trop court (min {minLength} caractères)',
      params: { minLength: 8 }
    },
    passwordMismatch: {
      type: 'error' as const,
      key: 'auth.validation.password_mismatch',
      defaultMessage: 'Les mots de passe ne correspondent pas'
    },
    termsNotAccepted: {
      type: 'error' as const,
      key: 'auth.validation.terms_not_accepted',
      defaultMessage: 'Vous devez accepter les conditions d\'utilisation'
    }
  },

  // === LOGIN ===
  login: {
    success: {
      type: 'success' as const,
      key: 'auth.login.success',
      defaultMessage: 'Connexion réussie'
    },
    invalidCredentials: {
      type: 'error' as const,
      key: 'auth.login.invalid_credentials',
      defaultMessage: 'Email ou mot de passe incorrect'
    },
    networkError: {
      type: 'error' as const,
      key: 'auth.login.network_error',
      defaultMessage: 'Erreur de connexion, réessayez plus tard'
    }
  },

  // === REGISTER ===
  register: {
    success: {
      type: 'success' as const,
      key: 'auth.register.success',
      defaultMessage: 'Compte créé avec succès'
    },
    emailVerificationRequired: {
      type: 'info' as const,
      key: 'auth.register.email_verification_required',
      defaultMessage: 'Vérifiez votre email pour confirmer votre compte'
    },
    emailAlreadyExists: {
      type: 'error' as const,
      key: 'auth.register.email_already_exists',
      defaultMessage: 'Un compte existe déjà avec cet email'
    },
    passwordWeak: {
      type: 'error' as const,
      key: 'auth.register.password_weak',
      defaultMessage: 'Le mot de passe doit respecter les critères de sécurité'
    },
    accountCreationError: {
      type: 'error' as const,
      key: 'auth.register.account_creation_error',
      defaultMessage: 'Erreur lors de la création du compte'
    },
    networkError: {
      type: 'error' as const,
      key: 'auth.register.network_error',
      defaultMessage: 'Erreur de connexion, réessayez plus tard'
    }
  },

  // === LOGOUT ===
  logout: {
    success: {
      type: 'success' as const,
      key: 'auth.logout.success',
      defaultMessage: 'Déconnexion réussie'
    },
    error: {
      type: 'error' as const,
      key: 'auth.logout.error',
      defaultMessage: 'Erreur de déconnexion'
    }
  },

  // === PERMISSIONS & RÔLES ===
  permissions: {
    accessDenied: {
      type: 'error' as const,
      key: 'auth.permissions.access_denied',
      defaultMessage: 'Accès refusé'
    },
    roleRequired: {
      type: 'warning' as const,
      key: 'auth.permissions.role_required',
      defaultMessage: 'Rôle {requiredRole} requis pour accéder à cette page',
      params: { requiredRole: '' }
    },
    loginRequired: {
      type: 'info' as const,
      key: 'auth.permissions.login_required',
      defaultMessage: 'Connexion requise pour accéder à cette page'
    }
  },

  // === RÉCUPÉRATION MOT DE PASSE ===
  resetPassword: {
    emailSent: {
      type: 'success' as const,
      key: 'auth.reset_password.email_sent',
      defaultMessage: 'Email de récupération envoyé'
    },
    success: {
      type: 'success' as const,
      key: 'auth.reset_password.success',
      defaultMessage: 'Mot de passe mis à jour avec succès'
    },
    error: {
      type: 'error' as const,
      key: 'auth.reset_password.error',
      defaultMessage: 'Erreur reset mot de passe'
    }
  },

  // === GÉNÉRIQUE ===
  generic: {
    loading: {
      type: 'info' as const,
      key: 'auth.generic.loading',
      defaultMessage: 'Chargement...'
    },
    unexpectedError: {
      type: 'error' as const,
      key: 'auth.generic.unexpected_error',
      defaultMessage: 'Une erreur inattendue s\'est produite'
    }
  }
} as const

// Helper pour formater les messages avec paramètres
export function formatAuthMessage(
  messageConfig: AuthMessage,
  params?: Record<string, string | number>
): string {
  let message = messageConfig.defaultMessage
  
  // Remplacer les paramètres dans le message
  const allParams = { ...messageConfig.params, ...params }
  
  for (const [key, value] of Object.entries(allParams)) {
    message = message.replace(`{${key}}`, String(value))
  }
  
  return message
}

// Helper pour créer des messages d'erreur Supabase
export function parseSupabaseError(error: any): AuthMessage {
  const errorMessage = error?.message || ''
  
  // Mapping des erreurs Supabase courantes
  if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
    return AUTH_MESSAGES.register.emailAlreadyExists
  }
  
  if (errorMessage.includes('Password should be') || errorMessage.includes('password')) {
    return AUTH_MESSAGES.register.passwordWeak
  }
  
  if (errorMessage.includes('Invalid login credentials')) {
    return AUTH_MESSAGES.login.invalidCredentials
  }
  
  // Erreur générique par défaut
  return AUTH_MESSAGES.generic.unexpectedError
}

// Type helpers pour TypeScript
export type AuthMessageKey = keyof typeof AUTH_MESSAGES
export type AuthMessageCategory = keyof typeof AUTH_MESSAGES[AuthMessageKey]