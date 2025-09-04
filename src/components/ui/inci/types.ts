export interface InciListCompactProps {
  inciList: string[];
  maxVisible?: number;
  locale?: 'fr' | 'en';
  className?: string;
}

export interface InciIngredientBadgeProps {
  ingredient: string;
  type?: 'allergen' | 'natural' | 'normal';
  showTooltip?: boolean;
  locale?: 'fr' | 'en';
  className?: string;
}

export interface InciExpandToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
  remainingCount: number;
  isPending?: boolean;
  locale?: 'fr' | 'en';
}