/**
 * Home Page - HerbisVeritas V2 MVP
 * 
 * Page d'accueil publique (pas d'auth requise)
 * Liens vers pages protégées pour test middleware
 */

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          HerbisVeritas V2 MVP
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          E-commerce de cosmétiques naturels et biologiques
        </p>
        
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🔐 Test Middleware Auth</h2>
          <p className="text-gray-600 mb-6">
            Le middleware d&apos;authentification est configuré et protège les routes selon les rôles RBAC.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link 
              href="/profile"
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition-colors"
            >
              <div className="font-semibold text-blue-800">👤 Profile</div>
              <div className="text-sm text-blue-600 mt-1">Accessible: user/admin/dev</div>
            </Link>
            
            <Link 
              href="/admin"
              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-4 transition-colors"
            >
              <div className="font-semibold text-amber-800">⚙️ Admin</div>
              <div className="text-sm text-amber-600 mt-1">Accessible: admin/dev</div>
            </Link>
            
            <Link 
              href="/login"
              className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 transition-colors"
            >
              <div className="font-semibold text-green-800">🔑 Login</div>
              <div className="text-sm text-green-600 mt-1">Page publique</div>
            </Link>
            
            <Link 
              href="/unauthorized"
              className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-4 transition-colors"
            >
              <div className="font-semibold text-red-800">⚠️ Unauthorized</div>
              <div className="text-sm text-red-600 mt-1">Page d&apos;erreur</div>
            </Link>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">✅ Infrastructure Complétée</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Middleware Next.js 15 + Supabase SSR</li>
            <li>• Protection routes RBAC (3 rôles)</li>
            <li>• Session refresh automatique</li>
            <li>• Redirections seamless</li>
            <li>• TypeScript validé</li>
          </ul>
        </div>
      </div>
    </div>
  )
}