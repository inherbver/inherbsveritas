/**
 * Page Unauthorized - Pattern Context7 Next.js 15
 * Affichée automatiquement par unauthorized() dans middleware
 */

import { LoginForm } from '@/components/forms/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">
            Accès refusé
          </CardTitle>
          <CardDescription className="text-red-700">
            Vous devez être connecté pour accéder à cette page
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">
              Pourquoi cette page ?
            </h3>
            <p className="text-sm text-red-700">
              Cette page est protégée et nécessite une authentification. 
              Connectez-vous pour continuer.
            </p>
          </div>
          
          <LoginForm />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Pas encore de compte ?
            </p>
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Créer un compte
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const metadata = {
  title: '401 - Accès refusé | HerbisVeritas',
  description: 'Accès refusé. Connectez-vous pour accéder à cette page.'
}