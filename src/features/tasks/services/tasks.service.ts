import { api } from '@/lib/api';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId: string | null;
  createdById: string | null;
  contactId: string | null;
  cardId: string | null;
  conversationId: string | null;
  dueDate: string | null;
  completedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  createdBy?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  contact?: {
    id: string;
    name: string | null;
    phone: string | null;
    email?: string | null;
  } | null;
  card?: {
    id: string;
    title: string;
    pipelineId: string;
  } | null;
  conversation?: {
    id: string;
    subject: string | null;
    protocol: string | null;
  } | null;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  contactId?: string;
  cardId?: string;
  conversationId?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string | null;
  contactId?: string | null;
  cardId?: string | null;
  conversationId?: string | null;
  dueDate?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  contactId?: string;
  cardId?: string;
  conversationId?: string;
  overdueOnly?: boolean;
  search?: string;
}

export const tasksService = {
  async list(filters: TaskFilters = {}): Promise<Task[]> {
    const { data } = await api.get<Task[]>('/tasks', { params: filters });
    return data;
  },

  async stats(): Promise<TaskStats> {
    const { data } = await api.get<TaskStats>('/tasks/stats');
    return data;
  },

  async getById(id: string): Promise<Task> {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const { data } = await api.post<Task>('/tasks', input);
    return data;
  },

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<{ ok: boolean }> {
    const { data } = await api.delete<{ ok: boolean }>(`/tasks/${id}`);
    return data;
  },
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'A fazer',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluída',
  CANCELLED: 'Cancelada',
};

export const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  DONE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  CANCELLED: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const TASK_PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
  MEDIUM: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  HIGH: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  URGENT: 'bg-red-500/15 text-red-700 dark:text-red-300',
};
