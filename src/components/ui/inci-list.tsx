/**
 * Composant INCI List pour affichage liste ingrédients cosmétiques
 * Conforme réglementation européenne (CE) N°1223/2009
 */

'use client'

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  getInciCommonName,
  getInciFunctions,
  validateInciList,
  INCI_FUNCTION_LABELS,
  InciFunction
} from "@/lib/inci"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Info, AlertTriangle } from "lucide-react"

interface InciListProps {
  /** Liste des noms INCI */
  inciList: string[]
  /** Affichage compact ou complet */
  variant?: 'compact' | 'full'
  /** Afficher les noms communs */
  showCommonNames?: boolean
  /** Afficher les fonctions */
  showFunctions?: boolean
  /** Langue d'affichage */
  locale?: 'fr' | 'en'
  /** Classe CSS personnalisée */
  className?: string
  /** Afficher les avertissements */
  showWarnings?: boolean
}

const FUNCTION_COLORS: Record<InciFunction, string> = {
  'emulsifiant': 'bg-blue-100 text-blue-800',
  'hydratant': 'bg-green-100 text-green-800', 
  'conservateur': 'bg-yellow-100 text-yellow-800',
  'parfum': 'bg-purple-100 text-purple-800',
  'colorant': 'bg-pink-100 text-pink-800',
  'antioxydant': 'bg-emerald-100 text-emerald-800',
  'actif': 'bg-indigo-100 text-indigo-800',
  'tensioactif': 'bg-cyan-100 text-cyan-800',
  'epaississant': 'bg-amber-100 text-amber-800',
  'adoucissant': 'bg-green-100 text-green-800',
  'stabilisant': 'bg-gray-100 text-gray-800',
  'regulateur_ph': 'bg-orange-100 text-orange-800'
}

export function InciList({
  inciList,
  variant = 'compact',
  showCommonNames = true,
  showFunctions = false,
  locale = 'fr',
  className,
  showWarnings = true
}: InciListProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [validation, setValidation] = React.useState<ReturnType<typeof validateInciList> | null>(null)

  // Valider la liste INCI au montage
  React.useEffect(() => {
    if (showWarnings && inciList && inciList.length > 0) {
      setValidation(validateInciList(inciList))
    }
  }, [inciList, showWarnings])

  if (!inciList || inciList.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Liste INCI non disponible
      </div>
    )
  }

  const displayList = variant === 'compact' && !isExpanded 
    ? inciList.slice(0, 5)
    : inciList

  const hasMore = inciList.length > 5 && variant === 'compact'

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        {/* En-tête réglementaire */}
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">Liste INCI :</h4>
          {validation && !validation.valid && (
            <Tooltip>
              <TooltipTrigger>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">Avertissements :</p>
                  {validation.errors.map((error, i) => (
                    <p key={i} className="text-xs text-red-600">• {error}</p>
                  ))}
                  {validation.warnings.map((warning, i) => (
                    <p key={i} className="text-xs text-amber-600">• {warning}</p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Liste des ingrédients */}
        <div className="space-y-1">
          {displayList.map((inciName, index) => {
            const commonName = getInciCommonName(inciName, locale)
            const functions = getInciFunctions(inciName)
            const isAllergen = validation?.warnings.some(w => 
              w.includes(inciName) && w.includes('Allergène')
            )

            return (
              <div key={index} className="flex flex-wrap items-start gap-2 text-sm">
                {/* Nom INCI (obligatoire) */}
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {inciName}
                  {isAllergen && (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="inline h-3 w-3 ml-1 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Allergène potentiel</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </span>

                {/* Nom commun */}
                {showCommonNames && commonName !== inciName && (
                  <span className="text-muted-foreground">
                    ({commonName})
                  </span>
                )}

                {/* Fonctions */}
                {showFunctions && functions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {functions.map((func) => (
                      <Badge
                        key={func}
                        variant="outline"
                        className={cn(
                          "text-xs px-1 py-0",
                          FUNCTION_COLORS[func]
                        )}
                      >
                        {INCI_FUNCTION_LABELS[func][locale]}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bouton "Voir plus/moins" */}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-1 text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Voir moins ({inciList.length - 5} masqués)
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Voir tous les ingrédients (+{inciList.length - 5})
              </>
            )}
          </Button>
        )}

        {/* Note réglementaire */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <p>
            Ingrédients listés par ordre décroissant de concentration selon la réglementation européenne (CE) N°1223/2009.
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}

// Version simplifiée pour ProductCard
export function InciListCompact({
  inciList,
  className
}: {
  inciList: string[]
  className?: string
}) {
  if (!inciList || inciList.length === 0) return null

  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      <span className="font-medium">INCI:</span>{' '}
      {inciList.slice(0, 3).join(', ')}
      {inciList.length > 3 && (
        <span className="font-medium"> (+{inciList.length - 3})</span>
      )}
    </div>
  )
}