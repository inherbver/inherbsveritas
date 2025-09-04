/**
 * Page Signup - Route Group (auth)
 * Pattern Context7 : Route Groups sans impact URL  
 */

import { SignupForm } from '@/components/forms/signup-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import Link from 'next/link'

interface SignupPageProps {
  searchParams: Promise<{
    redirect?: string
    message?: string
  }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const redirectUrl = params.redirect
  const message = params.message

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Créer un compte
          </CardTitle>
          <CardDescription>
            Rejoignez la communauté HerbisVeritas
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {redirectUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Redirection après inscription :</strong> {redirectUrl}
              </p>
            </div>
          )}

          {message && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">{message}</p>
            </div>
          )}
          
          <Suspense fallback={<div>Chargement...</div>}>
            <SignupForm redirectTo={redirectUrl} />
          </Suspense>
          
          <div className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const metadata = {
  title: 'Créer un compte | HerbisVeritas',
  description: 'Créez votre compte HerbisVeritas pour découvrir nos cosmétiques bio artisanaux.'
}