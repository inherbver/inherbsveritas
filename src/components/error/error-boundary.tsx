'use client'

/**
 * ErrorBoundary - Composant pour capturer les erreurs React
 * Fournit une interface de fallback élégante
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback

      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

// Composant de fallback par défaut
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <main className="min-h-[400px] flex items-center justify-center p-6">
      <article className="max-w-md w-full text-center space-y-6">
        <header className="space-y-2">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">
            Oops ! Une erreur s&apos;est produite
          </h2>
          <p className="text-muted-foreground">
            Nous sommes désolés, quelque chose ne s&apos;est pas passé comme prévu.
          </p>
        </header>

        {isDevelopment && (
          <details className="text-left bg-muted p-4 rounded-lg text-sm">
            <summary className="cursor-pointer font-medium mb-2">
              Détails de l&apos;erreur (développement)
            </summary>
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-32">
              {error.name}: {error.message}
              {error.stack && '\n' + error.stack}
            </pre>
          </details>
        )}

        <nav className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline"
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </nav>
      </article>
    </main>
  )
}

// Composants spécialisés pour différents contextes
export function ProductErrorFallback({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="text-center p-8 space-y-4" role="alert" aria-labelledby="product-error">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
      <header>
        <h3 id="product-error" className="text-lg font-semibold">Erreur de chargement du produit</h3>
        <p className="text-muted-foreground text-sm">
          Impossible de charger les détails du produit
        </p>
      </header>
      <Button onClick={reset} size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Réessayer
      </Button>
    </section>
  )
}

export function CartErrorFallback({ reset }: { error: Error; reset: () => void }) {
  return (
    <aside className="text-center p-6 space-y-4" role="alert" aria-labelledby="cart-error">
      <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
      <header>
        <h3 id="cart-error" className="text-md font-semibold">Erreur du panier</h3>
        <p className="text-muted-foreground text-sm">
          Impossible de charger votre panier
        </p>
      </header>
      <Button onClick={reset} size="sm" variant="outline">
        Actualiser le panier
      </Button>
    </aside>
  )
}

// Hook pour utiliser ErrorBoundary avec facilité
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    // Dans une implémentation plus avancée, on pourrait envoyer l'erreur à Sentry
    console.error('Erreur capturée par useErrorHandler:', error)
    throw error
  }, [])
}

export { ErrorBoundaryClass as ErrorBoundary }