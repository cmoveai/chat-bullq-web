'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TenantSidebar } from '@/components/layout/tenant-sidebar';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/features/auth/services/auth.service';
import { usePermissionsSync } from '@/features/settings/hooks/use-permissions-sync';
import { ToolFailureBanner } from '@/features/ai-agents/components/tool-failure-banner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setAuth, activeOrgId, setActiveOrg } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  usePermissionsSync();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    if (user) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then((data) => {
        setAuth(data.user, data.organizations);
        // Ensure activeOrgId is set (setAuth handles this, but double-check)
        const currentOrgId = localStorage.getItem('active_org_id');
        if (!currentOrgId && data.organizations.length > 0) {
          setActiveOrg(data.organizations[0].id);
        }
        setIsLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.replace('/login');
      });
  }, [router, user, setAuth, setActiveOrg]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Shell ÚNICO do ambiente do usuário (padrão visual aprovado EIXXO):
  // sidebar escura premium + área principal clara/off-white em TODAS as rotas.
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f8fb] text-zinc-900">
      <TenantSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ToolFailureBanner />
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
