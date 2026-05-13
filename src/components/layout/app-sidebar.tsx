'use client';

import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronsUpDown,
  Building2,
  ChevronUp,
  CheckSquare,
  Briefcase,
  Zap,
  BookOpen,
  Contact,
  MessageSquare,
  Bot,
  KanbanSquare,
  Users,
  CreditCard,
  User,
  LayoutGrid,
  Magnet,
  Clock,
  History,
  Megaphone,
} from 'lucide-react';
import { InboxTree } from '@/features/inbox-views/components/inbox-tree';
import { NavGroup } from '@/components/layout/nav-group';
import { useFeatures } from '@/features/billing/hooks/use-features';

import { useAuthStore } from '@/stores/auth-store';
import { Avatar } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
  SidebarSpacer,
} from '@/components/ui/sidebar';
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
  DropdownDivider,
} from '@/components/ui/dropdown';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Quando true e a feature não está liberada, mostra badge "Pro" no item. */
  requiresFeature?: keyof ReturnType<typeof useFeatures>['features'];
}

const automacoesNav: NavItem[] = [
  { href: '/automations', label: 'Minhas Automações', icon: Zap },
  { href: '/automations/templates', label: 'Modelos', icon: LayoutGrid, requiresFeature: 'bpmnBuilder' },
  { href: '/campaigns', label: 'Campanhas', icon: Megaphone, requiresFeature: 'campaigns' },
  { href: '/automations/lead-captures', label: 'Capturas de Leads', icon: Magnet },
  { href: '/automations/waitlists', label: 'Listas de Espera', icon: Clock },
];

const crmNav: NavItem[] = [
  { href: '/contacts', label: 'Contatos', icon: Contact },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { href: '/offers', label: 'Ofertas', icon: Briefcase },
  { href: '/pipelines', label: 'Pipelines', icon: KanbanSquare },
];

function ProBadge() {
  return (
    <span className="ml-auto rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
      Pro
    </span>
  );
}

export function AppSidebar() {
  const { user, organizations, activeOrgId, setActiveOrg, logout } =
    useAuthStore();
  const activeOrg = organizations.find((o) => o.id === activeOrgId);
  const { features } = useFeatures();

  const handleOrgSwitch = (orgId: string) => {
    setActiveOrg(orgId);
    window.location.reload();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Dropdown>
          <DropdownButton className="flex w-full min-w-0 items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-zinc-950/5 dark:hover:bg-white/5">
            <Avatar
              initials={activeOrg?.name?.slice(0, 2).toUpperCase()}
              className="size-9 bg-primary text-xs text-primary-foreground"
              square
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Workspace
              </span>
              <span className="block truncate text-sm font-semibold text-zinc-950 dark:text-white">
                {activeOrg?.name ?? 'Meu Workspace'}
              </span>
            </span>
            <ChevronsUpDown className="ml-auto size-4 shrink-0 text-zinc-500" />
          </DropdownButton>
          {organizations.length > 1 && (
            <DropdownMenu anchor="bottom start" className="min-w-56">
              {organizations.map((org) => (
                <DropdownItem
                  key={org.id}
                  onClick={() => handleOrgSwitch(org.id)}
                >
                  <Building2 />
                  <DropdownLabel>{org.name}</DropdownLabel>
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </Dropdown>
      </SidebarHeader>

      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/dashboard">
            <LayoutDashboard className="size-5" />
            <SidebarLabel>Painel</SidebarLabel>
          </SidebarItem>
        </SidebarSection>

        <SidebarSection>
          <NavGroup label="CRM" icon={Contact} storageKey="nav-crm-expanded">
            {crmNav.map((item) => {
              const locked = item.requiresFeature && !features[item.requiresFeature];
              return (
                <SidebarItem key={item.label} href={item.href}>
                  <item.icon className="size-4" />
                  <SidebarLabel>{item.label}</SidebarLabel>
                  {locked && <ProBadge />}
                </SidebarItem>
              );
            })}
          </NavGroup>

          <NavGroup
            label="Atendimentos"
            icon={MessageSquare}
            storageKey="nav-atendimentos-expanded"
            defaultExpanded={false}
          >
            <SidebarItem href="/inbox">
              <MessageSquare className="size-4" />
              <SidebarLabel>Chat</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/inbox/all">
              <History className="size-4" />
              <SidebarLabel>Todas as Conversas</SidebarLabel>
            </SidebarItem>
            <InboxTree />
          </NavGroup>

          <NavGroup
            label="Agentes"
            icon={Bot}
            storageKey="nav-agentes-expanded"
            defaultExpanded={false}
          >
            <SidebarItem href="/ai-agents">
              <Bot className="size-4" />
              <SidebarLabel>Agentes</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/knowledge-bases">
              <BookOpen className="size-4" />
              <SidebarLabel>Bases de Conhecimento</SidebarLabel>
            </SidebarItem>
          </NavGroup>

          <NavGroup
            label="Automações"
            icon={Zap}
            storageKey="nav-automacoes-expanded"
            defaultExpanded={false}
          >
            {automacoesNav.map((item) => {
              const locked = item.requiresFeature && !features[item.requiresFeature];
              return (
                <SidebarItem key={item.href} href={item.href}>
                  <item.icon className="size-4" />
                  <SidebarLabel>{item.label}</SidebarLabel>
                  {locked && <ProBadge />}
                </SidebarItem>
              );
            })}
          </NavGroup>
        </SidebarSection>

        <SidebarSection>
          <SidebarItem href="/settings/members">
            <Users className="size-5" />
            <SidebarLabel>Minha Equipe</SidebarLabel>
          </SidebarItem>

          <NavGroup
            label="Planos"
            icon={CreditCard}
            storageKey="nav-planos-expanded"
            defaultExpanded={false}
          >
            <SidebarItem href="/plans">
              <CreditCard className="size-4" />
              <SidebarLabel>Planos</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/plans/manage">
              <Settings className="size-4" />
              <SidebarLabel>Gerenciar Assinatura</SidebarLabel>
            </SidebarItem>
          </NavGroup>

          <NavGroup
            label="Perfil"
            icon={User}
            storageKey="nav-perfil-expanded"
            defaultExpanded={false}
          >
            <SidebarItem href="/profile">
              <User className="size-4" />
              <SidebarLabel>Meu Perfil</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/profile/edit">
              <User className="size-4" />
              <SidebarLabel>Editar Perfil</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/profile/emails">
              <User className="size-4" />
              <SidebarLabel>Endereços de Email</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/profile/password">
              <User className="size-4" />
              <SidebarLabel>Alterar Senha</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/profile/2fa">
              <User className="size-4" />
              <SidebarLabel>Autenticação de Dois Fatores</SidebarLabel>
            </SidebarItem>
          </NavGroup>
        </SidebarSection>

        <SidebarSpacer />
      </SidebarBody>

      <SidebarFooter>
        <Dropdown>
          <DropdownButton className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-zinc-950/5 dark:hover:bg-white/5">
            <Avatar
              src={user?.avatarUrl}
              initials={user?.name?.slice(0, 2).toUpperCase()}
              className="size-10"
              square
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                {user?.name}
              </span>
              <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                {user?.email}
              </span>
            </span>
            <ChevronUp className="ml-auto size-4 shrink-0 text-zinc-500" />
          </DropdownButton>
          <DropdownMenu anchor="top start" className="min-w-56">
            <DropdownItem href="/settings">
              <Settings />
              <DropdownLabel>Configurações</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={logout}>
              <LogOut />
              <DropdownLabel>Sair</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </SidebarFooter>
    </Sidebar>
  );
}
