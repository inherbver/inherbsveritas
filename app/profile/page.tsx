/**
 * Profile Page - HerbisVeritas V2 MVP
 * 
 * Page test pour middleware auth
 * Protection: user/admin/dev
 */

import { requireAuth } from '@/lib/auth/server'
// Composants UI temporaires - seront remplacés par shadcn/ui
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-white rounded-lg border shadow-sm ${className || ''}`}>{children}</div>
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4">{children}</div>
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
function Badge({ children, variant }: { children: React.ReactNode, variant?: string }) {
  return <span className={`px-2 py-1 text-xs rounded-full ${variant === 'outline' ? 'border border-gray-300' : 'bg-blue-100 text-blue-800'}`}>{children}</span>
}

export default async function ProfilePage() {
  // Server-side auth check (redirection automatique si non auth)
  const user = await requireAuth()
  
  const userRole = user.app_metadata?.['role'] || 'user'

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Profil Utilisateur
            <Badge variant={userRole === 'dev' ? 'default' : userRole === 'admin' ? 'secondary' : 'outline'}>
              {userRole.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Page protégée accessible aux utilisateurs authentifiés
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Informations</h3>
            <div className="grid gap-2 text-sm">
              <div><span className="font-medium">ID:</span> {user.id}</div>
              <div><span className="font-medium">Email:</span> {user.email}</div>
              <div><span className="font-medium">Rôle:</span> {userRole}</div>
              <div><span className="font-medium">Créé:</span> {new Date(user.created_at).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✅ Middleware Auth Fonctionnel</h4>
            <p className="text-sm text-green-700">
              Vous voyez cette page car le middleware a validé votre authentification et vos permissions.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Permissions actuelles</h4>
            <div className="text-sm text-muted-foreground">
              {userRole === 'dev' && '🔧 Accès développeur complet'}
              {userRole === 'admin' && '⚙️ Accès administration'}  
              {userRole === 'user' && '👤 Accès utilisateur standard'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}