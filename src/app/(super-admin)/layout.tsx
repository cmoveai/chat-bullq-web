'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/features/auth/services/auth.service';
import { Sidebar } from './_components/sidebar';
import { Topbar } from './_components/topbar';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/super-admin-login');
      return;
    }

    // Confia no cache só quando ele JÁ confirma SUPER_ADMIN.
    if (user?.globalRole === 'SUPER_ADMIN') {
      setIsLoading(false);
      return;
    }

    // Sem user, ou cache possivelmente desatualizado → revalida no backend
    // (fonte da verdade) antes de redirecionar. Evita falso /home por cache.
    authService
      .getMe()
      .then((data) => {
        setAuth(data.user, data.organizations);
        if (data.user.globalRole !== 'SUPER_ADMIN') {
          router.replace('/home');
          return;
        }
        setIsLoading(false);
      })
      .catch(() => {
        router.replace('/super-admin-login');
      });
  }, [user, setAuth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500">
        <div className="text-sm">Carregando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
