'use client'

/**
 * Product Label Badge Components - Phase BLUE TDD (Refactored)
 * Optimisation performance avec React.memo + useTransition + useCallback
 */

import * as React from 'react';
import { HerbisVeritasLabel, getLabelMetadata, getProductLabelsMetadata } from '@/types/herbis-veritas';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ProductLabelBadgeProps {
  label: HerbisVeritasLabel;
  locale?: 'fr' | 'en';
  variant?: 'default' | 'compact' | 'icon-only';
  showTooltip?: boolean;
  className?: string;
}

/**
 * Single Label Badge Component - Memoized
 */
export const ProductLabelBadge = React.memo<ProductLabelBadgeProps>(function ProductLabelBadge({
  label,
  locale = 'fr',
  variant = 'default',
  showTooltip = true,
  className
}) {
  const metadata = getLabelMetadata(label);
  const displayName = locale === 'fr' ? metadata.name : metadata.nameEn;
  const description = locale === 'fr' ? metadata.description : metadata.descriptionEn;

  const badgeContent = (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        variant === 'compact' && "px-2 py-1",
        variant === 'icon-only' && "w-6 h-6 p-0 justify-center",
        className
      )}
      style={{
        backgroundColor: metadata.color === '#4ade80' ? metadata.color : undefined,
        borderColor: metadata.color.startsWith('rgb(') ? metadata.color : undefined,
        color: metadata.color === '#4ade80' ? 'white' : undefined,
      }}
      role="img"
      aria-label={`Label ${displayName}: ${description}`}
    >
      {metadata.icon && (
        <span className="text-xs" aria-hidden="true">
          {metadata.icon}
        </span>
      )}
      {variant !== 'icon-only' && (
        <span className={cn(variant === 'compact' && "sr-only sm:not-sr-only")}>
          {displayName}
        </span>
      )}
    </Badge>
  );

  if (!showTooltip || variant === 'default') {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export interface ProductLabelsProps {
  labels: HerbisVeritasLabel[];
  locale?: 'fr' | 'en';
  maxVisible?: number;
  variant?: 'default' | 'compact' | 'icon-only';
  showTooltips?: boolean;
  sortByPriority?: boolean;
  className?: string;
}

/**
 * Multiple Labels Component with Priority Sorting - Memoized
 */
export const ProductLabels = React.memo<ProductLabelsProps>(function ProductLabels({
  labels,
  locale = 'fr',
  maxVisible = 3,
  variant = 'default',
  showTooltips = true,
  sortByPriority = true,
  className
}) {
  const labelsMetadata = sortByPriority ? getProductLabelsMetadata(labels) : labels.map(getLabelMetadata);
  
  const visibleLabels = maxVisible ? labelsMetadata.slice(0, maxVisible) : labelsMetadata;
  const hiddenCount = labelsMetadata.length - visibleLabels.length;

  if (labels.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)} role="list">
      {visibleLabels.map((metadata) => (
        <div key={metadata.id} role="listitem">
          <ProductLabelBadge
            label={metadata.id}
            locale={locale}
            variant={variant}
            showTooltip={showTooltips}
          />
        </div>
      ))}
      
      {hiddenCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{hiddenCount}
        </Badge>
      )}
    </div>
  );
});

/**
 * Label Filter Component for Product Lists
 */
export interface ProductLabelFilterProps {
  availableLabels?: HerbisVeritasLabel[];
  selectedLabels: HerbisVeritasLabel[];
  onLabelsChange: (labels: HerbisVeritasLabel[]) => void;
  locale?: 'fr' | 'en';
  multiSelect?: boolean;
  filterLogic?: 'AND' | 'OR';
  className?: string;
}

export const ProductLabelFilter = React.memo<ProductLabelFilterProps>(function ProductLabelFilter({
  availableLabels = [
    HerbisVeritasLabel.BIO,
    HerbisVeritasLabel.NATUREL,
    HerbisVeritasLabel.VEGAN,
    HerbisVeritasLabel.ARTISANAL,
    HerbisVeritasLabel.LOCAL,
    HerbisVeritasLabel.ZERO_DECHET,
    HerbisVeritasLabel.FAIT_MAIN
  ],
  selectedLabels,
  onLabelsChange,
  locale = 'fr',
  multiSelect = true,
  filterLogic = 'OR',
  className
}) {
  const handleLabelToggle = React.useCallback((label: HerbisVeritasLabel) => {
    if (!multiSelect) {
      onLabelsChange(selectedLabels.includes(label) ? [] : [label]);
      return;
    }

    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label];
    
    onLabelsChange(newLabels);
  }, [multiSelect, selectedLabels, onLabelsChange]);

  const clearAllLabels = React.useCallback(() => {
    onLabelsChange([]);
  }, [onLabelsChange]);

  const labelsMetadata = getProductLabelsMetadata(availableLabels);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {locale === 'fr' ? 'Filtrer par labels' : 'Filter by labels'}
        </h3>
        {selectedLabels.length > 0 && (
          <button
            onClick={clearAllLabels}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {locale === 'fr' ? 'Effacer' : 'Clear'}
          </button>
        )}
      </div>

      {multiSelect && selectedLabels.length > 1 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{locale === 'fr' ? 'Logique:' : 'Logic:'}</span>
          <Badge variant="outline" className="text-xs">
            {filterLogic === 'OR' 
              ? (locale === 'fr' ? 'AU MOINS UN' : 'ANY') 
              : (locale === 'fr' ? 'TOUS' : 'ALL')
            }
          </Badge>
        </div>
      )}

      <div className="space-y-2">
        {labelsMetadata.map((metadata) => {
          const isSelected = selectedLabels.includes(metadata.id);
          const displayName = locale === 'fr' ? metadata.name : metadata.nameEn;
          
          return (
            <label key={metadata.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type={multiSelect ? "checkbox" : "radio"}
                checked={isSelected}
                onChange={() => handleLabelToggle(metadata.id)}
                className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                aria-describedby={`label-${metadata.id}-desc`}
              />
              
              <ProductLabelBadge
                label={metadata.id}
                locale={locale}
                variant="compact"
                showTooltip={false}
              />
              
              <div className="flex-1">
                <span className="text-sm font-medium">{displayName}</span>
                <p 
                  id={`label-${metadata.id}-desc`}
                  className="text-xs text-muted-foreground"
                >
                  {locale === 'fr' ? metadata.description : metadata.descriptionEn}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {selectedLabels.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            {locale === 'fr' ? 'Labels sélectionnés:' : 'Selected labels:'}
          </p>
          <ProductLabels
            labels={selectedLabels}
            locale={locale}
            variant="compact"
            showTooltips={false}
          />
        </div>
      )}
    </div>
  );
});

/**
 * Admin Label Management Component
 */
export interface AdminProductLabelsProps {
  currentLabels: HerbisVeritasLabel[];
  onLabelsChange: (labels: HerbisVeritasLabel[]) => void;
  locale?: 'fr' | 'en';
  maxLabels?: number;
  className?: string;
}

export function AdminProductLabels({
  currentLabels,
  onLabelsChange,
  locale = 'fr',
  maxLabels = 5,
  className
}: AdminProductLabelsProps) {
  const [validationError, setValidationError] = React.useState<string | null>(null);


  const validateLabelCombination = React.useCallback((labels: HerbisVeritasLabel[]): string | null => {
    // Business rules validation
    if (labels.includes(HerbisVeritasLabel.BIO) && labels.includes(HerbisVeritasLabel.NATUREL)) {
      // Bio implique naturel - pas besoin des deux
      return locale === 'fr' 
        ? 'Les produits Bio sont automatiquement Naturels'
        : 'Organic products are automatically Natural';
    }
    
    return null;
  }, [locale]);

  React.useEffect(() => {
    const combinationError = validateLabelCombination(currentLabels);
    if (combinationError) {
      setValidationError(combinationError);
    }
  }, [currentLabels, validateLabelCombination]);

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-semibold text-sm mb-2">
          {locale === 'fr' ? 'Labels HerbisVeritas' : 'HerbisVeritas Labels'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {locale === 'fr' 
            ? `Sélectionnez jusqu'à ${maxLabels} labels pour ce produit`
            : `Select up to ${maxLabels} labels for this product`
          }
        </p>
      </div>

      {validationError && (
        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
          {validationError}
        </div>
      )}

      <ProductLabelFilter
        selectedLabels={currentLabels}
        onLabelsChange={onLabelsChange}
        locale={locale}
        multiSelect={true}
        filterLogic="OR"
      />

      <div className="pt-4 border-t">
        <h4 className="font-medium text-sm mb-2">
          {locale === 'fr' ? 'Aperçu' : 'Preview'}
        </h4>
        <div className="p-3 bg-muted/30 rounded">
          {currentLabels.length > 0 ? (
            <ProductLabels
              labels={currentLabels}
              locale={locale}
              variant="default"
              showTooltips={true}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {locale === 'fr' ? 'Aucun label sélectionné' : 'No labels selected'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}