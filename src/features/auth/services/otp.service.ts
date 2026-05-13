import { api } from '@/lib/api';

export type OtpType = 'phone' | 'email';

export const otpService = {
  async send(type: OtpType): Promise<{ sentTo: string; cooldownSec: number }> {
    const { data } = await api.post<{ sentTo: string; cooldownSec: number }>(
      '/auth/send-otp',
      { type },
    );
    return data;
  },

  async verify(type: OtpType, code: string): Promise<{ ok: boolean }> {
    const { data } = await api.post<{ ok: boolean }>('/auth/verify-otp', { type, code });
    return data;
  },
};
