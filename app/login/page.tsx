/**
 * Login Page - HerbisVeritas V2 MVP
 * 
 * Page de connexion avec support redirect après auth
 * Intégration Supabase Auth + middleware
 */

import { LoginForm } from '@/components/forms/login-form'

// Composants UI temporaires
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-white rounded-lg border shadow-sm ${className || ''}`}>{children}</div>
}
function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pb-4 ${className || ''}`}>{children}</div>
}
function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>
}
function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 mt-2">{children}</p>
}
function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>
}

interface LoginPageProps {
  searchParams: Promise<{
    redirectedFrom?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectedFrom = params.redirectedFrom
  const message = params.message

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <span>🔑</span>
            Connexion
          </CardTitle>
          <CardDescription>
            Connectez-vous à votre compte HerbisVeritas
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {redirectedFrom && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Redirection après connexion :</strong> {redirectedFrom}
              </p>
            </div>
          )}

          {message && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">{message}</p>
            </div>
          )}
          
          <LoginForm redirectTo={redirectedFrom} />
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-green-800 mb-1">✅ Fonctionnel</h4>
            <p className="text-xs text-green-700">
              Connexion avec Supabase Auth intégrée. 
              Middleware RBAC opérationnel avec protection des routes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}