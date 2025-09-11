'use client'

/**
 * Page d'erreur globale Next.js
 * Gère les erreurs non capturées dans l'application
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Global error caught:', error)
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <article className="max-w-lg w-full text-center space-y-8">
        <header className="space-y-4">
          <AlertCircle className="h-20 w-20 text-destructive mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">
            Une erreur inattendue s&apos;est produite
          </h1>
          <p className="text-lg text-muted-foreground">
            Nous nous excusons pour le désagrément. L&apos;équipe technique a été notifiée.
          </p>
        </header>

        {isDevelopment && (
          <details className="text-left bg-muted p-4 rounded-lg text-sm max-w-full">
            <summary className="cursor-pointer font-medium mb-3 text-center">
              Informations techniques (développement)
            </summary>
            <section className="space-y-2">
              <p><strong>Message:</strong> {error.message}</p>
              {error.digest && (
                <p><strong>Digest:</strong> {error.digest}</p>
              )}
              {error.stack && (
                <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-40 bg-background p-2 rounded">
                  {error.stack}
                </pre>
              )}
            </section>
          </details>
        )}

        <nav className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} size="lg" className="flex-1">
            <RefreshCw className="h-5 w-5 mr-2" />
            Réessayer
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <Home className="h-5 w-5 mr-2" />
            Retour à l&apos;accueil
          </Button>
        </nav>

        <footer className="text-sm text-muted-foreground">
          <p>
            Si le problème persiste, contactez-nous à{' '}
            <a 
              href="mailto:support@herbisveritas.fr" 
              className="text-primary hover:underline"
            >
              support@herbisveritas.fr
            </a>
          </p>
        </footer>
      </article>
    </main>
  )
}