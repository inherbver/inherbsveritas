'use client'

/**
 * Lazy Product Labels - Dynamic Import Optimization
 * HerbisVeritas label components loaded on interaction
 */

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf } from 'lucide-react';

// Dynamic imports pour les composants labels
const ProductLabelBadge = dynamic(
  () => import('@/components/products/product-label-badge').then(mod => ({ default: mod.ProductLabelBadge })),
  {
    ssr: true, // SSR pour SEO des badges de base
    loading: () => <LabelBadgeSkeleton />
  }
);

const ProductLabels = dynamic(
  () => import('@/components/products/product-label-badge').then(mod => ({ default: mod.ProductLabels })),
  {
    ssr: true,
    loading: () => <ProductLabelsSkeleton />
  }
);

// Charge uniquement sur interaction admin
const ProductLabelFilter = dynamic(
  () => import('@/components/products/product-label-badge').then(mod => ({ default: mod.ProductLabelFilter })),
  {
    ssr: false, // Client-only pour filtres
    loading: () => <LabelFilterSkeleton />
  }
);

const AdminProductLabels = dynamic(
  () => import('@/components/products/product-label-badge').then(mod => ({ default: mod.AdminProductLabels })),
  {
    ssr: false, // Admin uniquement
    loading: () => <AdminLabelsSkeleton />
  }
);

function LabelBadgeSkeleton() {
  return <Skeleton className="h-6 w-16 rounded-full" />;
}

function ProductLabelsSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Skeleton className="h-6 w-12 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
  );
}

function LabelFilterSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
      
      <div className="space-y-2">
        {[...Array(7)].map((_, i) => ( // 7 labels HerbisVeritas
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminLabelsSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="h-5 w-5 text-green-600" />
          <Skeleton className="h-6 w-40" />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <Badge variant="outline" className="opacity-50">
                  <Skeleton className="h-3 w-12" />
                </Badge>
                <div className="flex-1">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t">
            <Skeleton className="h-5 w-16 mb-2" />
            <div className="p-3 bg-muted/30 rounded">
              <ProductLabelsSkeleton />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Wrapper pour lazy loading conditionnel basé sur le rôle
export function LazyAdminProductLabels(props: any) {
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    // Charge seulement si rôle admin détecté
    const checkAdminRole = async () => {
      try {
        // Check user role from localStorage or context
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin' || userRole === 'dev') {
          setShouldLoad(true);
        }
      } catch (error) {
        console.warn('Role check failed:', error);
      }
    };

    checkAdminRole();
  }, []);

  if (!shouldLoad) {
    return <AdminLabelsSkeleton />;
  }

  return <AdminProductLabels {...props} />;
}

// Re-export avec lazy loading
export { ProductLabelBadge, ProductLabels, ProductLabelFilter, AdminProductLabels };
export type { 
  ProductLabelBadgeProps,
  ProductLabelsProps, 
  ProductLabelFilterProps,
  AdminProductLabelsProps 
} from '@/components/products/product-label-badge';