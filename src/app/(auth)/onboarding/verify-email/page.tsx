import { OtpVerify } from '@/features/auth/components/otp-verify';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-6 py-12 dark:bg-zinc-950">
      <OtpVerify
        type="email"
        title="Valide seu e-mail"
        description={(sentTo) =>
          `Enviamos um código de 6 dígitos para ${sentTo}. Confira sua caixa de entrada e digite o código.`
        }
        nextRoute="/plans"
      />
    </div>
  );
}
