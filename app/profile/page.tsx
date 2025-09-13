/**
 * Profile Page - HerbisVeritas V2 MVP
 * 
 * Page test pour middleware auth
 * Protection: user/admin/dev
 */

import { requireAuth, getServerSession } from '@/features/auth/server-exports'
import { LogoutButton } from '@/components/auth/logout-button'
import Link from 'next/link'

// Composants UI temporaires - seront remplacés par shadcn/ui

export default async function ProfilePage() {
  // Server-side auth check (redirection automatique si non auth)
  const user = await requireAuth()
  const session = await getServerSession()
  
  const userRole = session?.role || 'user'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="border-b pb-6 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>👤</span>
                Mon Profil
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez vos informations personnelles et préférences
              </p>
            </div>
            <LogoutButton variant="outline" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">✅ Authentifié</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Rôle:</strong> <span className="bg-green-100 px-2 py-1 rounded text-green-800 font-medium">{userRole}</span></p>
                  <p><strong>Créé le:</strong> {new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🔗 Actions rapides</h3>
                <div className="space-y-2 text-sm">
                  <Link href="/profile/addresses" className="block text-blue-600 hover:text-blue-800 underline">
                    → Gérer mes adresses
                  </Link>
                  <Link href="/profile/orders" className="block text-blue-600 hover:text-blue-800 underline">
                    → Mes commandes
                  </Link>
                  <Link href="/boutique" className="block text-blue-600 hover:text-blue-800 underline">
                    → Boutique
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">🔒 Pages Protégées</h3>
                <div className="space-y-2 text-sm">
                  {(userRole === 'admin' || userRole === 'dev') && (
                    <Link href="/admin" className="block text-purple-600 hover:text-purple-800 underline">
                      → Interface Admin
                    </Link>
                  )}
                  {userRole === 'dev' && (
                    <Link href="/dev" className="block text-purple-600 hover:text-purple-800 underline">
                      → Tools Dev
                    </Link>
                  )}
                  {userRole === 'user' && (
                    <p className="text-purple-600 text-sm italic">
                      Aucun accès administrateur (rôle: user)
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">🚧 En développement</h3>
                <div className="space-y-1 text-sm text-amber-700">
                  <p>• Gestion des adresses</p>
                  <p>• Historique des commandes</p>
                  <p>• Préférences utilisateur</p>
                  <p>• Avatar et photo de profil</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">Données Utilisateur Brutes</h3>
            <details className="group">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-2 font-medium">
                Afficher les données utilisateur (debug)
              </summary>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>←</span>
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}