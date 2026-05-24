'use client';

import { use, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2, Copy, Clock, Loader2, FileText, MessageSquare } from 'lucide-react';

interface PublicCobranca {
  slug: string;
  cliente_nome: string;
  etapa: string;
  valor: string;
  vencimento: string;
  pix_chave: string;
  pix_emv: string | null;
  status: 'AGUARDANDO' | 'AGUARDANDO_CONFIRMACAO' | 'PAGO' | 'CANCELADO';
  pago_em: string | null;
  nf_url: string | null;
  whatsapp_comprovante: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function formatBrl(value: string | number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(typeof value === 'string' ? parseFloat(value) : value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

export default function PagarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [cobranca, setCobranca] = useState<PublicCobranca | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/public/cobrancas/${slug}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Cobrança não encontrada');
        const json = (await r.json()) as { data: PublicCobranca };
        setCobranca(json.data);
        if (json.data.pix_emv) {
          QRCode.toDataURL(json.data.pix_emv, { width: 280, margin: 1 }).then(setQrDataUrl);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  function copyEmv() {
    if (!cobranca?.pix_emv) return;
    navigator.clipboard.writeText(cobranca.pix_emv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function markPaid() {
    setMarking(true);
    try {
      const res = await fetch(`${API_URL}/public/cobrancas/${slug}/marcar-pago`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Erro ao marcar como pago');
      const json = (await res.json()) as { data: { status: PublicCobranca['status'] } };
      setCobranca((prev) => (prev ? { ...prev, status: json.data.status } : prev));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro');
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !cobranca) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="text-center max-w-sm">
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Cobrança não encontrada
          </div>
          <div className="text-sm text-zinc-500">
            Verifica o link · se foi você que recebeu, fala com quem te mandou.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-10 px-4">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500 mb-2 font-medium">
            CMOVE.AI-ZAP
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{cobranca.etapa}</h1>
          <p className="text-sm text-zinc-500 mt-1">Para {cobranca.cliente_nome}</p>
        </header>

        {cobranca.status === 'PAGO' ? (
          <PaidCard cobranca={cobranca} />
        ) : cobranca.status === 'AGUARDANDO_CONFIRMACAO' ? (
          <PendingConfirmationCard cobranca={cobranca} />
        ) : cobranca.status === 'CANCELADO' ? (
          <CanceledCard />
        ) : (
          <PaymentCard
            cobranca={cobranca}
            qrDataUrl={qrDataUrl}
            copied={copied}
            onCopy={copyEmv}
            marking={marking}
            onMarkPaid={markPaid}
          />
        )}

        <footer className="mt-10 text-center text-[10px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-600">
          CMOVE.AI · pagamento seguro
        </footer>
      </div>
    </div>
  );
}

function PaymentCard({
  cobranca,
  qrDataUrl,
  copied,
  onCopy,
  marking,
  onMarkPaid,
}: {
  cobranca: PublicCobranca;
  qrDataUrl: string | null;
  copied: boolean;
  onCopy: () => void;
  marking: boolean;
  onMarkPaid: () => void;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-500 font-medium mb-1">
          Total
        </div>
        <div className="text-3xl font-semibold tabular-nums tracking-tight">
          {formatBrl(cobranca.valor)}
        </div>
        <div className="text-xs text-zinc-500 mt-2">
          Vencimento {formatDate(cobranca.vencimento)}
        </div>
      </div>

      {cobranca.pix_emv && qrDataUrl ? (
        <>
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-3 rounded-xl border border-zinc-200">
              <img src={qrDataUrl} alt="QR Code Pix" width={240} height={240} />
            </div>
            <p className="text-xs text-center text-zinc-500 leading-relaxed">
              Abra o app do seu banco · escolha Pix · escaneia esse QR Code
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-2">
              Ou copia e cola
            </div>
            <button
              onClick={onCopy}
              className="w-full flex items-center justify-between gap-3 px-3 py-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-left"
            >
              <code className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate flex-1">
                {cobranca.pix_emv.slice(0, 64)}…
              </code>
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-500 shrink-0" />
              )}
            </button>
            {copied && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 text-center">
                Copiado · cola no app do seu banco
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 space-y-2">
          <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Pix EMV ainda não disponível
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-500">
            Use a chave Pix abaixo manualmente:
          </div>
          <div className="text-sm font-mono bg-white dark:bg-zinc-950 rounded p-2 text-zinc-900 dark:text-zinc-100 break-all">
            {cobranca.pix_chave}
          </div>
        </div>
      )}

      {cobranca.pix_emv && (
        <button
          onClick={onCopy}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#1DB954] text-black rounded-xl hover:brightness-110 transition-all font-semibold"
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Código Pix copiado!' : 'Pagar com Pix'}
        </button>
      )}

      <button
        onClick={onMarkPaid}
        disabled={marking}
        className="w-full inline-flex items-center justify-center gap-2 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-medium disabled:opacity-50"
      >
        {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Já paguei
      </button>

      {cobranca.nf_url && (
        <a
          href={cobranca.nf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Baixar nota fiscal
        </a>
      )}
    </div>
  );
}

function PendingConfirmationCard({ cobranca }: { cobranca: PublicCobranca }) {
  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-5 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-center">
        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-500" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Estamos conferindo</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2 leading-relaxed">
          Recebemos a confirmação que você pagou · vamos validar no banco e te avisamos por aqui assim que estiver tudo certo.
        </p>
      </div>
      {cobranca.whatsapp_comprovante && (
        <a
          href={`https://wa.me/${cobranca.whatsapp_comprovante}?text=${encodeURIComponent(
            `Oi, paguei a cobrança ${cobranca.slug} de ${formatBrl(cobranca.valor)} · segue comprovante`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Mandar comprovante no WhatsApp
        </a>
      )}
    </div>
  );
}

function PaidCard({ cobranca }: { cobranca: PublicCobranca }) {
  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-8 space-y-5 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Pagamento confirmado</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
          {formatBrl(cobranca.valor)} ·{' '}
          {cobranca.pago_em &&
            new Date(cobranca.pago_em).toLocaleDateString('pt-BR')}
        </p>
      </div>
      {cobranca.nf_url && (
        <a
          href={cobranca.nf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          <FileText className="w-3.5 h-3.5" />
          Baixar nota fiscal
        </a>
      )}
    </div>
  );
}

function CanceledCard() {
  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
      <div className="text-sm text-zinc-500">Esta cobrança foi cancelada.</div>
    </div>
  );
}
