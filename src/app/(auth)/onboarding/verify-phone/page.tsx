import { OtpVerify } from '@/features/auth/components/otp-verify';

export const dynamic = 'force-dynamic';

export default function VerifyPhonePage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-6 py-12 dark:bg-zinc-950">
      <OtpVerify
        type="phone"
        title="Valide seu WhatsApp"
        description={(sentTo) =>
          `Enviamos um código de 6 dígitos via WhatsApp para ${sentTo}. Digite abaixo para confirmar.`
        }
        nextRoute="/onboarding/verify-email"
      />
    </div>
  );
}
