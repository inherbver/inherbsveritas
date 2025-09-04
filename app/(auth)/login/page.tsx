/**
 * Page Login - Route Group (auth) 
 * Pattern Context7 : Route Groups sans impact URL
 */

import { LoginForm } from '@/components/forms/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectUrl = params.redirect
  const message = params.message

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Connexion
          </CardTitle>
          <CardDescription>
            Accédez à votre compte HerbisVeritas
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {redirectUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Redirection après connexion :</strong> {redirectUrl}
              </p>
            </div>
          )}

          {message && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">{message}</p>
            </div>
          )}
          
          <Suspense fallback={<div>Chargement...</div>}>
            <LoginForm redirectTo={redirectUrl} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

export const metadata = {
  title: 'Connexion | HerbisVeritas',
  description: 'Connectez-vous à votre compte HerbisVeritas pour accéder à vos commandes et préférences.'
}