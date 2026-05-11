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
} from 'lucide-react';
import { InboxTree } from '@/features/inbox-views/components/inbox-tree';
import { JarvisTree } from '@/features/ai-agents/components/jarvis-tree';
import { NavGroup } from '@/components/layout/nav-group';

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

const crmNav = [
  { href: '/settings/contacts', label: 'Contatos', icon: Contact },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { href: '/offers', label: 'Ofertas', icon: Briefcase },
  { href: '/pipelines', label: 'Kanban', icon: KanbanSquare },
  { href: '/pipelines', label: 'Pipelines', icon: KanbanSquare },
];

const automacoesNav = [
  { href: '/automations', label: 'Minhas Automações', icon: Zap },
];

export function AppSidebar() {
  const { user, organizations, activeOrgId, setActiveOrg, logout } =
    useAuthStore();
  const activeOrg = organizations.find((o) => o.id === activeOrgId);

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
            {crmNav.map((item) => (
              <SidebarItem key={item.label} href={item.href}>
                <item.icon className="size-4" />
                <SidebarLabel>{item.label}</SidebarLabel>
              </SidebarItem>
            ))}
          </NavGroup>

          <NavGroup
            label="Atendimentos"
            icon={MessageSquare}
            storageKey="nav-atendimentos-expanded"
            defaultExpanded={false}
          >
            <InboxTree />
          </NavGroup>

          <NavGroup
            label="Agentes"
            icon={Bot}
            storageKey="nav-agentes-expanded"
            defaultExpanded={false}
          >
            <JarvisTree />
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
            {automacoesNav.map((item) => (
              <SidebarItem key={item.href} href={item.href}>
                <item.icon className="size-4" />
                <SidebarLabel>{item.label}</SidebarLabel>
              </SidebarItem>
            ))}
          </NavGroup>
        </SidebarSection>

        <SidebarSection>
          <SidebarItem href="/settings/members">
            <Users className="size-5" />
            <SidebarLabel>Minha Equipe</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/settings">
            <CreditCard className="size-5" />
            <SidebarLabel>Planos</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/settings">
            <User className="size-5" />
            <SidebarLabel>Perfil</SidebarLabel>
          </SidebarItem>
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
