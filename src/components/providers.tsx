'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { makeQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Direção visual aprovada EIXXO: ambiente sempre CLARO (sidebar escura é
          tratada no shell). forcedTheme evita o dark do sistema deixar as
          páginas internas pretas. */}
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
        {children}
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
