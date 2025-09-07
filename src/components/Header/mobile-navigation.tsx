'use client'

/**
 * @file MobileNavigation - Navigation mobile du header
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NavigationItem {
  label: string
  href: string
}

interface MobileNavigationProps {
  items: NavigationItem[]
  user?: any
  cartItemsCount: number
  locale?: string
  onItemClick: () => void
  className?: string
}

export function MobileNavigation({ 
  items, 
  user, 
  cartItemsCount, 
  locale = 'fr', 
  onItemClick,
  className 
}: MobileNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("lg:hidden mt-4 border-t border-gray-200 pt-4", className)} aria-label="Navigation mobile">
      <section className="grid gap-1">
        {items?.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href || pathname.startsWith(item.href)
                ? "bg-green-50 text-green-600 font-semibold"
                : "text-gray-700 hover:bg-gray-50"
            )}
            onClick={onItemClick}
          >
            {item.label}
          </Link>
        ))}
      </section>

      {/* Actions supplémentaires en mobile */}
      <section className="mt-4 pt-4 border-t border-gray-200 grid gap-2" aria-label="Actions utilisateur mobile">
        <Link 
          href={user ? '/profile' : '/login'}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          onClick={onItemClick}
        >
          <User className="w-5 h-5" />
          {user ? 'Mon Compte' : 'Connexion'}
        </Link>
        <Link 
          href="/cart"
          className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          onClick={onItemClick}
        >
          <address className="flex items-center gap-3 not-italic">
            <ShoppingBag className="w-5 h-5" />
            {locale === 'en' ? 'Shopping Cart' : 'Mon Panier'}
          </address>
          {cartItemsCount > 0 && (
            <Badge variant="secondary">{cartItemsCount}</Badge>
          )}
        </Link>
      </section>
    </nav>
  )
}