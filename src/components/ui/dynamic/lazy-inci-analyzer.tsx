'use client'

/**
 * Lazy INCI Analyzer - Dynamic Import Optimization
 * Heavy component loaded only when needed
 */

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf } from 'lucide-react';

// Dynamic import of heavy INCI components
const InciListDetailed = dynamic(
  () => import('@/components/ui/inci-list-enhanced').then(mod => ({ default: mod.InciListDetailed })),
  {
    ssr: false,
    loading: () => <InciAnalyzerSkeleton />
  }
);

const InciListCompact = dynamic(
  () => import('@/components/ui/inci-list-enhanced').then(mod => ({ default: mod.InciListCompact })),
  {
    ssr: false,
    loading: () => <InciCompactSkeleton />
  }
);

function InciAnalyzerSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="h-5 w-5 text-green-600" />
          <Skeleton className="h-6 w-48" />
        </div>
        
        <div className="space-y-4">
          {/* Ingredients list skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
          
          {/* Stats skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InciCompactSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-green-600" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

// Re-export avec lazy loading
export { InciListDetailed, InciListCompact };
export type { InciListDetailedProps, InciListCompactProps } from '@/components/ui/inci-list-enhanced';