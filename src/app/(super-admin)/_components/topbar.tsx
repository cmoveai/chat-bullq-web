'use client';

import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function Topbar() {
  const { user } = useAuthStore();
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '··';

  return (
    <header className="h-15 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
      <div className="h-full flex items-center justify-between px-6 py-3">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar assinante, fatura, ticket..."
              className="w-full pl-9 pr-12 py-2 text-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-lg focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
            />
            <kbd className="hidden md:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center px-1.5 py-0.5 text-[10px] text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 rounded font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors relative"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
