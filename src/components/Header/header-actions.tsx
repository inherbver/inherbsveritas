'use client'

/**
 * @file HeaderActions - Actions du header (compte, panier, menu)
 */

import Link from "next/link"
import { ShoppingBag, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeaderActionsProps {
  user?: any
  cartItemsCount: number
  isMenuOpen: boolean
  onToggleMenu: () => void
  locale?: string
}

export function HeaderActions({ 
  user, 
  cartItemsCount, 
  isMenuOpen, 
  onToggleMenu, 
  locale = 'fr' 
}: HeaderActionsProps) {
  return (
    <section className="flex items-center space-x-3" aria-label="Actions utilisateur">
      {/* Compte utilisateur */}
      <Link 
        href={user ? '/profile' : '/login'}
        aria-label={locale === 'en' ? 'Account' : 'Compte'}
      >
        <Button variant="ghost" size="sm">
          <User className="w-5 h-5" />
        </Button>
      </Link>

      {/* Panier */}
      <Link 
        href="/cart" 
        className="relative"
        aria-label={`${locale === 'en' ? 'Shopping cart' : 'Panier'} ${cartItemsCount > 0 ? `- ${cartItemsCount} articles` : ''}`}
      >
        <Button variant="ghost" size="sm">
          <ShoppingBag className="w-5 h-5" />
          {cartItemsCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs p-0"
            >
              {cartItemsCount > 99 ? '99+' : cartItemsCount}
            </Badge>
          )}
        </Button>
      </Link>

      {/* Menu hamburger mobile */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleMenu}
        className="lg:hidden"
        aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
    </section>
  )
}