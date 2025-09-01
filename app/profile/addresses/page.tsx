/**
 * Profile Addresses Page - HerbisVeritas V2 MVP
 * 
 * Page gestion des adresses utilisateur
 * Protection: user/admin/dev
 */

import { requireAuth } from '@/lib/auth/server'
import { getUserAddresses } from '@/lib/auth/addresses'
import Link from 'next/link'

export default async function AddressesPage() {
  // Server-side auth check
  const user = await requireAuth()
  
  // Récupérer les adresses utilisateur
  const addressesResult = await getUserAddresses(user.id)
  const addresses = addressesResult.success ? (addressesResult.data || []) : []

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <article className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <header className="border-b pb-6 mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>📍</span>
                Mes Adresses
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez vos adresses de livraison et de facturation
              </p>
            </div>
            <nav>
              <Link 
                href="/profile" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Retour au profil
              </Link>
            </nav>
          </header>

          {/* États selon les addresses */}
          {addresses.length === 0 ? (
            // Aucune adresse
            <section className="text-center py-12">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
                <h3 className="font-semibold text-blue-800 mb-4">🏠 Aucune adresse enregistrée</h3>
                <p className="text-blue-700 mb-6">
                  Ajoutez votre première adresse pour faciliter vos commandes futures.
                </p>
                <button 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled
                >
                  + Ajouter une adresse (Bientôt)
                </button>
              </div>
            </section>
          ) : (
            // Liste des addresses
            <section className="space-y-6">
              <header className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {addresses.length} adresse{addresses.length > 1 ? 's' : ''} enregistrée{addresses.length > 1 ? 's' : ''}
                </h2>
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  disabled
                >
                  + Ajouter une adresse
                </button>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                {addresses.map((address) => (
                  <article 
                    key={address.id} 
                    className={`border rounded-lg p-6 ${
                      address.is_default 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Header adresse */}
                    <header className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <span>{address.address_type === 'billing' ? '💳' : '📦'}</span>
                          {address.address_type === 'billing' ? 'Facturation' : 'Livraison'}
                        </h3>
                        {address.is_default && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            ✓ Par défaut
                          </span>
                        )}
                      </div>
                      <nav className="flex gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          disabled
                        >
                          Modifier
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 text-sm"
                          disabled
                        >
                          Supprimer
                        </button>
                      </nav>
                    </header>

                    {/* Contenu adresse */}
                    <address className="text-gray-700 space-y-1 not-italic">
                      <p className="font-medium">
                        {address.first_name} {address.last_name}
                      </p>
                      <p>{address.address_line1}</p>
                      {address.address_line2 && (
                        <p>{address.address_line2}</p>
                      )}
                      <p>
                        {address.postal_code} {address.city}
                      </p>
                      <p>{address.country_code}</p>
                      {address.phone_number && (
                        <p className="text-sm">📞 {address.phone_number}</p>
                      )}
                    </address>

                    {/* Actions */}
                    {!address.is_default && (
                      <footer className="mt-4 pt-4 border-t border-gray-200">
                        <button 
                          className="text-sm text-green-600 hover:text-green-800"
                          disabled
                        >
                          Définir par défaut
                        </button>
                      </footer>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Section développement */}
          <aside className="mt-12 pt-8 border-t">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-amber-800 mb-3">🚧 Fonctionnalités en développement</h3>
              <ul className="text-sm text-amber-700 space-y-2 list-disc list-inside">
                <li>Formulaire d&apos;ajout/modification d&apos;adresse</li>
                <li>Validation en temps réel des codes postaux</li>
                <li>Intégration API d&apos;adresses françaises</li>
                <li>Gestion des adresses multiples par type</li>
                <li>Import/export d&apos;adresses</li>
              </ul>
            </div>
          </aside>

          {/* Debug section */}
          <aside className="mt-8 pt-6 border-t">
            <details className="group">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-2 font-medium">
                Afficher les données addresses (debug)
              </summary>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Utilisateur ID:</strong> {user.id}</p>
                  <p><strong>Nombre d&apos;adresses:</strong> {addresses.length}</p>
                  <p><strong>Status requête:</strong> {addressesResult.success ? '✅ Succès' : '❌ Erreur'}</p>
                  {!addressesResult.success && (
                    <p><strong>Erreur:</strong> {addressesResult.error}</p>
                  )}
                </div>
                <pre className="mt-4 bg-gray-200 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(addresses, null, 2)}
                </pre>
              </div>
            </details>
          </aside>
        </article>
      </div>
    </main>
  )
}