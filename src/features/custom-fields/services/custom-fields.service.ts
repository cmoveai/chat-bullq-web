import { api } from '@/lib/api';

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'email'
  | 'phone'
  | 'url'
  | 'textarea';

export interface CustomContactField {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
  required?: boolean;
  order: number;
}

export const customFieldsService = {
  async list(): Promise<CustomContactField[]> {
    const { data } = await api.get('/organizations/current/custom-contact-fields');
    return Array.isArray(data?.data) ? data.data : [];
  },
  async save(fields: CustomContactField[]): Promise<CustomContactField[]> {
    const { data } = await api.put('/organizations/current/custom-contact-fields', {
      fields,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },
};

export const CUSTOM_FIELD_TYPE_LABEL: Record<CustomFieldType, string> = {
  text: 'Texto',
  textarea: 'Texto longo',
  number: 'Número',
  date: 'Data',
  select: 'Seleção',
  email: 'E-mail',
  phone: 'Telefone',
  url: 'URL',
};
