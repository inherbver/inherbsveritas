'use client'

/**
 * Category Navigation - Placeholder Component
 * TODO: Implement real category navigation when ready
 */

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"

export function CategoryNavigation() {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-muted-foreground">Navigation des catégories - À implémenter</p>
      </CardContent>
    </Card>
  )
}

export function CategoryBreadcrumb() {
  return (
    <nav aria-label="Fil d'Ariane">
      <p className="text-sm text-muted-foreground">Accueil / Produits</p>
    </nav>
  )
}

export function CategoryFilter() {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-muted-foreground">Filtre catégories - À implémenter</p>
      </CardContent>
    </Card>
  )
}