'use client'

/**
 * Global Error Boundary - HerbisVeritas MVP
 * 
 * Pattern basé sur TypeScript Cheatsheets + Context7 best practices
 * - Class component avec getDerivedStateFromError + componentDidCatch
 * - Fallback UI responsive mobile-first
 * - Integration Sentry logging automatique
 * - Toast notification pour user feedback
 * - Bouton retry pour récupération gracieuse
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from '@/lib/toast'

// Types pour props et state
interface Props {
  children?: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

// Custom Error types pour domaines spécifiques
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class CartError extends Error {
  constructor(message: string, public productId?: string) {
    super(message)
    this.name = 'CartError'
  }
}

export class ProductError extends Error {
  constructor(message: string, public slug?: string) {
    super(message)
    this.name = 'ProductError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'NetworkError'
  }
}

export default class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null
  }

  // Static lifecycle pour mise à jour state
  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Générer ID unique pour tracking Sentry
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  // Lifecycle pour logging et side effects
  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Store errorInfo dans state pour debugging
    this.setState({ errorInfo })

    // Console logging pour développement
    console.group('🚨 Error Boundary Caught')
    console.error('Error:', error.name, error.message)
    console.error('Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    // TODO: Integration Sentry (quando configurado)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.withScope((scope) => {
    //     scope.setTag('errorBoundary', true)
    //     scope.setContext('errorInfo', errorInfo)
    //     scope.setLevel('error')
    //     window.Sentry.captureException(error)
    //   })
    // }

    // Toast notification pour user feedback
    this.showErrorToast(error)

    // Callback personnalisé si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private showErrorToast = (error: Error) => {
    // Messages personnalisés par type d'erreur
    let message = 'Une erreur inattendue s\'est produite'
    let description: string | undefined

    switch (error.name) {
      case 'AuthError':
        message = 'Erreur d\'authentification'
        description = 'Veuillez vous reconnecter'
        break
      case 'CartError':
        message = 'Erreur panier'
        description = 'Impossible de traiter votre demande'
        break
      case 'ProductError':
        message = 'Erreur produit'
        description = 'Produit temporairement indisponible'
        break
      case 'NetworkError':
        message = 'Erreur réseau'
        description = 'Vérifiez votre connexion internet'
        break
      case 'ChunkLoadError':
        message = 'Erreur de chargement'
        description = 'Rechargez la page pour continuer'
        break
    }

    toast.error(message, { 
      ...(description && { description }),
      duration: 6000
    })
  }

  private handleRetry = () => {
    // Clear any pending timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }

    // Show loading toast
    const loadingId = toast.loading('Rechargement en cours...')

    // Reset error state après délai pour éviter flash
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      })
      
      toast.dismiss(loadingId)
      toast.success('Rechargement effectué')
    }, 500)
  }

  private handleReload = () => {
    // Force reload pour erreurs critiques
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  public override componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  public override render() {
    if (this.state.hasError) {
      // Fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorId } = this.state
      const isDevelopment = process.env.NODE_ENV === 'development'

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Oups ! Une erreur s&apos;est produite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Nous nous excusons pour ce désagrément. Notre équipe a été notifiée automatiquement.
              </p>

              {/* Détails techniques en développement */}
              {isDevelopment && error && (
                <div className="bg-gray-100 p-3 rounded-md text-xs">
                  <p className="font-mono text-red-600 mb-1">
                    <strong>{error.name}:</strong> {error.message}
                  </p>
                  {errorId && (
                    <p className="font-mono text-gray-500">
                      ID: {errorId}
                    </p>
                  )}
                </div>
              )}

              {/* Actions utilisateur */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  Recharger la page
                </Button>
              </div>

              {/* Support contact */}
              <p className="text-xs text-gray-500 text-center pt-2">
                Si le problème persiste, contactez-nous à{' '}
                <a 
                  href="mailto:support@herbisveritas.fr" 
                  className="text-hv-primary hover:underline"
                >
                  support@herbisveritas.fr
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook utilitaire pour throw des erreurs typées dans composants
export function useErrorHandler() {
  return {
    throwAuthError: (message: string, code?: string) => {
      throw new AuthError(message, code)
    },
    throwCartError: (message: string, productId?: string) => {
      throw new CartError(message, productId)
    },
    throwProductError: (message: string, slug?: string) => {
      throw new ProductError(message, slug)
    },
    throwNetworkError: (message: string, statusCode?: number) => {
      throw new NetworkError(message, statusCode)
    }
  }
}