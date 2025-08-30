/**
 * Login Page - HerbisVeritas V2 MVP
 * 
 * Page de connexion avec support redirect après auth
 * Intégration Supabase Auth + middleware
 */

import Link from 'next/link'

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
function Button({ children, variant, asChild, ...props }: any) {
  const Component = asChild ? 'div' : 'button'
  const classes = `px-4 py-2 rounded-md text-sm font-medium ${
    variant === 'outline' ? 'border border-gray-300 bg-white hover:bg-gray-50' : 
    variant === 'ghost' ? 'hover:bg-gray-50' : 'bg-blue-600 text-white hover:bg-blue-700'
  }`
  return <Component className={classes} {...props}>{children}</Component>
}
function Input({ ...props }) {
  return <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />
}
function Label({ children, ...props }: any) {
  return <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>{children}</label>
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
          
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="votre@email.com"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                required 
              />
            </div>
            
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <p className="text-gray-600 mb-2">Pas encore de compte ?</p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/signup">Créer un compte</Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center pt-4 border-t">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <span>←</span>
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-semibold text-yellow-800 mb-1">🚧 Version MVP</h4>
            <p className="text-xs text-yellow-700">
              Fonctionnalité de connexion en cours de développement. 
              Le middleware auth est configuré et fonctionnel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}