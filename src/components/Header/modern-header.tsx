'use client'

/**
 * @file ModernHeader - Header moderne refactorisé selon CLAUDE.md
 * @description Header e-commerce composé de sous-composants
 */

import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeaderLogo } from "./header-logo"
import { HeaderNavigation } from "./header-navigation"
import { HeaderSearch, HeaderSearchMobile } from "./header-search"
import { HeaderActions } from "./header-actions"
import { MobileNavigation } from "./mobile-navigation"
import { useSupabase } from '@/lib/supabase/hooks/use-supabase'
import { useCartStore } from '@/features/cart'
import { cn } from "@/lib/utils"

interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

interface ModernHeaderProps {
  className?: string
  locale?: string
}

// Navigation principale adaptée à HerbisVeritas
const NAVIGATION_ITEMS: Record<string, NavigationItem[]> = {
  fr: [
    { label: 'Boutique', href: '/shop' },
    { label: 'Visage', href: '/shop?category=visage' },
    { label: 'Corps', href: '/shop?category=corps' },
    { label: 'Cheveux', href: '/shop?category=cheveux' },
    { label: 'Labels Bio', href: '/labels' },
    { label: 'Artisans', href: '/artisans' },
    { label: 'Conseils', href: '/blog' }
  ],
  en: [
    { label: 'Shop', href: '/shop' },
    { label: 'Face', href: '/shop?category=face' },
    { label: 'Body', href: '/shop?category=body' },
    { label: 'Hair', href: '/shop?category=hair' },
    { label: 'Organic Labels', href: '/labels' },
    { label: 'Artisans', href: '/artisans' },
    { label: 'Tips', href: '/blog' }
  ]
}

export function ModernHeader({ className, locale = 'fr' }: ModernHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  const { user } = useSupabase()
  const cartItemsCount = useCartStore((state) => state.itemCount)

  const navigationItems = NAVIGATION_ITEMS[locale] || NAVIGATION_ITEMS['fr']

  // Gestion du scroll pour header sticky
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm" 
          : "bg-white",
        className
      )}
      role="banner"
      aria-label="Navigation principale HerbisVeritas"
    >
      {/* Barre d'annonce */}
      <aside className="bg-green-600 text-white py-2 px-4 text-center text-sm" role="banner">
        <p>
          {locale === 'en' 
            ? '🚚 Free shipping from €45 • 🌿 Certified organic cosmetics from Occitanie'
            : '🚚 Livraison offerte dès 45€ • 🌿 Cosmétiques bio certifiés d\'Occitanie'
          }
        </p>
      </aside>

      {/* Header principal */}
      <section className="container mx-auto px-4 py-4">
        <header className="flex items-center justify-between">
          {/* Logo */}
          <address className="flex-shrink-0 not-italic">
            <HeaderLogo sticky={isScrolled} />
          </address>

          {/* Navigation desktop */}
          <HeaderNavigation items={navigationItems || []} />

          {/* Actions : Recherche, Compte, Panier */}
          <aside className="flex items-center space-x-3">
            {/* Recherche desktop */}
            <HeaderSearch 
              locale={locale}
              isOpen={isSearchOpen}
              onToggle={toggleSearch}
              className="hidden md:block relative"
            />

            {/* Recherche mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSearch}
              className="md:hidden"
              aria-label={locale === 'en' ? 'Search' : 'Recherche'}
            >
              <Search className="w-5 h-5" />
            </Button>

            <HeaderActions 
              user={user}
              cartItemsCount={cartItemsCount}
              isMenuOpen={isMenuOpen}
              onToggleMenu={toggleMenu}
              locale={locale}
            />
          </aside>
        </header>

        {/* Barre de recherche mobile */}
        <HeaderSearchMobile 
          locale={locale}
          isOpen={isSearchOpen}
          className="md:hidden mt-4 border-t border-gray-200 pt-4"
        />

        {/* Navigation mobile */}
        {isMenuOpen && (
          <MobileNavigation 
            items={navigationItems || []}
            user={user}
            cartItemsCount={cartItemsCount}
            locale={locale}
            onItemClick={() => setIsMenuOpen(false)}
          />
        )}
      </section>
    </header>
  )
}