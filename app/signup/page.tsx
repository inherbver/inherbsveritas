/**
 * Signup Page - HerbisVeritas V2 MVP
 * 
 * Page d'inscription avec validation complète
 * Intégration Supabase Auth + middleware
 */

import { SignupForm } from '@/components/forms/signup-form'

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

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <span>👤</span>
            Créer un compte
          </CardTitle>
          <CardDescription>
            Rejoignez HerbisVeritas et découvrez nos produits cosmétiques bio
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <SignupForm />
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-6">
            <h4 className="font-semibold text-green-800 mb-1">✅ Inscription sécurisée</h4>
            <p className="text-xs text-green-700">
              Compte avec rôle &apos;user&apos; par défaut.
              Email de confirmation requis pour activation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}