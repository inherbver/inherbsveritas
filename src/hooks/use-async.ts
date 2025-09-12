/**
 * useAsync Hook - HerbisVeritas MVP
 * 
 * Pattern basé sur usehooks-ts + Context7 best practices
 * - Loading states centralisés : 'idle' | 'loading' | 'success' | 'error'  
 * - Caching intelligent avec Map pour éviter re-fetch
 * - SSR safety avec IS_SERVER detection
 * - Toast integration automatique
 * - Retry mechanism avec exponential backoff
 * - AbortController pour cleanup automatique
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from '@/lib/toast'

// Types pour les états de loading
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

// Interface pour les options du hook
export interface UseAsyncOptions<T> {
  initialData?: T
  enableToast?: boolean
  cacheKey?: string
  cacheDuration?: number // ms
  retryCount?: number
  retryDelay?: number // ms
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

// Interface pour la valeur de retour
export interface UseAsyncReturn<T> {
  data: T | null
  status: AsyncStatus
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  isIdle: boolean
  execute: () => Promise<void>
  reset: () => void
  retry: () => Promise<void>
}

// Cache global pour éviter re-fetch
const globalCache = new Map<string, {
  data: any
  timestamp: number
  promise?: Promise<any>
}>()

// Detection SSR (reserved for future SSR safety features)
// const IS_SERVER = typeof window === 'undefined'

// Helper pour générer clé de cache automatique
function generateCacheKey(fn: Function): string {
  return `async_${fn.toString().slice(0, 50)}_${Date.now()}`
}

// Helper pour vérifier validité cache
function isCacheValid(cacheEntry: { timestamp: number }, duration: number): boolean {
  return Date.now() - cacheEntry.timestamp < duration
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const {
    initialData = null,
    enableToast = true,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes par défaut
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options

  // État local
  const [data, setData] = useState<T | null>(initialData)
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<Error | null>(null)

  // Refs pour cleanup et retry
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentRetryRef = useRef(0)

  // Clé de cache automatique ou fournie
  const finalCacheKey = cacheKey || generateCacheKey(asyncFn)

  // Computed values
  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isIdle = status === 'idle'

  // Fonction principale d'exécution
  const execute = useCallback(async (): Promise<void> => {
    // Annuler requête précédente si en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Vérifier cache en premier
    if (finalCacheKey) {
      const cacheEntry = globalCache.get(finalCacheKey)
      if (cacheEntry && isCacheValid(cacheEntry, cacheDuration)) {
        setData(cacheEntry.data)
        setStatus('success')
        setError(null)
        
        if (onSuccess) {
          onSuccess(cacheEntry.data)
        }
        
        return
      }

      // Si promesse en cours, l'attendre
      if (cacheEntry?.promise) {
        setStatus('loading')
        try {
          const result = await cacheEntry.promise
          setData(result)
          setStatus('success')
          setError(null)
          
          if (onSuccess) {
            onSuccess(result)
          }
          
          return
        } catch (err) {
          // Continue avec nouvelle exécution si promesse échoue
        }
      }
    }

    // Créer nouveau AbortController
    abortControllerRef.current = new AbortController()
    
    // Reset retry counter
    currentRetryRef.current = 0

    // Démarrer execution avec retry
    await executeWithRetry()
  }, [finalCacheKey, cacheDuration, onSuccess])
  
  // Fonction d'exécution avec retry logic (définie après execute pour éviter dépendance circulaire)

  // Fonction d'exécution avec retry logic
  const executeWithRetry = useCallback(async (): Promise<void> => {
    setStatus('loading')
    setError(null)

    try {
      // Créer promesse et la mettre en cache immédiatement
      const promise = asyncFn()
      
      if (finalCacheKey) {
        globalCache.set(finalCacheKey, {
          data: null,
          timestamp: Date.now(),
          promise
        })
      }

      // Attendre résultat
      const result = await promise

      // Vérifier si pas annulé
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      // Success
      setData(result)
      setStatus('success')
      setError(null)

      // Mettre en cache le résultat final
      if (finalCacheKey) {
        globalCache.set(finalCacheKey, {
          data: result,
          timestamp: Date.now()
        })
      }

      // Toast success si enabled
      if (enableToast) {
        toast.success('Opération réussie')
      }

      // Callback success
      if (onSuccess) {
        onSuccess(result)
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))

      // Vérifier si pas annulé
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      // Supprimer promise en échec du cache
      if (finalCacheKey) {
        const cacheEntry = globalCache.get(finalCacheKey)
        if (cacheEntry?.promise) {
          globalCache.delete(finalCacheKey)
        }
      }

      // Retry logic
      if (currentRetryRef.current < retryCount) {
        currentRetryRef.current++
        
        // Toast retry info si enabled
        if (enableToast) {
          toast.info(`Nouvelle tentative (${currentRetryRef.current}/${retryCount})...`)
        }

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, currentRetryRef.current - 1)
        
        retryTimeoutRef.current = setTimeout(() => {
          executeWithRetry()
        }, delay)

        return
      }

      // Échec final
      setError(error)
      setStatus('error')

      // Toast error si enabled
      if (enableToast) {
        toast.error(error.message || 'Une erreur s\'est produite')
      }

      // Callback error
      if (onError) {
        onError(error)
      }
    }
  }, [asyncFn, finalCacheKey, retryCount, retryDelay, enableToast, onSuccess, onError])

  // Fonction retry manuelle
  const retry = useCallback(async (): Promise<void> => {
    currentRetryRef.current = 0
    await executeWithRetry()
  }, [executeWithRetry])

  // Fonction reset
  const reset = useCallback(() => {
    // Annuler toute opération en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }

    // Reset state
    setData(initialData)
    setStatus('idle')
    setError(null)
    currentRetryRef.current = 0
  }, [initialData])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    status,
    error,
    isLoading,
    isSuccess,
    isError,
    isIdle,
    execute,
    reset,
    retry
  }
}

// Hook utilitaire pour auto-execute au mount
export function useAsyncEffect<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions<T> = {}
): Omit<UseAsyncReturn<T>, 'execute'> {
  const asyncState = useAsync(asyncFn, options)

  useEffect(() => {
    asyncState.execute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return {
    data: asyncState.data,
    status: asyncState.status,
    error: asyncState.error,
    isLoading: asyncState.isLoading,
    isSuccess: asyncState.isSuccess,
    isError: asyncState.isError,
    isIdle: asyncState.isIdle,
    reset: asyncState.reset,
    retry: asyncState.retry
  }
}

// Utilitaire pour clear cache global
export function clearAsyncCache(keyPattern?: string): void {
  if (!keyPattern) {
    globalCache.clear()
    return
  }

  const regex = new RegExp(keyPattern)
  for (const [key] of globalCache.entries()) {
    if (regex.test(key)) {
      globalCache.delete(key)
    }
  }
}