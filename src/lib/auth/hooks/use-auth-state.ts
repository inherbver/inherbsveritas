/**
 * Auth State Hook
 * 
 * Main authentication state management hook
 */

"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type UserRole } from '@/lib/auth/types'
import { type User } from '@supabase/supabase-js'
import { getUserRole } from '../roles'

export interface AuthState {
  user: User | null
  role: UserRole | null
  loading: boolean
  error: string | null
}

/**
 * Hook principal authentification
 * Synchronisé avec middleware SSR
 */
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const supabase = createClient()

    // État initial
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        const role = getUserRole(user)
        setState({
          user,
          role,
          loading: false,
          error: null
        })
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          error: err instanceof Error ? err.message : 'Auth error',
          loading: false 
        }))
      }
    }

    // Listener auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const role = getUserRole(session.user)
          setState({
            user: session.user,
            role,
            loading: false,
            error: null
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            role: null,
            loading: false,
            error: null
          })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const role = getUserRole(session.user)
          setState(prev => ({
            ...prev,
            user: session.user,
            role,
            error: null
          }))
        }
      }
    )

    getInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return state
}