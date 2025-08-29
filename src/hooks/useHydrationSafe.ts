/**
 * Hooks de protection contre l'hydration mismatch - HerbisVeritas V2 MVP
 * 
 * Patterns CLAUDE.md obligatoires :
 * - ❌ ZERO TOLERANCE pour hydration mismatches
 * - ✅ typeof window !== 'undefined' pour browser APIs
 * - ✅ useEffect pour client-only logic
 * - ✅ suppressHydrationWarning pour dates/times
 * 
 * @since 2025-01-28
 */

import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// 1. BASE HYDRATION HOOK
// ============================================================================

/**
 * Hook de base pour détecter si on est côté client
 * Pattern fondamental pour éviter les hydration mismatches
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

// ============================================================================
// 2. LOCALSTORAGE WITH HYDRATION PROTECTION
// ============================================================================

/**
 * Hook localStorage avec protection hydration automatique
 * Évite les différences server/client en gérant l'état initial côté client
 */
export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [isHydrated, setIsHydrated] = useState(false);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Hydratation côté client uniquement
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Erreur lecture localStorage key "${key}":`, error);
    }
    setIsHydrated(true);
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Erreur écriture localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isHydrated];
}

// ============================================================================
// 3. SAFE STORAGE OPERATIONS
// ============================================================================

/**
 * Opérations localStorage sécurisées avec fallback
 */
export const safeStorage = {
  getItem: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  setItem: <T>(key: string, value: T): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// ============================================================================
// 4. THEME WITH HYDRATION PROTECTION
// ============================================================================

/**
 * Hook thème avec protection hydration
 * Gère dark/light mode sans flash
 */
export function useHydratedTheme(): {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isHydrated: boolean;
} {
  const [theme, setTheme, isHydrated] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const toggleTheme = useCallback(() => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  // Appliquer le thème au DOM côté client
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, isHydrated]);

  return { theme, toggleTheme, isHydrated };
}

// ============================================================================
// 5. SAFE API CALLS
// ============================================================================

/**
 * Hook pour appels API sécurisés avec protection hydration
 */
export function useSafeApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isClient = useIsClient();

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    if (!isClient) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('API Error'));
    } finally {
      setLoading(false);
    }
  }, [isClient]);

  return { data, loading, error, execute, isClient };
}

// ============================================================================
// 6. COMPONENT WRAPPER
// ============================================================================

/**
 * Hook pour wrapper de composant client-only
 */
export function useClientOnlyWrapper(
  fallback?: React.ReactNode
): {
  ClientOnly: React.FC<{ children: React.ReactNode }>;
  isClient: boolean;
} {
  const isClient = useIsClient();

  const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isClient) {
      return fallback ? React.createElement(React.Fragment, null, fallback) : React.createElement("div", null, "Loading...");
    }
    return React.createElement(React.Fragment, null, children);
  };

  return { ClientOnly, isClient };
}

// Export des types pour usage externe
export type { };

// TODO: Implémenter useHydratedCart selon l'architecture MVP 13 tables
// - Tables `carts` et `cart_items`  
// - Sync localStorage ↔ Supabase
// - Gestion guest_id → user_id