import { z } from 'zod';

const COMPANY_SIZES = [
  '1',
  '2-5',
  '6-10',
  '11-50',
  '51-100',
  '101-250',
  '251-499',
  '500+',
] as const;

export const companySizeEnum = z.enum(COMPANY_SIZES);
export type CompanySize = z.infer<typeof companySizeEnum>;
export const COMPANY_SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: '1', label: '1 colaborador' },
  { value: '2-5', label: '2 a 5 colaboradores' },
  { value: '6-10', label: '6 a 10 colaboradores' },
  { value: '11-50', label: '11 a 50 colaboradores' },
  { value: '51-100', label: '51 a 100 colaboradores' },
  { value: '101-250', label: '101 a 250 colaboradores' },
  { value: '251-499', label: '251 a 499 colaboradores' },
  { value: '500+', label: 'Acima de 500 colaboradores' },
];

// CPF: 11 dígitos · CNPJ: 14 dígitos · aceita só dígitos
const cpfCnpjSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v.length === 11 || v.length === 14, {
    message: 'CPF (11 dígitos) ou CNPJ (14 dígitos)',
  });

// Telefone BR · 10 ou 11 dígitos (DDD + número)
const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v.length >= 10 && v.length <= 11, {
    message: 'Telefone inválido',
  });

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120),
    email: z.string().email('Email inválido'),
    phone: phoneSchema,
    cpfCnpj: cpfCnpjSchema,
    companySize: companySizeEnum,
    password: z.string().min(6, 'Mínimo 6 caracteres').max(128),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: 'Você precisa aceitar os termos',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
