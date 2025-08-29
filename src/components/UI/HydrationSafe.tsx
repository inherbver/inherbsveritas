/**
 * HerbisVeritas V2 - Hydration Safe Components
 * 
 * Composants wrapper pour prévenir les hydration mismatches
 * Patterns Context7 obligatoires pour tous les composants
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useIsClient } from '@/hooks/useHydrationSafe';
import type { BaseComponentProps } from '@/types/context7-patterns';

// ============================================================================
// 1. CLIENT-ONLY WRAPPER
// ============================================================================

interface ClientOnlyProps extends BaseComponentProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Wrapper pour composants strictement client-side
 * Empêche l'hydration mismatch en retardant le rendu
 */
export function ClientOnly({ 
  fallback = <div>Loading...</div>, 
  children,
  className,
  testId 
}: ClientOnlyProps): React.ReactElement {
  const isClient = useIsClient();

  return (
    <div className={className} data-testid={testId}>
      {isClient ? children : fallback}
    </div>
  );
}

// ============================================================================
// 2. SAFE DATE COMPONENT
// ============================================================================

interface SafeDateProps extends BaseComponentProps {
  date: string | Date;
  format?: Intl.DateTimeFormatOptions;
  fallback?: string;
}

/**
 * Composant pour affichage sécurisé de dates
 * Évite les hydration mismatches dus aux timezones
 */
export function SafeDate({ 
  date, 
  format,
  fallback = 'Loading date...',
  className,
  testId 
}: SafeDateProps): React.ReactElement {
  const isClient = useIsClient();
  
  if (!isClient) {
    return (
      <time 
        className={className} 
        data-testid={testId}
        suppressHydrationWarning
      >
        {fallback}
      </time>
    );
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formattedDate = dateObj.toLocaleDateString('fr-FR', format);
  
  return (
    <time 
      dateTime={dateObj.toISOString()}
      className={className}
      data-testid={testId}
      suppressHydrationWarning
    >
      {formattedDate}
    </time>
  );
}

// ============================================================================
// 3. SAFE CURRENCY COMPONENT
// ============================================================================

interface SafeCurrencyProps extends BaseComponentProps {
  amount: number;
  currency?: string;
  fallback?: string;
}

/**
 * Composant pour affichage sécurisé de prix
 * Évite les mismatches dus aux formats régionaux
 */
export function SafeCurrency({ 
  amount, 
  currency = 'EUR',
  fallback,
  className,
  testId 
}: SafeCurrencyProps): React.ReactElement {
  const isClient = useIsClient();
  
  if (!isClient) {
    return (
      <data 
        value={amount}
        className={className}
        data-testid={testId}
        suppressHydrationWarning
      >
        {fallback || `${amount} ${currency}`}
      </data>
    );
  }

  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency
  }).format(amount);
  
  return (
    <data 
      value={amount}
      className={className}
      data-testid={testId}
      suppressHydrationWarning
    >
      {formattedPrice}
    </data>
  );
}

// ============================================================================
// 4. DYNAMIC LOADER
// ============================================================================

interface DynamicComponentProps extends BaseComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  loading?: React.ComponentType;
  error?: React.ComponentType<{ error: Error; retry: () => void }>;
  ssr?: boolean;
}

/**
 * Wrapper pour composants chargés dynamiquement
 * Prévient les problèmes d'hydration avec les imports dynamiques
 */
export function DynamicComponent({
  loader,
  loading: LoadingComponent,
  error: ErrorComponent,
  ssr = false,
  className,
  testId,
  ...props
}: DynamicComponentProps): React.ReactElement {
  const Component = dynamic(loader, {
    ssr,
    loading: LoadingComponent ? () => <LoadingComponent /> : undefined,
    // @ts-expect-error - Dynamic import typing
    error: ErrorComponent
  });

  return (
    <div className={className} data-testid={testId}>
      <Suspense fallback={LoadingComponent ? <LoadingComponent /> : <div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    </div>
  );
}

// ============================================================================
// 5. PROGRESSIVE ENHANCEMENT WRAPPER
// ============================================================================

interface ProgressiveEnhancementProps extends BaseComponentProps {
  server: React.ReactNode;
  client: React.ReactNode;
  threshold?: number; // ms à attendre avant d'afficher le client
}

/**
 * Wrapper pour progressive enhancement
 * Affiche d'abord la version serveur, puis upgrade côté client
 */
export function ProgressiveEnhancement({ 
  server, 
  client,
  // threshold = 100, // unused parameter
  className,
  testId 
}: ProgressiveEnhancementProps): React.ReactElement {
  const isClient = useIsClient();

  return (
    <div className={className} data-testid={testId}>
      {isClient ? client : server}
    </div>
  );
}

// ============================================================================
// 6. CART BADGE SAFE
// ============================================================================

interface CartBadgeProps extends BaseComponentProps {
  count?: number;
  showZero?: boolean;
}

/**
 * Badge de panier hydration-safe
 * Évite le flash de contenu incorrect
 */
export function CartBadge({ 
  count = 0,
  showZero = false,
  className,
  testId 
}: CartBadgeProps): React.ReactElement {
  const isClient = useIsClient();
  
  // Ne pas afficher côté serveur si count est dynamique
  if (!isClient && count === 0 && !showZero) {
    return <span className={className} data-testid={testId} suppressHydrationWarning />;
  }

  const displayCount = isClient ? count : 0;
  const shouldShow = showZero || displayCount > 0;
  
  if (!shouldShow) {
    return <span className={className} data-testid={testId} suppressHydrationWarning />;
  }

  return (
    <span 
      className={className}
      data-testid={testId}
      suppressHydrationWarning
      role="status"
      aria-label={`${displayCount} articles dans le panier`}
    >
      {displayCount}
    </span>
  );
}

// ============================================================================
// 7. THEME SAFE WRAPPER
// ============================================================================

interface ThemeSafeProps extends BaseComponentProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark';
}

/**
 * Wrapper pour thèmes - Évite le flash of unstyled content
 */
export function ThemeSafe({ 
  children,
  defaultTheme = 'light',
  className,
  testId 
}: ThemeSafeProps): React.ReactElement {
  const isClient = useIsClient();
  
  return (
    <div 
      className={className}
      data-testid={testId}
      data-theme={isClient ? undefined : defaultTheme}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}

// ============================================================================
// 8. DEVELOPMENT HYDRATION DEBUGGER
// ============================================================================

interface HydrationDebuggerProps extends BaseComponentProps {
  componentName: string;
  children: React.ReactNode;
  showDebugInfo?: boolean;
}

/**
 * Debugger pour hydration (développement uniquement)
 */
export function HydrationDebugger({ 
  componentName,
  children,
  showDebugInfo = process.env.NODE_ENV === 'development',
  className,
  testId 
}: HydrationDebuggerProps): React.ReactElement {
  const isClient = useIsClient();
  
  if (showDebugInfo && !isClient) {
    console.log(`🚀 ${componentName} rendering server-side`);
  }
  
  if (showDebugInfo && isClient) {
    console.log(`💻 ${componentName} hydrated client-side`);
  }

  return (
    <div 
      className={className}
      data-testid={testId}
      data-component={showDebugInfo ? componentName : undefined}
      data-hydrated={showDebugInfo ? isClient : undefined}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 9. CONDITIONAL RENDER WRAPPER
// ============================================================================

interface ConditionalRenderProps extends BaseComponentProps {
  condition: boolean;
  server: React.ReactNode;
  client: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Rendu conditionnel hydration-safe
 */
export function ConditionalRender({ 
  condition,
  server,
  client,
  fallback = null,
  className,
  testId 
}: ConditionalRenderProps): React.ReactElement {
  const isClient = useIsClient();
  
  if (!isClient) {
    return (
      <div className={className} data-testid={testId}>
        {condition ? server : fallback}
      </div>
    );
  }
  
  return (
    <div className={className} data-testid={testId}>
      {condition ? client : fallback}
    </div>
  );
}

// ============================================================================
// 10. LAZY COMPONENT WITH HYDRATION
// ============================================================================

interface LazyHydrationProps extends BaseComponentProps {
  children: React.ReactNode;
  when?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Hydration paresseuse - Charge le composant seulement quand nécessaire
 */
export function LazyHydration({ 
  children,
  when = true,
  fallback = <div>Loading...</div>,
  className,
  testId 
}: LazyHydrationProps): React.ReactElement {
  const isClient = useIsClient();
  
  if (!isClient || !when) {
    return (
      <div className={className} data-testid={testId}>
        {fallback}
      </div>
    );
  }
  
  return (
    <div className={className} data-testid={testId}>
      {children}
    </div>
  );
}

// Export des types pour usage externe
export type {
  ClientOnlyProps,
  SafeDateProps, 
  SafeCurrencyProps,
  DynamicComponentProps,
  ProgressiveEnhancementProps,
  CartBadgeProps,
  ThemeSafeProps,
  HydrationDebuggerProps,
  ConditionalRenderProps,
  LazyHydrationProps
};