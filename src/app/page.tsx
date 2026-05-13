import type { Metadata } from 'next';
import { LandingPage } from '@/features/landing/components/landing-page';

export const metadata: Metadata = {
  title: 'CMOVE.AI-ZAP · Plataforma de automatização e agentes IA',
  description:
    'Atendimento omnichannel · WhatsApp + Instagram + E-mail + Webchat. CRM nativo. Agentes IA personalizados. Campanhas multi-canal com métricas em tempo real.',
  openGraph: {
    title: 'CMOVE.AI-ZAP',
    description:
      'Automatize vendas, atendimento e relacionamento. WhatsApp + IA + CRM no mesmo lugar.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function Home() {
  return <LandingPage />;
}
