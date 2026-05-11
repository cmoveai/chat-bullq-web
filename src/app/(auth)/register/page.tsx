import { Suspense } from 'react';
import { RegisterForm } from '@/features/auth/components/register-form';
import { Sparkles, Bot, Zap, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* LEFT · brand panel · hidden em mobile */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:w-[58%] xl:w-[60%]">
        <div className="pointer-events-none absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-base font-extrabold tracking-tight">
            CMOVE<span className="text-cyan-400">.AI</span>{' '}
            <span className="text-emerald-400">ZAP</span>
          </div>
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-300">
            <Sparkles className="h-3 w-3" /> 7 dias grátis · sem cartão
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight xl:text-5xl">
            Comece a vender no WhatsApp{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              em 15 minutos.
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-400">
            Crie a conta · conecte um canal · ative seus 6 agentes IA. A primeira
            conversa cai no inbox em minutos. Cancele quando quiser.
          </p>

          <ul className="mt-10 space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  6 agentes IA já configurados
                </p>
                <p className="text-xs text-zinc-400">
                  Júlia · Marcelo · Camila · Marina · Silvia + Rafael · prontos pra delegar
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Templates prontos por nicho
                </p>
                <p className="text-xs text-zinc-400">
                  Clínica · salão · infoproduto · loja · advocacia · em 1 clique
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Seus dados protegidos · LGPD 100%
                </p>
                <p className="text-xs text-zinc-400">
                  Email verification · audit log · backup criptografado · RLS 100%
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="relative flex items-center justify-between text-xs text-zinc-500">
          <span>CMOVE.AI Tecnologia LTDA · CNPJ 66.432.401/0001-29</span>
          <a href="/" className="hover:text-zinc-300">
            cmove.ai
          </a>
        </div>
      </div>

      {/* RIGHT · form */}
      <div className="flex w-full flex-1 items-center justify-center bg-white px-6 py-12 dark:bg-zinc-950 lg:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-2 text-base font-extrabold tracking-tight text-zinc-950 dark:text-white lg:hidden">
            CMOVE<span className="text-cyan-500">.AI</span>{' '}
            <span className="text-emerald-500">ZAP</span>
          </div>
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
