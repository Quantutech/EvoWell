
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useToast } from '../contexts/ToastContext';

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
      },
    },
    // Global Error Handling for Queries
    queryCache: new QueryCache({
      onError: (error) => {
        const msg = error instanceof Error ? error.message : 'An error occurred while fetching data';
        addToast('error', msg);
      }
    }),
    // Global Error Handling for Mutations
    mutationCache: new MutationCache({
      onError: (error) => {
        const msg = error instanceof Error ? error.message : 'Action failed';
        addToast('error', msg);
      }
    })
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </QueryClientProvider>
  );
};
