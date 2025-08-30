/**
 * Page Unauthorized - HerbisVeritas V2 MVP
 * 
 * Affichée quand user n'a pas les permissions requises
 * Support redirection automatique vers page appropriée
 */

import Link from 'next/link'

// Composants UI temporaires
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-white rounded-lg border shadow-sm ${className || ''}`}>{children}</div>
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4 text-center">{children}</div>
}
function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`text-lg font-semibold ${className || ''}`}>{children}</div>
}
function CardDescription({ children, className }: { children: React.ReactNode, className?: string }) {
  return <p className={`text-sm text-gray-600 mt-2 ${className || ''}`}>{children}</p>
}
function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>
}
function Button({ children, variant, asChild, className, ...props }: any) {
  const Component = asChild ? 'div' : 'button'
  const classes = `px-4 py-2 rounded-md text-sm font-medium ${
    variant === 'outline' ? 'border border-gray-300 bg-white hover:bg-gray-50' : 'bg-blue-600 text-white hover:bg-blue-700'
  } ${className || ''}`
  return <Component className={classes} {...props}>{children}</Component>
}

interface UnauthorizedPageProps {
  searchParams: Promise<{
    redirectedFrom?: string
  }>
}

export default async function UnauthorizedPage({ searchParams }: UnauthorizedPageProps) {
  const params = await searchParams
  const redirectedFrom = params.redirectedFrom

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <span className="text-6xl">⚠️</span>
          </div>
          <CardTitle>
            <div className="text-2xl font-bold text-gray-900">Accès Refusé</div>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {redirectedFrom && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Page demandée :</strong> {redirectedFrom}
              </p>
            </div>
          )}
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>Cette page nécessite des permissions spéciales :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Admin</strong> - Gestion des produits, commandes, contenu</li>
              <li><strong>Dev</strong> - Accès développeur et maintenance</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/" className="flex items-center justify-center gap-2">
                <span>🏠</span>
                Accueil
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="flex-1">
              <Link href="/login" className="flex items-center justify-center gap-2">
                <span>🔑</span>
                Connexion
              </Link>
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Contactez un administrateur si vous pensez avoir besoin d&apos;accès.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}