'use client'

/**
 * QueryProvider - Provider TanStack Query pour App Router
 * 
 * Wrapper client-side uniquement avec hydration pattern
 * Compatible Next.js 15 Server Components + Client Components
 */

import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient as defaultQueryClient } from '@/lib/query-client'

interface QueryProviderProps {
  children: React.ReactNode
  client?: QueryClient
}

export function QueryProvider({ children, client }: QueryProviderProps) {
  // Utiliser le client fourni ou créer une instance
  const queryClient = React.useMemo(() => {
    return client || defaultQueryClient
  }, [client])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools uniquement en développement */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  )
}

// Hook pour accéder au QueryClient dans l'app
export function useQueryClient() {
  const client = React.useContext(QueryClientProvider as any)
  if (!client) {
    throw new Error('useQueryClient must be used within a QueryProvider')
  }
  return client
}