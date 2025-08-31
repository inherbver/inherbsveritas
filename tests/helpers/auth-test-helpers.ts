/**
 * Helpers pour tests auth avec messages centralisés
 * Simplifie l'écriture des tests avec le nouveau système de messages
 */

import type { AuthMessage } from '@/lib/messages/auth-messages'
import { formatAuthMessage } from '@/lib/messages/auth-messages'

// Helper pour extraire le message d'erreur formaté depuis un résultat
export function extractErrorMessage(result: { success: boolean; message?: AuthMessage }): string {
  if (!result.message) return ''
  return formatAuthMessage(result.message)
}

// Helper pour extraire le message de succès formaté depuis un résultat  
export function extractSuccessMessage(result: { success: boolean; message?: AuthMessage }): string {
  if (!result.message) return ''
  return formatAuthMessage(result.message)
}

// Helper pour vérifier qu'un résultat contient le bon message d'erreur
export function expectErrorMessage(
  result: { success: boolean; message?: AuthMessage },
  expectedMessage: string
) {
  expect(result.success).toBe(false)
  expect(extractErrorMessage(result)).toBe(expectedMessage)
}

// Helper pour vérifier qu'un résultat contient le bon message de succès
export function expectSuccessMessage(
  result: { success: boolean; message?: AuthMessage },
  expectedMessage: string
) {
  expect(result.success).toBe(true)
  expect(extractSuccessMessage(result)).toBe(expectedMessage)
}

// Helper pour vérifier le type de message
export function expectMessageType(
  result: { message?: AuthMessage },
  expectedType: 'success' | 'error' | 'info' | 'warning'
) {
  expect(result.message?.type).toBe(expectedType)
}

// Constants pour tests - Messages attendus
export const EXPECTED_MESSAGES = {
  validation: {
    emailInvalid: 'Email invalide',
    passwordTooShort: 'Mot de passe trop court (min 8 caractères)',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    termsNotAccepted: 'Vous devez accepter les conditions d\'utilisation'
  },
  login: {
    success: 'Connexion réussie',
    invalidCredentials: 'Email ou mot de passe incorrect',
    networkError: 'Erreur de connexion, réessayez plus tard'
  },
  register: {
    success: 'Compte créé avec succès',
    emailVerificationRequired: 'Vérifiez votre email pour confirmer votre compte',
    emailAlreadyExists: 'Un compte existe déjà avec cet email',
    passwordWeak: 'Le mot de passe doit respecter les critères de sécurité',
    accountCreationError: 'Erreur lors de la création du compte',
    networkError: 'Erreur de connexion, réessayez plus tard'
  },
  logout: {
    success: 'Déconnexion réussie',
    error: 'Erreur de déconnexion'
  }
} as const