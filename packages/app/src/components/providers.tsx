'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 2,
      },
    },
  }));

  useEffect(() => {
    // Initialize MiniKit when component mounts
    if (typeof window !== 'undefined' && MiniKit.isInstalled()) {
      console.log('MiniKit is installed and ready');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

