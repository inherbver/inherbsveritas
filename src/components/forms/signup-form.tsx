/**
 * Signup Form - HerbisVeritas V2 MVP
 * 
 * Formulaire d'inscription avec validation et intégration Supabase Auth
 */

// @ts-nocheck

"use client"

import { useState } from 'react'
import { useAuthActions } from '@/lib/auth/hooks/use-auth-actions'
import Link from 'next/link'

import { Button, Alert } from './signup-form/temporary-ui'
import { FormFields } from './signup-form/form-fields'
import { validateForm, FormData, FormErrors } from './signup-form/form-validation'

interface SignupFormProps {
  onSuccess?: (needsConfirmation: boolean) => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { signUp, loading, error, clearError } = useAuthActions()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
    // Clear auth error when user modifies form
    if (error) {
      clearError()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    clearError()
    setFormErrors({})
    
    // Validate form
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      })

      if (result.success) {
        setShowSuccess(true)
        onSuccess?.(result.needsConfirmation)
      }
    } catch (err) {
      console.error('Signup error:', err)
    }
  }

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <Alert variant="success">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Inscription réussie !</h2>
            <p>
              Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
              Veuillez cliquer sur le lien dans l&apos;email pour activer votre compte.
            </p>
            <div className="pt-2">
              <Link 
                href="/signin" 
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h1>
        <p className="text-gray-600">
          Rejoignez HerbisVeritas pour découvrir nos produits bio
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormFields 
          formData={formData}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Création du compte...' : 'Créer mon compte'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link 
            href="/signin" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}