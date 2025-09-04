'use client'

import * as React from "react"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface SearchFilterProps {
  value?: string
  onSearchChange?: (search: string) => void
  placeholder?: string
  className?: string
}

/**
 * Filtre de recherche textuelle
 */
export function SearchFilter({ 
  value = '', 
  onSearchChange, 
  placeholder,
  className 
}: SearchFilterProps) {
  const t = useTranslations('shop.filters')
  const [searchValue, setSearchValue] = useState(value)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange?.(searchValue.trim())
  }

  const handleClearSearch = () => {
    setSearchValue('')
    onSearchChange?.('')
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={placeholder || t('search.placeholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="sm" className="w-full">
            {t('search.button')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}