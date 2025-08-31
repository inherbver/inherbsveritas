/**
 * Auth Actions Hook
 * 
 * Authentication actions (login, logout, register)
 */

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthResult {
  success: boolean
  error?: string
}

/**
 * Hook actions authentification  
 */
export function useAuthActions() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const signIn = async (email: string, password: string, redirectTo?: string): Promise<AuthResult> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      // Redirection gérée par middleware
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.push('/profile')
      }

      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de connexion'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>): Promise<AuthResult> => {
    try {
      setLoading(true)
      setError(null)

      const signUpParams: any = {
        email,
        password
      }
      
      if (metadata) {
        signUpParams.options = {
          data: metadata
        }
      }

      const { data, error } = await supabase.auth.signUp(signUpParams)

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      // Si confirmation requise
      if (data?.user && !data?.session) {
        return { 
          success: true, 
          error: 'Vérifiez votre email pour confirmer votre compte' 
        }
      }

      // Connexion immédiate
      router.push('/profile')
      return { success: true }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur d\'inscription'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (redirectTo = '/'): Promise<AuthResult> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      router.push(redirectTo)
      return { success: true }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de déconnexion'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de réinitialisation'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading,
    error,
    clearError: () => setError(null)
  }
}