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

// Composants UI temporaires - À remplacer par shadcn/ui
function Button({ children, variant = 'default', disabled = false, type = 'button', className = '', ...props }: any) {
  const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variantClasses: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  }
  
  return (
    <button 
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function Input({ error, ...props }: any) {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
  const errorClasses = error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
  
  return (
    <input 
      className={`${baseClasses} ${errorClasses}`}
      {...props} 
    />
  )
}

function Label({ children, htmlFor, required = false }: any) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

function Alert({ children, variant = 'info' }: { children: React.ReactNode, variant?: 'info' | 'error' | 'success' | 'warning' }) {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800'
  }
  
  return (
    <div className={`border rounded-lg p-3 ${variantClasses[variant]}`}>
      {children}
    </div>
  )
}

interface SignupFormProps {
  onSuccess?: (needsConfirmation: boolean) => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { signUp, loading, error, clearError } = useAuthActions()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = 'Email requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email invalide'
    }
    
    if (!formData.password) {
      errors.password = 'Mot de passe requis'
    } else if (formData.password.length < 8) {
      errors.password = 'Mot de passe trop court (min. 8 caractères)'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmation du mot de passe requise'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'Prénom requis'
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'Prénom trop court (min. 2 caractères)'
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Nom requis'
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Nom trop court (min. 2 caractères)'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) return
    
    const metadata = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      // Rôle par défaut sera &apos;user&apos; (défini en base)
    }
    
    const result = await signUp(formData.email, formData.password, metadata)
    
    if (result.success) {
      setShowSuccess(true)
      if (onSuccess) {
        onSuccess(result.needsEmailConfirmation || false)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Effacer erreur du champ
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (showSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <Alert variant="success">
          <div className="space-y-2">
            <p className="text-sm font-medium">✅ Compte créé avec succès !</p>
            <p className="text-sm">
              Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
              Cliquez sur le lien dans l&apos;email pour activer votre compte.
            </p>
          </div>
        </Alert>
        
        <div className="mt-6 space-y-4">
          <Button className="w-full">
            <Link href="/login">
              Aller à la page de connexion
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full">
            <Link href="/">
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error">
            <p className="text-sm font-medium">Erreur d&apos;inscription</p>
            <p className="text-sm">{error}</p>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signup-firstName" required>
              Prénom
            </Label>
            <Input
              id="signup-firstName"
              type="text"
              placeholder="Jean"
              value={formData.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleInputChange('firstName', e.target.value)
              }
              error={formErrors.firstName}
              required
              autoComplete="given-name"
            />
            {formErrors.firstName && (
              <p className="text-sm text-red-600">{formErrors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-lastName" required>
              Nom
            </Label>
            <Input
              id="signup-lastName"
              type="text"
              placeholder="Dupont"
              value={formData.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleInputChange('lastName', e.target.value)
              }
              error={formErrors.lastName}
              required
              autoComplete="family-name"
            />
            {formErrors.lastName && (
              <p className="text-sm text-red-600">{formErrors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" required>
            Email
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('email', e.target.value)
            }
            error={formErrors.email}
            required
            autoComplete="email"
          />
          {formErrors.email && (
            <p className="text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" required>
            Mot de passe
          </Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('password', e.target.value)
            }
            error={formErrors.password}
            required
            autoComplete="new-password"
          />
          {formErrors.password && (
            <p className="text-sm text-red-600">{formErrors.password}</p>
          )}
          <p className="text-xs text-gray-600">
            Au moins 8 caractères avec majuscule, minuscule et chiffre
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-confirmPassword" required>
            Confirmer le mot de passe
          </Label>
          <Input
            id="signup-confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('confirmPassword', e.target.value)
            }
            error={formErrors.confirmPassword}
            required
            autoComplete="new-password"
          />
          {formErrors.confirmPassword && (
            <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Création du compte...
            </span>
          ) : (
            'Créer mon compte'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <div className="text-sm text-gray-600">
          <span>Déjà un compte ? </span>
          <Link 
            href="/login" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Se connecter
          </Link>
        </div>
        
        <div className="pt-4 border-t">
          <Button variant="ghost" className="w-full">
            <Link href="/" className="flex items-center justify-center gap-2">
              <span>←</span>
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}