import { api } from '@/lib/api';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpfCnpj?: string;
  companySize?: string;
  planIntent?: { planId: 'starter' | 'growth' | 'pro'; cycle: 'monthly' | 'quarterly' };
  inviteToken?: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  globalRole?: 'USER' | 'SUPER_ADMIN';
}

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
  accessibleChannelIds: 'ALL' | string[];
}

interface AuthResponse {
  user: AuthUser;
  organizations: OrgInfo[];
  accessToken: string;
  refreshToken: string;
}

interface MeResponse {
  user: AuthUser;
  organizations: OrgInfo[];
}

interface InvitationInfo {
  email: string;
  role: string;
  organization: { id: string; name: string; slug: string };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/login', payload);
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/register', payload);
    return data.data;
  },

  async getMe(): Promise<MeResponse> {
    const { data } = await api.get<{ data: MeResponse }>('/auth/me');
    return data.data;
  },

  async validateInvitation(token: string): Promise<InvitationInfo> {
    const { data } = await api.get<{ data: InvitationInfo }>(`/organizations/invitations/validate?token=${token}`);
    return data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerification(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  },
};
