'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Layers,
  TrendingUp,
  BarChart3,
  LifeBuoy,
  ArrowLeft,
} from 'lucide-react';

const SECTIONS: Array<{
  group?: string;
  items: Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> }>;
}> = [
  {
    items: [
      { label: 'Visão geral', href: '/super-admin', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Assinaturas',
    items: [
      { label: 'Assinantes', href: '/super-admin/assinantes', icon: Users },
      { label: 'Cobranças', href: '/super-admin/cobrancas', icon: Receipt },
      { label: 'Planos', href: '/super-admin/planos', icon: Layers },
    ],
  },
  {
    group: 'Finanças',
    items: [
      { label: 'Resultado do ZAP', href: '/super-admin/financeiro', icon: TrendingUp },
      { label: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
    ],
  },
  {
    group: 'Operação',
    items: [
      { label: 'Suporte', href: '/super-admin/suporte', icon: LifeBuoy },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400 font-medium">
            CMOVE.AI-ZAP
          </span>
        </div>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1.5 tracking-tight">
          Super Admin
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6 last:mb-0">
            {section.group && (
              <div className="px-5 mb-2 text-[10px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-600 font-medium">
                {section.group}
              </div>
            )}
            <ul>
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/super-admin' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-5 py-2 text-sm transition-colors ${
                        active
                          ? 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
        <Link
          href="/home"
          className="flex items-center gap-2 px-2 py-2 text-xs text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar pro painel tenant
        </Link>
      </div>
    </aside>
  );
}
