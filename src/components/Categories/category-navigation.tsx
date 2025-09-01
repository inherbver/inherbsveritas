'use client'

/**
 * CategoryNavigation Component - Phase BLUE TDD (Refactored)
 * Optimisation performance avec React.memo + useTransition
 */

import * as React from 'react';
import { startTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CategoryTree, getLocalizedCategory } from '@/types/herbis-veritas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryNavigationProps {
  categories: CategoryTree[];
  locale?: 'fr' | 'en';
  activeCategoryId?: string;
  onCategorySelect?: (category: CategoryTree) => void;
  showProductCount?: boolean;
  className?: string;
  variant?: 'sidebar' | 'horizontal' | 'mobile';
}

export const CategoryNavigation = React.memo<CategoryNavigationProps>(function CategoryNavigation({
  categories,
  locale = 'fr',
  activeCategoryId,
  onCategorySelect,
  showProductCount = false,
  className,
  variant = 'sidebar'
}) {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isPending, startTransitionLocal] = React.useTransition();

  // Auto-expand path to active category
  React.useEffect(() => {
    if (activeCategoryId) {
      const expandPath = (categories: CategoryTree[], targetId: string, path: Set<string> = new Set()): boolean => {
        for (const category of categories) {
          const newPath = new Set(path);
          newPath.add(category.id);

          if (category.id === targetId) {
            setExpandedCategories(newPath);
            return true;
          }

          if (category.children && category.children.length > 0) {
            if (expandPath(category.children, targetId, newPath)) {
              return true;
            }
          }
        }
        return false;
      };

      expandPath(categories, activeCategoryId);
    }
  }, [activeCategoryId, categories]);

  const toggleExpanded = React.useCallback((categoryId: string) => {
    startTransitionLocal(() => {
      const newExpanded = new Set(expandedCategories);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      setExpandedCategories(newExpanded);
    });
  }, [expandedCategories, startTransitionLocal]);

  const handleCategoryClick = React.useCallback((category: CategoryTree) => {
    startTransitionLocal(() => {
      if (onCategorySelect) {
        onCategorySelect(category);
      } else {
        router.push(`/categories/${category.slug}`);
      }
    });
  }, [onCategorySelect, router, startTransitionLocal]);

  const renderCategoryItem = (category: CategoryTree, level = 0) => {
    const localized = getLocalizedCategory(category, locale);
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isActive = category.id === activeCategoryId;

    return (
      <div key={category.id} className="category-item">
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-primary text-primary-foreground",
            level > 0 && `ml-${level * 4}`,
            isPending && "opacity-70 transition-opacity"
          )}
          style={{ marginLeft: level * 16 }}
          onClick={() => handleCategoryClick(category)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(category.id);
              }}
              aria-label={isExpanded ? 'Réduire' : 'Développer'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-6" />}

          <span className="flex-1 text-sm font-medium">
            {localized.name}
          </span>

          {showProductCount && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              0 {/* TODO: Implement product count */}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="category-children">
            {category.children!.map(child => 
              renderCategoryItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const navigationContent = (
    <nav 
      role="navigation" 
      aria-label={`Categories navigation in ${locale === 'fr' ? 'French' : 'English'}`}
      className="category-navigation"
    >
      <div className="space-y-1">
        {categories.map(category => renderCategoryItem(category))}
      </div>
    </nav>
  );

  if (variant === 'mobile') {
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-categories-menu"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Categories
        </Button>

        {isMobileMenuOpen && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50">
            <CardContent className="p-4">
              <div id="mobile-categories-menu">
                {navigationContent}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {categories.map(category => {
          const localized = getLocalizedCategory(category, locale);
          const isActive = category.id === activeCategoryId;
          
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(category)}
              className="flex items-center gap-2"
            >
              {localized.name}
              {showProductCount && (
                <span className="text-xs bg-muted text-muted-foreground px-1 py-0.5 rounded">
                  0
                </span>
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  // Default sidebar variant
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-4">
          {locale === 'fr' ? 'Catégories' : 'Categories'}
        </h3>
        {navigationContent}
      </CardContent>
    </Card>
  );
});

/**
 * CategoryBreadcrumb Component
 */
export interface CategoryBreadcrumbProps {
  category: CategoryTree;
  categories: CategoryTree[];
  locale?: 'fr' | 'en';
  onCategoryClick?: (category: CategoryTree) => void;
  className?: string;
}

export const CategoryBreadcrumb = React.memo<CategoryBreadcrumbProps>(function CategoryBreadcrumb({
  category,
  categories,
  locale = 'fr',
  onCategoryClick,
  className
}) {
  const buildBreadcrumbPath = (targetCategory: CategoryTree): CategoryTree[] => {
    const path: CategoryTree[] = [];
    
    const findPath = (cats: CategoryTree[], target: CategoryTree, currentPath: CategoryTree[] = []): boolean => {
      for (const cat of cats) {
        const newPath = [...currentPath, cat];
        
        if (cat.id === target.id) {
          path.push(...newPath);
          return true;
        }
        
        if (cat.children && cat.children.length > 0) {
          if (findPath(cat.children, target, newPath)) {
            return true;
          }
        }
      }
      return false;
    };

    findPath(categories, targetCategory);
    return path;
  };

  const breadcrumbPath = buildBreadcrumbPath(category);

  return (
    <nav 
      aria-label="Category breadcrumb" 
      className={cn("flex items-center space-x-2 text-sm", className)}
    >
      <Link href="/categories" className="text-muted-foreground hover:text-foreground">
        {locale === 'fr' ? 'Accueil' : 'Home'}
      </Link>
      
      {breadcrumbPath.map((cat, index) => {
        const localized = getLocalizedCategory(cat, locale);
        const isLast = index === breadcrumbPath.length - 1;
        
        return (
          <React.Fragment key={cat.id}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium" aria-current="page">
                {localized.name}
              </span>
            ) : (
              <button
                onClick={() => onCategoryClick?.(cat)}
                className="text-muted-foreground hover:text-foreground"
              >
                {localized.name}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
});

/**
 * CategoryFilter Component
 */
export interface CategoryFilterProps {
  categories: CategoryTree[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  onClearAll: () => void;
  locale?: 'fr' | 'en';
  maxVisible?: number;
  className?: string;
}

export const CategoryFilter = React.memo<CategoryFilterProps>(function CategoryFilter({
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearAll,
  locale = 'fr',
  maxVisible = 5,
  className
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const visibleCategories = isExpanded ? categories : categories.slice(0, maxVisible);
  const hasMore = categories.length > maxVisible;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            {locale === 'fr' ? 'Filtrer par catégorie' : 'Filter by category'}
          </h3>
          {selectedCategories.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              {locale === 'fr' ? 'Tout effacer' : 'Clear all'}
              {selectedCategories.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {selectedCategories.length}
                </span>
              )}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {visibleCategories.map(category => {
            const localized = getLocalizedCategory(category, locale);
            const isSelected = selectedCategories.includes(category.id);
            
            return (
              <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onCategoryToggle(category.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm">{localized.name}</span>
              </label>
            );
          })}
        </div>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-4"
          >
            {isExpanded 
              ? (locale === 'fr' ? 'Voir moins' : 'Show less')
              : (locale === 'fr' ? `Voir ${categories.length - maxVisible} de plus` : `Show ${categories.length - maxVisible} more`)
            }
          </Button>
        )}
      </CardContent>
    </Card>
  );
});