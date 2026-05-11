import { Suspense } from 'react';
import { VerifyEmailForm } from '@/features/auth/components/verify-email-form';
import { Sparkles, MailCheck, ShieldCheck, BadgeCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full">
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
            <Sparkles className="h-3 w-3" /> Confirmação de e-mail
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight xl:text-5xl">
            Confirma seu e-mail e{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              entra direto pra começar.
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-400">
            A verificação garante que ninguém criou conta usando seu e-mail · e
            destrava 100% da plataforma · agentes IA · canais · cobrança Pix.
          </p>

          <ul className="mt-10 space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <MailCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Confirmação obrigatória pré-login
                </p>
                <p className="text-xs text-zinc-400">
                  Política Cyber Onda 1 · evita conta-fantasma e fraude
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                <BadgeCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Token expira em 24 horas · single-use
                </p>
                <p className="text-xs text-zinc-400">
                  Cliquei e funcionou? Token foi consumido · fica seguro
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Welcome com checklist · só após verify
                </p>
                <p className="text-xs text-zinc-400">
                  Plataforma libera só pra contas confirmadas · qualidade da base
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

      <div className="flex w-full flex-1 items-center justify-center bg-white px-6 py-12 dark:bg-zinc-950 lg:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-2 text-base font-extrabold tracking-tight text-zinc-950 dark:text-white lg:hidden">
            CMOVE<span className="text-cyan-500">.AI</span>{' '}
            <span className="text-emerald-500">ZAP</span>
          </div>
          <Suspense>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
