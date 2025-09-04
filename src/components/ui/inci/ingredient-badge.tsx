'use client'

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { inciService } from '@/lib/inci/inci-service'; // TODO: Re-enable when service is ready
import type { InciIngredientBadgeProps } from './types';

/**
 * Individual ingredient badge with tooltip - Memoized
 */
export const InciIngredientBadge = React.memo<InciIngredientBadgeProps>(
  function InciIngredientBadge({
    ingredient,
    showTooltip = true,
    locale = 'fr',
    className
  }) {
    // Placeholder logic - to implement with real inciService
    const ingredientData = null;
    const isAllergen = false;
    const isNatural = false;

    const badgeVariant = React.useMemo(() => {
      if (isAllergen) return 'destructive';
      if (isNatural) return 'secondary';
      return 'outline';
    }, [isAllergen, isNatural]);

    const badgeContent = (
      <Badge 
        variant={badgeVariant}
        className={cn(
          'text-xs',
          isAllergen && 'border-red-300',
          isNatural && 'border-green-300',
          className
        )}
      >
        {isAllergen && <AlertTriangle className="w-3 h-3 mr-1" />}
        {isNatural && !isAllergen && <Leaf className="w-3 h-3 mr-1" />}
        {ingredient}
      </Badge>
    );

    if (!showTooltip || !ingredientData) {
      return badgeContent;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{ingredient}</p>
              {/* TODO: Add ingredient function when data available */}
              {isAllergen && (
                <p className="text-sm text-red-600 font-medium">
                  {locale === 'fr' ? 'Allergène potentiel' : 'Potential allergen'}
                </p>
              )}
              {isNatural && (
                <p className="text-sm text-green-600">
                  {locale === 'fr' ? 'Origine naturelle' : 'Natural origin'}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);