import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Segurança · EIXXO',
  description:
    'Política de Divulgação Responsável · canal de reporte · hall of fame · EIXXO',
  robots: { index: true, follow: true },
};

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
          Cyber Onda 2 · EIXXO
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Política de Divulgação Responsável
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Última atualização: 2026-05-14 · versão 1.0
        </p>
      </header>

      <section className="prose prose-zinc max-w-none py-10 dark:prose-invert">
        <h2>Compromisso</h2>
        <p>
          A CMOVE.AI valoriza pesquisadores de segurança que ajudam a manter
          nossa plataforma segura. Esta política descreve como reportar
          vulnerabilidades de forma responsável e o que esperar em retorno.
        </p>

        <h2>Escopo</h2>
        <p>Sistemas no escopo:</p>
        <ul>
          <li>
            <code>https://zap.cmove.ai</code> · frontend SaaS
          </li>
          <li>
            <code>https://zap.cmove.ai/api/v1/*</code> · backend NestJS
          </li>
          <li>Mobile apps oficiais EIXXO (quando lançarem)</li>
        </ul>
        <p>Fora do escopo:</p>
        <ul>
          <li>Ataques de engenharia social a funcionários ou clientes</li>
          <li>DoS / DDoS volumétrico</li>
          <li>Subdomínios não listados acima ou domínios de clientes</li>
          <li>
            Vulnerabilidades em dependências de terceiros sem PoC funcional na
            nossa plataforma
          </li>
        </ul>

        <h2>Como reportar</h2>
        <p>
          Envie um e-mail para{' '}
          <a href="mailto:security@cmove.ai">security@cmove.ai</a> com:
        </p>
        <ul>
          <li>Descrição clara da vulnerabilidade</li>
          <li>Passos pra reproduzir (PoC)</li>
          <li>Impacto potencial</li>
          <li>Sugestão de mitigação (opcional · ajuda muito)</li>
          <li>Seu nome ou handle pra créditos no Hall of Fame (opcional)</li>
        </ul>
        <p>
          Use PGP se possível ·{' '}
          <a href="/.well-known/pgp-key.txt">chave pública</a> ·{' '}
          <a href="/.well-known/security.txt">security.txt</a>.
        </p>

        <h2>Compromisso de resposta · SLA</h2>
        <ul>
          <li>
            <strong>24h</strong> · ack do recebimento
          </li>
          <li>
            <strong>72h</strong> · triagem inicial (severidade · escopo · status)
          </li>
          <li>
            <strong>14 dias</strong> · plano de remediação ou fix deployado
          </li>
          <li>
            <strong>90 dias</strong> · janela de embargo antes de publicação
            (negociável caso a caso)
          </li>
        </ul>

        <h2>O que pedimos</h2>
        <ul>
          <li>
            Não exfiltrar, modificar nem deletar dados além do mínimo necessário
            pra demonstrar o impacto
          </li>
          <li>Não testar contra contas/dados de terceiros</li>
          <li>Não publicar a vulnerabilidade até resolvermos</li>
          <li>Não executar ataques de força bruta automatizados em escala</li>
        </ul>

        <h2>O que oferecemos</h2>
        <ul>
          <li>Reconhecimento público no Hall of Fame (se aceitar)</li>
          <li>
            Resposta clara · resolução documentada · acesso ao patch quando
            possível
          </li>
          <li>
            Programa de bug bounty público em breve (cadastro HackerOne · veja{' '}
            <em>Pendências</em> abaixo)
          </li>
        </ul>

        <h2>Pendências roadmap</h2>
        <p>
          Esta política está em produção · porém ainda construímos:
        </p>
        <ul>
          <li>Programa formal HackerOne · payouts por severidade (CVSS)</li>
          <li>Pentest manual contratado · 1×/ano com empresa BR</li>
          <li>
            Auditoria interna trimestral · status público em{' '}
            <a href="https://cmove.ai/business/seguranca.html">
              cmove.ai/business/seguranca
            </a>
          </li>
        </ul>

        <h2 id="hall-of-fame">Hall of Fame</h2>
        <p>
          Ainda sem reportes. Seja o primeiro a contribuir · seu nome aparece
          aqui.
        </p>

        <h2>Status técnico atual</h2>
        <p>
          Acompanhe nosso framework de segurança e LGPD em{' '}
          <a href="https://cmove.ai/business/seguranca.html">
            cmove.ai/business/seguranca
          </a>{' '}
          (Cyber 3 ondas · LGPD 2 ondas · onda 1 cyber + LGPD em produção · onda
          2 em curso).
        </p>
      </section>

      <footer className="border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800">
        <Link href="/" className="hover:underline">
          ← Voltar pra zap.cmove.ai
        </Link>
        <span className="mx-3">·</span>
        <a href="https://cmove.ai/privacidade" className="hover:underline">
          Política de privacidade
        </a>
      </footer>
    </main>
  );
}
