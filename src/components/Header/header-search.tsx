'use client'

/**
 * @file HeaderSearch - Composant de recherche du header
 */

import * as React from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderSearchProps {
  locale?: string
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function HeaderSearch({ locale = 'fr', isOpen, onToggle, className }: HeaderSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <section className={className} aria-label="Recherche produits">
      {isOpen ? (
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <Input
            type="search"
            placeholder={locale === 'en' ? 'Search products...' : 'Rechercher des produits...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pr-10"
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="absolute right-2 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label={locale === 'en' ? 'Open search' : 'Ouvrir la recherche'}
        >
          <Search className="w-5 h-5" />
        </Button>
      )}
    </section>
  )
}

interface HeaderSearchMobileProps {
  locale?: string
  isOpen: boolean
  className?: string
}

export function HeaderSearchMobile({ locale = 'fr', isOpen, className }: HeaderSearchMobileProps) {
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  if (!isOpen) return null

  return (
    <section className={className} aria-label="Recherche mobile">
      <form onSubmit={handleSearchSubmit}>
        <fieldset className="flex gap-2">
          <Input
            type="search"
            placeholder={locale === 'en' ? 'Search products...' : 'Rechercher des produits...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <Search className="w-4 h-4" />
          </Button>
        </fieldset>
      </form>
    </section>
  )
}