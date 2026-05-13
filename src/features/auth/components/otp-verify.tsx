'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import { otpService, type OtpType } from '../services/otp.service';

type Props = {
  type: OtpType;
  title: string;
  description: (sentTo: string) => string;
  nextRoute: string;
  initialSentTo?: string;
};

export function OtpVerify({ type, title, description, nextRoute, initialSentTo }: Props) {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState(initialSentTo || '');
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Manda OTP na montagem (se ainda não foi enviado)
  useEffect(() => {
    if (sentTo) return;
    setSending(true);
    otpService
      .send(type)
      .then((res) => {
        setSentTo(res.sentTo);
        setCooldown(res.cooldownSec);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Erro ao enviar código');
      })
      .finally(() => setSending(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Tick do cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const setDigit = (idx: number, v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 1);
    setCode((arr) => {
      const next = [...arr];
      next[idx] = clean;
      return next;
    });
    if (clean && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setCode(text.split(''));
      inputs.current[5]?.focus();
      e.preventDefault();
    }
  };

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const full = code.join('');
    if (full.length !== 6) {
      toast.error('Digite os 6 dígitos');
      return;
    }
    setSubmitting(true);
    try {
      await otpService.verify(type, full);
      toast.success(type === 'phone' ? 'WhatsApp verificado' : 'E-mail verificado');
      router.push(nextRoute);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Código incorreto');
      setSubmitting(false);
    }
  };

  // Auto-submit quando completar 6 dígitos
  useEffect(() => {
    if (code.every((d) => d) && !submitting) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setSending(true);
    try {
      const res = await otpService.send(type);
      setSentTo(res.sentTo);
      setCooldown(res.cooldownSec);
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      toast.success('Código reenviado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao reenviar');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {description(sentTo || '...')}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => setDigit(idx, e.target.value)}
              onKeyDown={(e) => handleKey(idx, e)}
              autoFocus={idx === 0}
              className="h-14 w-12 rounded-lg border border-zinc-200 bg-white text-center text-2xl font-bold text-zinc-950 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white sm:h-16 sm:w-14"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting || sending || code.some((d) => !d)}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Confirmar código <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-sm">
          {cooldown > 0 ? (
            <span className="text-zinc-500">
              Reenviar código em <strong>{cooldown}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={sending}
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reenviar código
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
