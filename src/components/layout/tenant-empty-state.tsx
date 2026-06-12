'use client';

/**
 * Estado vazio premium oficial do ambiente do usuário (EIXXO).
 * Card branco, claro, com título, descrição e CTA opcional.
 * Usar quando uma área ainda está em configuração / sem dados.
 */

import Link from 'next/link';

export function TenantPageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[#f7f8fb] px-6 py-7 sm:px-9">
      <div className="mx-auto w-full max-w-[1320px]">{children}</div>
    </div>
  );
}

export function TenantEmptyState({
  icon = '✨',
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon?: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-[18px] border border-[#e8ecf2] bg-white p-9 text-center shadow-[0_14px_34px_rgba(15,23,42,.07),0_2px_6px_rgba(15,23,42,.04)]">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#f3efff] text-2xl text-[#7c3cff]">
          {icon}
        </div>
        <h2 className="mb-2 text-lg font-extrabold tracking-tight text-zinc-900">{title}</h2>
        <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#080d14] px-6 text-sm font-bold text-white transition hover:opacity-90"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
