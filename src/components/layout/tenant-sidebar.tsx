'use client';

/**
 * TenantSidebar — sidebar escura premium oficial do ambiente do usuário (EIXXO).
 * Usada pelo shell em TODAS as rotas do tenant (padrão visual aprovado).
 * Apenas UI/navegação; não toca backend/auth além do logout local.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

type NavItem = { label: string; href: string; ico: string; badge?: string };
type NavGroup = { group: string; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

const NAV: NavEntry[] = [
  { label: 'Painel', href: '/dashboard', ico: '⌂' },
  {
    group: 'Atendimentos',
    items: [
      { label: 'Inbox', href: '/inbox', ico: '✉' },
      { label: 'Histórico', href: '/inbox/all', ico: '◉' },
    ],
  },
  {
    group: 'CRM',
    items: [
      { label: 'Contatos', href: '/contacts', ico: '⌘' },
      { label: 'Tarefas', href: '/tasks', ico: '✓' },
      { label: 'Ofertas', href: '/offers', ico: '◷' },
      { label: 'Pipelines', href: '/pipelines', ico: '▦' },
    ],
  },
  {
    group: 'IA e Automação',
    items: [
      { label: 'Agentes', href: '/ai-agents', ico: '✧' },
      { label: 'Automações', href: '/automations', ico: '⚙' },
      { label: 'Fluxos', href: '/chatbot', ico: '✦' },
    ],
  },
  { label: 'Minha Equipe', href: '/settings/members', ico: '☷' },
  { label: 'Planos', href: '/plans', ico: '◫' },
  { label: 'Perfil', href: '/profile', ico: '☺' },
];

const CSS = `
.tside{width:260px;flex:0 0 260px;height:100vh;position:sticky;top:0;padding:26px 18px;overflow-y:auto;background:radial-gradient(circle at 70% 18%,rgba(124,60,255,.14),transparent 30%),linear-gradient(180deg,#0b1118,#071018);color:#fff;display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.08);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
.tside::-webkit-scrollbar{width:7px}.tside::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.tlogo{font-size:28px;font-weight:900;letter-spacing:.1em;margin:2px 4px 24px}
.tlogo i{font-style:normal}.tlogo i:nth-child(3){color:#7c3cff}.tlogo i:nth-child(4){color:#43c9d8}
.tnav{display:grid;gap:4px}
.tgrp{margin:14px 8px 4px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7c8aa0;font-weight:800}
.tnav a{display:flex;align-items:center;gap:12px;height:42px;padding:0 14px;border-radius:11px;color:#dbe5f1;text-decoration:none;font-size:13.5px;font-weight:700}
.tnav a:hover{background:rgba(255,255,255,.06)}
.tnav a.on{background:linear-gradient(180deg,rgba(255,255,255,.15),rgba(255,255,255,.08));box-shadow:inset 0 1px rgba(255,255,255,.08);color:#fff}
.tic{width:18px;text-align:center;opacity:.92}
.tbadge{margin-left:auto;min-width:24px;height:21px;border-radius:8px;background:rgba(255,255,255,.12);display:grid;place-items:center;font-size:11px}
.tplan{margin-top:18px;border-radius:16px;padding:16px 15px;background:radial-gradient(circle at 82% 15%,rgba(67,201,216,.22),transparent 34%),linear-gradient(135deg,#211444,#2b1564 50%,#101929);border:1px solid rgba(255,255,255,.1)}
.tplan h3{margin:0 0 7px;font-size:14px}.tplan p{margin:0 0 13px;color:#c9d3df;font-size:11.5px}
.ttrack{height:6px;border-radius:99px;background:rgba(255,255,255,.13);overflow:hidden}.tfill{height:100%;width:46%;background:linear-gradient(90deg,#d453ff,#3778ff,#43c9d8)}
.tusage{display:flex;justify-content:space-between;margin:12px 0 14px;font-size:11.5px;color:#dce4ef}
.tplan button{width:100%;height:36px;border:0;border-radius:9px;color:#fff;font-weight:800;cursor:pointer;background:linear-gradient(90deg,#873ad9,#3d54e8)}
.tacc{display:flex;align-items:center;gap:11px;margin-top:18px}
.tav{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#44267a,#1b2838);border:1px solid rgba(255,255,255,.14);font-weight:900}
.tacc b{display:block;font-size:12.5px;line-height:1.2}.tacc small{color:#aab5c4;font-size:11px}
.tout{margin-left:auto;background:none;border:0;color:#8b97a8;cursor:pointer;font-size:16px}.tout:hover{color:#fff}
`;

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  if (href === '/inbox') return pathname === '/inbox';
  return pathname === href || pathname.startsWith(href + '/');
}

export function TenantSidebar() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { organizations, activeOrgId, user } = useAuthStore();
  const orgName = organizations?.find((o) => o.id === activeOrgId)?.name || 'EIXXO';

  function logout() {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('active_org_id');
    } catch { /* noop */ }
    router.replace('/login');
  }

  return (
    <aside className="tside">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Link href="/dashboard" className="tlogo" style={{ textDecoration: 'none', color: '#fff' }}>
        <i>E</i><i>I</i><i>X</i><i>X</i><i>O</i>
      </Link>

      <nav className="tnav">
        {NAV.map((entry) => {
          if ('group' in entry) {
            return (
              <div key={entry.group}>
                <div className="tgrp">{entry.group}</div>
                {entry.items.map((it) => (
                  <Link key={it.href} href={it.href} className={isActive(pathname, it.href) ? 'on' : ''}>
                    <span className="tic">{it.ico}</span>{it.label}
                    {it.badge && <span className="tbadge">{it.badge}</span>}
                  </Link>
                ))}
              </div>
            );
          }
          return (
            <Link key={entry.href} href={entry.href} className={isActive(pathname, entry.href) ? 'on' : ''}>
              <span className="tic">{entry.ico}</span>{entry.label}
              {entry.badge && <span className="tbadge">{entry.badge}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="tplan">
        <h3>Seu plano</h3>
        <p>Veja os planos e gerencie sua assinatura EIXXO.</p>
        <Link href="/plans"><button>Ver planos</button></Link>
      </div>

      <div className="tacc">
        <div className="tav">{(orgName[0] || 'E').toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <b>{orgName}</b>
          <small>{user?.name || 'Administrador'}</small>
        </div>
        <button className="tout" title="Sair" onClick={logout}>⏻</button>
      </div>
    </aside>
  );
}
