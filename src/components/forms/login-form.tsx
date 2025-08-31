/**
 * Login Form - HerbisVeritas V2 MVP
 * 
 * Formulaire de connexion avec validation et intégration Supabase Auth
 */

/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck

"use client"

import { useState } from 'react'
import { useAuthActions } from '@/lib/auth/hooks'
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

interface LoginFormProps {
  redirectTo?: string | undefined
  onSuccess?: () => void
}

export function LoginForm({ redirectTo, onSuccess }: LoginFormProps) {
  const { signIn, loading, error, clearError } = useAuthActions()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors['email'] = 'Email requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors['email'] = 'Format email invalide'
    }
    
    if (!formData.password) {
      errors['password'] = 'Mot de passe requis'
    } else if (formData.password.length < 6) {
      errors['password'] = 'Mot de passe trop court (min. 6 caractères)'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) return
    
    const result = await signIn(formData.email, formData.password, redirectTo)
    
    if (result.success && onSuccess) {
      onSuccess()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Effacer erreur du champ
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error">
            <p className="text-sm font-medium">Erreur de connexion</p>
            <p className="text-sm">{error}</p>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="login-email" required>
            Email
          </Label>
          <Input
            id="login-email"
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
          <Label htmlFor="login-password" required>
            Mot de passe
          </Label>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('password', e.target.value)
            }
            error={formErrors.password}
            required
            autoComplete="current-password"
          />
          {formErrors.password && (
            <p className="text-sm text-red-600">{formErrors.password}</p>
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
              Connexion...
            </span>
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <div className="text-sm">
          <Link 
            href="/auth/reset-password" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        
        <div className="text-sm text-gray-600">
          <span>Pas encore de compte ? </span>
          <Link 
            href="/signup" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            S&apos;inscrire
          </Link>
        </div>
        
        <div className="pt-4 border-t">
          <Button variant="ghost" className="w-full">
            <Link href="/" className="flex items-center justify-center gap-2">
              <span>←</span>
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}