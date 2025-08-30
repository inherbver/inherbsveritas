/**
 * Admin Dashboard - HerbisVeritas V2 MVP
 * 
 * Page test pour middleware auth admin
 * Protection: admin/dev uniquement
 */

import { requireRole } from '@/lib/auth/server'
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
function Badge({ children, variant }: { children: React.ReactNode, variant?: string }) {
  const colors = variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
  return <span className={`px-2 py-1 text-xs rounded-full ${colors}`}>{children}</span>
}
function Button({ children, variant, size, asChild, ...props }: any) {
  const Component = asChild ? 'div' : 'button'
  const classes = `px-4 py-2 rounded-md text-sm font-medium ${
    variant === 'outline' ? 'border border-gray-300 bg-white hover:bg-gray-50' : 'bg-blue-600 text-white hover:bg-blue-700'
  } ${size === 'sm' ? 'px-3 py-1.5 text-xs' : ''}`
  return <Component className={classes} {...props}>{children}</Component>
}

export default async function AdminDashboard() {
  // Server-side role check (redirection si pas admin/dev)
  const { user, role } = await requireRole('admin')

  const adminStats = [
    { label: 'Utilisateurs', value: '234', href: '/admin/users' },
    { label: 'Produits', value: '89', href: '/admin/products' }, 
    { label: 'Commandes', value: '156', href: '/admin/orders' },
    { label: 'Articles', value: '42', href: '/admin/articles' },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">
            Tableau de bord administrateur - HerbisVeritas V2
          </p>
        </div>
        <Badge variant={role === 'dev' ? 'default' : 'secondary'}>
          {role.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {adminStats.map((stat) => {
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <span className="h-4 w-4 text-muted-foreground">📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    Total
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={stat.href}>Gérer</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-5 w-5">⚙️</span>
              Accès Administrateur
            </CardTitle>
            <CardDescription>
              Fonctionnalités disponibles selon votre rôle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Gestion utilisateurs</span>
              <Badge variant="outline">✓ Autorisé</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Gestion produits</span>
              <Badge variant="outline">✓ Autorisé</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Gestion commandes</span>
              <Badge variant="outline">✓ Autorisé</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Accès développeur</span>
              <Badge variant={role === 'dev' ? 'default' : 'secondary'}>
                {role === 'dev' ? '✓ Autorisé' : '✗ Restreint'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Middleware RBAC Status</CardTitle>
            <CardDescription>
              Validation du système d&apos;authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Protection Active</h4>
              <p className="text-sm text-green-700">
                Cette page est protégée par le middleware RBAC. Seuls les utilisateurs avec rôle admin ou dev peuvent y accéder.
              </p>
            </div>
            
            <div className="grid gap-2 text-sm">
              <div><span className="font-medium">Utilisateur:</span> {user.email}</div>
              <div><span className="font-medium">Rôle validé:</span> {role}</div>
              <div><span className="font-medium">Auth check:</span> Server-side ✓</div>
              <div><span className="font-medium">Middleware:</span> Fonctionnel ✓</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}