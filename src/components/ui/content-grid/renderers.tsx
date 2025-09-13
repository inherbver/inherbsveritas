/**
 * Composants de rendu pour ContentGrid - États loading/error/empty
 */

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Grid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { contentGridVariants } from "./variants"
import { type VariantProps } from "class-variance-authority"

interface SkeletonRendererProps extends VariantProps<typeof contentGridVariants> {
  loadingCount: number
  customColumnClasses: string
  className?: string
}

/**
 * Rendu skeleton loading
 */
export function SkeletonRenderer({ 
  variant, 
  gap, 
  density, 
  loadingCount, 
  customColumnClasses, 
  className 
}: SkeletonRendererProps) {
  return (
    <div className={cn(
      contentGridVariants({ variant, gap, density }),
      customColumnClasses,
      className
    )}>
      {Array.from({ length: loadingCount }, (_, index) => (
        <Card key={index} className="animate-pulse">
          <div className="aspect-square bg-muted rounded-t-lg" />
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface ErrorRendererProps {
  error: string
  onRetry?: () => void
}

/**
 * Rendu état erreur
 */
export function ErrorRenderer({ error, onRetry }: ErrorRendererProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Réessayer
        </Button>
      )}
    </div>
  )
}

interface EmptyRendererProps {
  message?: string
  title?: string
}

/**
 * Rendu état vide
 */
export function EmptyRenderer({ message, title }: EmptyRendererProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Grid className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {title || "Aucun élément"}
      </h3>
      <p className="text-muted-foreground max-w-md">
        {message || "Aucun élément à afficher pour le moment."}
      </p>
    </div>
  )
}

interface ViewToggleProps {
  currentView: 'grid' | 'list'
  onViewChange?: (view: 'grid' | 'list') => void
}

/**
 * Toggle vue grille/liste
 */
export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  if (!onViewChange) return null

  return (
    <div className="flex items-center space-x-1 border rounded-lg p-1">
      <Button
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="h-8 px-2"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="h-8 px-2"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}