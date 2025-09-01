'use client'

/**
 * Enhanced INCI List Components - Phase BLUE TDD (Refactored)
 * Optimisation performance avec React.memo + useTransition + useCallback
 */

import * as React from 'react';
import { startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, AlertTriangle, Leaf, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inciService, InciIngredient } from '@/lib/inci/inci-service';

export interface InciListCompactProps {
  inciList: string[];
  maxVisible?: number;
  locale?: 'fr' | 'en';
  className?: string;
}

/**
 * Compact INCI List Component with toggle - Memoized
 */
export const InciListCompact = React.memo<InciListCompactProps>(function InciListCompact({
  inciList,
  maxVisible = 3,
  locale = 'fr',
  className
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isPending, startTransitionLocal] = React.useTransition();

  const toggleExpanded = React.useCallback(() => {
    startTransitionLocal(() => {
      setIsExpanded(!isExpanded);
    });
  }, [isExpanded, startTransitionLocal]);

  if (!inciList || inciList.length === 0) {
    return null;
  }

  const visibleIngredients = isExpanded ? inciList : inciList.slice(0, maxVisible);
  const hasMore = inciList.length > maxVisible;

  const parseResult = inciService.parseInciList(inciList);
  const hasAllergens = parseResult.allergens.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Leaf className="h-4 w-4 text-green-600" />
          {locale === 'fr' ? 'Composition INCI' : 'INCI Composition'}
        </h4>
        {hasAllergens && (
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent>
              {locale === 'fr' ? 'Contient des allergènes' : 'Contains allergens'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        {visibleIngredients.map((ingredient, index) => {
          const parsedIngredient = inciService.parseIngredient(ingredient);
          
          return (
            <span key={index}>
              <InciIngredientSpan 
                ingredient={parsedIngredient} 
                locale={locale}
              />
              {index < visibleIngredients.length - 1 && ', '}
            </span>
          );
        })}
        
        {hasMore && !isExpanded && (
          <span className="text-muted-foreground">
            {locale === 'fr' ? ` et ${inciList.length - maxVisible} autres...` : ` and ${inciList.length - maxVisible} more...`}
          </span>
        )}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className={cn("h-8 px-2", isPending && "opacity-70 transition-opacity")}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              {locale === 'fr' ? 'Voir moins' : 'Show less'}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              {locale === 'fr' ? 'Voir plus' : 'Show more'}
            </>
          )}
        </Button>
      )}
    </div>
  );
});

interface InciIngredientSpanProps {
  ingredient: InciIngredient;
  locale: 'fr' | 'en';
}

const InciIngredientSpan = React.memo<InciIngredientSpanProps>(function InciIngredientSpan({ ingredient, locale }) {
  const content = (
    <span className={cn(
      ingredient.isOrganic && "font-medium text-green-700",
      ingredient.isAllergen && "underline decoration-amber-400"
    )}>
      {ingredient.name}
      {ingredient.isOrganic && '*'}
    </span>
  );

  const hasTooltipInfo = ingredient.description || ingredient.function || ingredient.isAllergen;

  if (!hasTooltipInfo) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{ingredient.name}</p>
            
            {ingredient.function && (
              <p className="text-xs text-muted-foreground">
                {locale === 'fr' ? 'Fonction:' : 'Function:'} {ingredient.function}
              </p>
            )}
            
            {ingredient.description && (
              <p className="text-xs">
                {locale === 'fr' ? ingredient.description.fr : ingredient.description.en}
              </p>
            )}
            
            <div className="flex gap-1 flex-wrap">
              {ingredient.isOrganic && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  {locale === 'fr' ? 'Bio' : 'Organic'}
                </Badge>
              )}
              
              {ingredient.isAllergen && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                  {locale === 'fr' ? 'Allergène' : 'Allergen'}
                </Badge>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export interface InciListDetailedProps {
  inciList: string[];
  locale?: 'fr' | 'en';
  showOriginStats?: boolean;
  showComplianceReport?: boolean;
  className?: string;
}

/**
 * Detailed INCI List Component with full analysis - Memoized
 */
export const InciListDetailed = React.memo<InciListDetailedProps>(function InciListDetailed({
  inciList,
  locale = 'fr',
  showOriginStats = true,
  showComplianceReport = true,
  className
}) {
  if (!inciList || inciList.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {locale === 'fr' ? 'Aucune composition INCI disponible' : 'No INCI composition available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const parseResult = inciService.parseInciList(inciList);
  const complianceReport = inciService.generateComplianceReport(parseResult.ingredients, locale);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Leaf className="h-5 w-5 text-green-600" />
          {locale === 'fr' ? 'Composition INCI Détaillée' : 'Detailed INCI Composition'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Ingredients List */}
        <div>
          <h4 className="font-medium mb-3">
            {locale === 'fr' ? 'Ingrédients' : 'Ingredients'} ({parseResult.ingredients.length})
          </h4>
          
          <div className="space-y-2">
            {parseResult.ingredients.map((ingredient, index) => (
              <InciIngredientRow 
                key={index}
                ingredient={ingredient} 
                index={index + 1}
                locale={locale}
              />
            ))}
          </div>
        </div>

        {/* Allergens Warning */}
        {parseResult.allergens.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-900 mb-2">
                  {locale === 'fr' ? 'Allergènes Présents' : 'Allergens Present'}
                </h4>
                <div className="space-y-1">
                  {parseResult.allergens.map((allergen, index) => (
                    <p key={index} className="text-sm text-amber-800">
                      <strong>{allergen.name}</strong> - {
                        locale === 'fr' 
                          ? 'Allergène déclaré selon réglementation UE'
                          : 'Declared allergen according to EU regulation'
                      }
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organic Ingredients */}
        {parseResult.organicIngredients.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Leaf className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 mb-2">
                  {locale === 'fr' ? 'Ingrédients Biologiques' : 'Organic Ingredients'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parseResult.organicIngredients.map((ingredient, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {ingredient.name}*
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Origin Statistics */}
        {showOriginStats && (
          <div>
            <h4 className="font-medium mb-3">
              {locale === 'fr' ? 'Origine des Ingrédients' : 'Ingredient Origins'}
            </h4>
            
            <InciOriginChart 
              stats={complianceReport.originBreakdown} 
              locale={locale}
            />
          </div>
        )}

        {/* Compliance Report */}
        {showComplianceReport && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {locale === 'fr' ? 'Rapport de Conformité' : 'Compliance Report'}
            </h4>
            
            <div className="space-y-3">
              {complianceReport.warnings.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-amber-700">
                    {locale === 'fr' ? 'Avertissements' : 'Warnings'}
                  </h5>
                  {complianceReport.warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                      {warning}
                    </p>
                  ))}
                </div>
              )}

              {complianceReport.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-blue-700">
                    {locale === 'fr' ? 'Recommandations' : 'Recommendations'}
                  </h5>
                  {complianceReport.recommendations.map((rec, index) => (
                    <p key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                      {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2 text-sm">
            {locale === 'fr' ? 'Légende' : 'Legend'}
          </h4>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="font-medium">*</span>
              {locale === 'fr' ? 'Ingrédient biologique' : 'Organic ingredient'}
            </div>
            <div className="flex items-center gap-1">
              <span className="underline decoration-amber-400">souligné</span>
              {locale === 'fr' ? 'Allergène déclaré' : 'Declared allergen'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

interface InciIngredientRowProps {
  ingredient: InciIngredient;
  index: number;
  locale: 'fr' | 'en';
}

const InciIngredientRow = React.memo<InciIngredientRowProps>(function InciIngredientRow({ ingredient, index, locale }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
      <span className="text-xs text-muted-foreground font-mono w-6 flex-shrink-0">
        {index.toString().padStart(2, '0')}
      </span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "font-medium",
            ingredient.isOrganic && "text-green-700"
          )}>
            {ingredient.name}
            {ingredient.isOrganic && '*'}
          </span>
          
          <div className="flex gap-1">
            {ingredient.isAllergen && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                {locale === 'fr' ? 'Allergène' : 'Allergen'}
              </Badge>
            )}
            
            {ingredient.origin && (
              <Badge variant="outline" className="text-xs">
                {ingredient.origin === 'plant' && (locale === 'fr' ? 'Végétal' : 'Plant')}
                {ingredient.origin === 'synthetic' && (locale === 'fr' ? 'Synthétique' : 'Synthetic')}
                {ingredient.origin === 'mineral' && (locale === 'fr' ? 'Minéral' : 'Mineral')}
                {ingredient.origin === 'animal' && (locale === 'fr' ? 'Animal' : 'Animal')}
              </Badge>
            )}
          </div>
        </div>
        
        {ingredient.function && (
          <p className="text-xs text-muted-foreground mb-1">
            <strong>{locale === 'fr' ? 'Fonction:' : 'Function:'}</strong> {ingredient.function}
          </p>
        )}
        
        {ingredient.description && (
          <p className="text-xs text-muted-foreground">
            {locale === 'fr' ? ingredient.description.fr : ingredient.description.en}
          </p>
        )}
      </div>
    </div>
  );
});

interface InciOriginChartProps {
  stats: Record<string, number>;
  locale: 'fr' | 'en';
}

const InciOriginChart = React.memo<InciOriginChartProps>(function InciOriginChart({ stats, locale }) {
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  const originLabels = {
    plant: locale === 'fr' ? 'Végétal' : 'Plant',
    synthetic: locale === 'fr' ? 'Synthétique' : 'Synthetic', 
    mineral: locale === 'fr' ? 'Minéral' : 'Mineral',
    animal: locale === 'fr' ? 'Animal' : 'Animal',
    unknown: locale === 'fr' ? 'Inconnu' : 'Unknown'
  };

  const originColors = {
    plant: 'bg-green-500',
    synthetic: 'bg-blue-500',
    mineral: 'bg-gray-500',
    animal: 'bg-red-500',
    unknown: 'bg-neutral-400'
  };

  return (
    <div className="space-y-3">
      <div className="flex h-4 bg-muted rounded-full overflow-hidden">
        {Object.entries(stats).map(([origin, count]) => {
          if (count === 0) return null;
          const percentage = (count / total) * 100;
          
          return (
            <div
              key={origin}
              className={cn(originColors[origin as keyof typeof originColors], "h-full")}
              style={{ width: `${percentage}%` }}
              title={`${originLabels[origin as keyof typeof originLabels]}: ${count} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
        {Object.entries(stats).map(([origin, count]) => {
          if (count === 0) return null;
          const percentage = ((count / total) * 100).toFixed(1);
          
          return (
            <div key={origin} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", originColors[origin as keyof typeof originColors])} />
              <span className="text-muted-foreground">
                {originLabels[origin as keyof typeof originLabels]}: {count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});