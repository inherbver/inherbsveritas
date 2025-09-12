/**
 * Fetch Client - HerbisVeritas MVP
 * 
 * Pattern basé sur ofetch + Context7 best practices
 * - Auto retry avec exponential backoff (500ms base)
 * - Status codes filtering [404, 500, 502, 503, 504]
 * - Interceptors pour request/response/error logging
 * - Timeout configuration (30s défaut, 10s MVP)
 * - Integration Supabase auth headers automatique
 * - Toast notifications sur network failures
 * - Type safety avec TypeScript generics
 */

import { ofetch } from 'ofetch'
import { toast } from '@/lib/toast'
import { createClient } from '@supabase/supabase-js'

// Types pour configuration et erreurs
export interface ApiErrorResponse {
  message: string
  code?: string
  details?: any
}

export interface ApiSuccessResponse<T = any> {
  data: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T>

// Configuration par défaut
const DEFAULT_CONFIG = {
  baseURL: process.env['NEXT_PUBLIC_SUPABASE_URL'] + '/rest/v1',
  timeout: 10000, // 10s pour MVP (vs 30s standard)
  retry: 3,
  retryDelay: 500, // ms
  retryStatusCodes: [404, 500, 502, 503, 504], // Status codes qui déclenchent retry
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// Instance Supabase pour auth headers
let supabaseClient: ReturnType<typeof createClient> | null = null

// Initialize Supabase client si pas déjà fait
function getSupabaseClient() {
  if (!supabaseClient && typeof window !== 'undefined') {
    supabaseClient = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
    )
  }
  return supabaseClient
}

// Helper pour obtenir auth headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabaseClient()
  if (!supabase) return {}

  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    return {
      'apikey': process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
      ...(session?.access_token && {
        'Authorization': `Bearer ${session.access_token}`
      })
    }
  } catch (error) {
    console.warn('Failed to get auth headers:', error)
    return {
      'apikey': process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
    }
  }
}

// Helper pour parser erreurs Supabase
function parseSupabaseError(error: any): string {
  // Erreurs Supabase standard
  if (error.message) {
    // RLS violations
    if (error.message.includes('row-level security')) {
      return 'Accès non autorisé à cette ressource'
    }
    
    // Contraintes de base
    if (error.message.includes('duplicate key value')) {
      return 'Cette ressource existe déjà'
    }
    
    if (error.message.includes('foreign key constraint')) {
      return 'Référence manquante ou invalide'
    }
    
    // Validation errors
    if (error.message.includes('check constraint')) {
      return 'Données invalides fournies'
    }
    
    return error.message
  }

  // Erreurs réseau
  if (error.code === 'ECONNREFUSED') {
    return 'Impossible de contacter le serveur'
  }
  
  if (error.code === 'ETIMEDOUT') {
    return 'Délai d\'attente dépassé'
  }

  return 'Une erreur inattendue s\'est produite'
}

// Logger pour développement
function logRequest(request: string, options: any) {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔄 API Request')
    console.log('URL:', request)
    console.log('Method:', options.method || 'GET')
    console.log('Headers:', options.headers)
    if (options.body) {
      console.log('Body:', options.body)
    }
    console.groupEnd()
  }
}

function logResponse(request: string, response: any) {
  if (process.env.NODE_ENV === 'development') {
    console.group('✅ API Response')
    console.log('URL:', request)
    console.log('Status:', response.status)
    console.log('Data:', response._data)
    console.groupEnd()
  }
}

function logError(request: string, error: any, isRetry = false) {
  const prefix = isRetry ? '🔄 API Retry' : '❌ API Error'
  
  console.group(prefix)
  console.log('URL:', request)
  console.error('Error:', error.message || error)
  console.log('Status:', error.status || 'N/A')
  if (error.data) {
    console.log('Error Data:', error.data)
  }
  console.groupEnd()
}

// Instance ofetch configurée
export const apiClient = ofetch.create({
  ...DEFAULT_CONFIG,
  
  // Interceptor avant requête
  async onRequest({ request, options }: { request: any; options: any }) {
    // Log pour développement
    logRequest(String(request), options)
    
    // Ajouter auth headers automatiquement
    const authHeaders = await getAuthHeaders()
    options.headers = {
      ...options.headers,
      ...authHeaders
    }
    
    // Timestamp pour mesurer performance
    options.requestStartTime = Date.now()
  },

  // Interceptor après réponse réussie
  async onResponse({ request, response, options }: { request: any; response: any; options: any }) {
    // Log pour développement
    logResponse(String(request), response)
    
    // Mesurer performance
    if (options.requestStartTime) {
      const duration = Date.now() - options.requestStartTime
      if (duration > 2000) { // Alerter si > 2s
        console.warn(`⚠️ Slow API call: ${request} (${duration}ms)`)
      }
    }
  },

  // Interceptor erreur requête (network, timeout, etc.)
  async onRequestError({ request, error }: { request: any; error: any; options?: any }) {
    logError(String(request), error)
    
    const errorMessage = parseSupabaseError(error)
    
    // Toast notification pour erreurs réseau
    toast.error('Erreur réseau', {
      description: errorMessage,
      duration: 5000
    })
    
    // Re-throw pour permettre retry automatique
    throw error
  },

  // Interceptor erreur réponse (4xx, 5xx)
  async onResponseError({ request, response, options }: { request: any; response: any; options: any }) {
    const isRetryAttempt = options.retryAttempt || 0
    
    logError(String(request), {
      status: response.status,
      message: response._data?.message || response.statusText,
      data: response._data
    }, isRetryAttempt > 0)
    
    let errorMessage = 'Erreur serveur'
    
    // Messages spécifiques par status
    switch (response.status) {
      case 400:
        errorMessage = 'Données invalides'
        break
      case 401:
        errorMessage = 'Authentification requise'
        break
      case 403:
        errorMessage = 'Accès interdit'
        break
      case 404:
        errorMessage = 'Ressource non trouvée'
        break
      case 409:
        errorMessage = 'Conflit de données'
        break
      case 422:
        errorMessage = 'Données non valides'
        break
      case 429:
        errorMessage = 'Trop de requêtes, veuillez patienter'
        break
      case 500:
        errorMessage = 'Erreur interne du serveur'
        break
      case 502:
        errorMessage = 'Service temporairement indisponible'
        break
      case 503:
        errorMessage = 'Service en maintenance'
        break
      default:
        errorMessage = response._data?.message || parseSupabaseError(response._data)
    }
    
    // Toast notification uniquement pour dernière tentative
    const willRetry = DEFAULT_CONFIG.retryStatusCodes.includes(response.status) && 
                     isRetryAttempt < DEFAULT_CONFIG.retry
    
    if (!willRetry) {
      toast.error(errorMessage, {
        description: `Code: ${response.status}`,
        duration: 6000
      })
    } else {
      // Info toast pour retry
      toast.info(`Nouvelle tentative (${isRetryAttempt + 1}/${DEFAULT_CONFIG.retry})`, {
        duration: 2000
      })
    }
  }
})

// Wrapper fonctions typed pour API Supabase REST
export const api = {
  // GET request
  get: async <T = any>(url: string, options: any = {}): Promise<T> => {
    return apiClient<T>(url, { method: 'GET', ...options })
  },

  // POST request
  post: async <T = any>(url: string, body?: any, options: any = {}): Promise<T> => {
    return apiClient<T>(url, { method: 'POST', body, ...options })
  },

  // PUT request
  put: async <T = any>(url: string, body?: any, options: any = {}): Promise<T> => {
    return apiClient<T>(url, { method: 'PUT', body, ...options })
  },

  // PATCH request
  patch: async <T = any>(url: string, body?: any, options: any = {}): Promise<T> => {
    return apiClient<T>(url, { method: 'PATCH', body, ...options })
  },

  // DELETE request
  delete: async <T = any>(url: string, options: any = {}): Promise<T> => {
    return apiClient<T>(url, { method: 'DELETE', ...options })
  }
}

// Export type pour réutilisation
export type ApiClient = typeof api

// Helper pour construire query params Supabase
export function buildSupabaseQuery(params: {
  select?: string
  filter?: Record<string, any>
  order?: string
  limit?: number
  offset?: number
}): string {
  const query = new URLSearchParams()
  
  if (params.select) {
    query.set('select', params.select)
  }
  
  if (params.filter) {
    Object.entries(params.filter).forEach(([key, value]) => {
      query.set(key, `eq.${value}`)
    })
  }
  
  if (params.order) {
    query.set('order', params.order)
  }
  
  if (params.limit) {
    query.set('limit', params.limit.toString())
  }
  
  if (params.offset) {
    query.set('offset', params.offset.toString())
  }
  
  return query.toString()
}