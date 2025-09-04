'use client'

/**
 * Lazy Category Navigation - Dynamic Import Optimization  
 * Heavy hierarchical component loaded only when needed
 */

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Menu } from 'lucide-react';

// Dynamic import with skeleton fallback
const CategoryNavigation = dynamic(
  () => import('@/components/categories/category-navigation').then(mod => ({ default: mod.CategoryNavigation })),
  {
    ssr: false,
    loading: () => <CategoryNavigationSkeleton />
  }
);

const CategoryBreadcrumb = dynamic(
  () => import('@/components/categories/category-navigation').then(mod => ({ default: mod.CategoryBreadcrumb })),
  {
    ssr: false,
    loading: () => <BreadcrumbSkeleton />
  }
);

const CategoryFilter = dynamic(
  () => import('@/components/categories/category-navigation').then(mod => ({ default: mod.CategoryFilter })),
  {
    ssr: false,
    loading: () => <CategoryFilterSkeleton />
  }
);

function CategoryNavigationSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Menu className="h-5 w-5" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        <div className="space-y-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2 p-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-8 rounded-full ml-auto" />
              </div>
              {/* Nested children for some items */}
              {i % 3 === 0 && (
                <div className="ml-6 space-y-1">
                  <div className="flex items-center gap-2 p-2">
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-2 p-2">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BreadcrumbSkeleton() {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-24" />
    </nav>
  );
}

function CategoryFilterSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        
        <Skeleton className="h-8 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

// Re-export avec lazy loading
export { CategoryNavigation, CategoryBreadcrumb, CategoryFilter };
// Types à définir selon les besoins futurs
export type CategoryNavigationProps = {}
export type CategoryBreadcrumbProps = {}  
export type CategoryFilterProps = {}