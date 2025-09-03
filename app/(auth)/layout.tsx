/**
 * Layout Auth - Route Group (auth)
 * Pattern Context7 : Layout partagé pour routes authentification
 */

import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header auth simple */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-green-700">🌿</span>
            <span className="text-xl font-serif font-bold text-gray-900">
              HerbisVeritas
            </span>
          </Link>
        </div>
      </header>

      {/* Contenu auth */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer auth minimal */}
      <footer className="border-t bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 HerbisVeritas. Cosmétiques bio artisanaux.
          </div>
        </div>
      </footer>
    </div>
  )
}