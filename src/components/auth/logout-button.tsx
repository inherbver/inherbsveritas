/**
 * Logout Button - HerbisVeritas V2 MVP
 * 
 * Bouton de déconnexion avec confirmation et gestion d'état
 */

// @ts-nocheck

"use client"

import { useState } from 'react'
import { useAuthActions } from '@/lib/auth/hooks/use-auth-actions'

interface LogoutButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  showConfirmation?: boolean
}

// Composant UI temporaire Button
function Button({ children, variant = 'default', disabled = false, className = '', ...props }: any) {
  const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variantClasses: Record<string, string> = {
    default: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border border-red-300 bg-white text-red-700 hover:bg-red-50 focus:ring-red-500',
    ghost: 'text-red-700 hover:bg-red-50 focus:ring-red-500'
  }
  
  return (
    <button 
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function LogoutButton({ 
  children = 'Se déconnecter', 
  className = '', 
  variant = 'ghost',
  showConfirmation = true 
}: LogoutButtonProps) {
  const { signOut, loading } = useAuthActions()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    if (showConfirmation && !showConfirm) {
      setShowConfirm(true)
      return
    }
    
    handleLogout()
  }

  const handleLogout = async () => {
    await signOut()
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="relative">
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <p className="text-sm text-gray-700 mb-3">
            Êtes-vous sûr de vouloir vous déconnecter ?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <Button
              onClick={handleLogout}
              disabled={loading}
              variant="default"
              className="px-3 py-1 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></span>
                  Déconnexion...
                </span>
              ) : (
                'Déconnexion'
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
          Déconnexion...
        </span>
      ) : (
        children
      )}
    </Button>
  )
}

// Version simple sans confirmation
export function SimpleLogoutButton({ children = 'Se déconnecter', className = '', variant = 'ghost' }: LogoutButtonProps) {
  const { signOut, loading } = useAuthActions()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
          Déconnexion...
        </span>
      ) : (
        children
      )}
    </Button>
  )
}

export default LogoutButton