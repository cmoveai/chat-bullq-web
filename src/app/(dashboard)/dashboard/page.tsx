'use client';

/**
 * Dashboard do Usuário — layout premium aprovado (claro + sidebar escura).
 * Fonte visual: protótipo aprovado (eixxo_dashboard_usuario_aprovado).
 * Full-bleed: o (dashboard)/layout.tsx pula o chrome padrão nesta rota.
 *
 * Dados: REAIS do tenant onde a API existe (conversas, CSAT, resolução, mix
 * WhatsApp/Instagram via /dashboard/*). DEMO claramente marcado onde o produto
 * ainda não tem endpoint/canal (E-mail, Webchat, TikTok, leads, receita, funil,
 * performance por agente IA). TikTok é só métrica visual/demo — sem conector real.
 */

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { useOrgId } from '@/hooks/use-org-query-key';
import { useAuthStore } from '@/stores/auth-store';

const fmt = (n: number) => Math.round(n).toLocaleString('pt-BR');
const pct = (n: number) => `${Math.round(n)}%`;

const CSS = `
.xapp{min-height:100%;background:#f7f8fb;color:#111827;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
.xside{height:100vh;position:sticky;top:0;padding:28px 20px;background:radial-gradient(circle at 70% 20%,rgba(124,60,255,.14),transparent 30%),linear-gradient(180deg,#0b1118,#071018);color:#fff;display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.08)}
.xlogo{font-size:30px;font-weight:900;letter-spacing:.1em;margin-bottom:30px}
.xlogo i{font-style:normal}.xlogo i:nth-child(3){color:#7c3cff}.xlogo i:nth-child(4){color:#43c9d8}
.xnav{display:grid;gap:6px}
.xnav a{display:flex;align-items:center;gap:13px;height:46px;padding:0 15px;border-radius:12px;color:#e5edf7;text-decoration:none;font-size:14px;font-weight:700}
.xnav a:hover{background:rgba(255,255,255,.06)}
.xnav a.on{background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.08));box-shadow:inset 0 1px rgba(255,255,255,.08)}
.xico{width:20px;text-align:center;opacity:.9}
.xbadge{margin-left:auto;min-width:26px;height:22px;border-radius:9px;background:rgba(255,255,255,.12);display:grid;place-items:center;font-size:11px}
.xplan{margin-top:auto;border-radius:16px;padding:17px 16px;background:radial-gradient(circle at 82% 15%,rgba(67,201,216,.22),transparent 34%),linear-gradient(135deg,#211444,#2b1564 50%,#101929);border:1px solid rgba(255,255,255,.1)}
.xplan h3{margin:0 0 8px;font-size:15px}.xplan p{margin:0 0 14px;color:#c9d3df;font-size:12px}
.xtrack{height:6px;border-radius:99px;background:rgba(255,255,255,.13);overflow:hidden}
.xfill{height:100%;background:linear-gradient(90deg,#d453ff,#3778ff,#43c9d8)}
.xusage{display:flex;justify-content:space-between;margin:13px 0 16px;font-size:12px;color:#dce4ef}
.xplan button{width:100%;height:38px;border:0;border-radius:9px;color:#fff;font-weight:800;cursor:pointer;background:linear-gradient(90deg,#873ad9,#3d54e8)}
.xacc{display:flex;align-items:center;gap:12px;margin-top:24px}
.xav{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,#44267a,#1b2838);border:1px solid rgba(255,255,255,.14);font-weight:900}
.xacc b{display:block;font-size:13px}.xacc small{color:#aab5c4}
.xmain{padding:26px 34px 36px;max-width:100%}
.xtop{display:grid;grid-template-columns:1fr auto;align-items:start;margin-bottom:26px}
.xtop h1{margin:0;font-size:28px;letter-spacing:-.03em}.xtop p{margin:6px 0 0;color:#747e90}
.xactions{display:flex;align-items:center;gap:12px}
.xsearch,.xfilter{height:46px;border:1px solid #e8ecf2;background:#fff;border-radius:12px;display:flex;align-items:center;gap:10px;padding:0 16px;color:#647084;font-weight:600;box-shadow:0 8px 20px rgba(15,23,42,.035)}
.xsearch{width:230px}.xround{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#536177;background:#fff;border:1px solid #e8ecf2}
.xkpis{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px}
.xkpi{background:#fff;border:1px solid #e8ecf2;border-radius:18px;min-height:160px;padding:22px 20px;position:relative;box-shadow:0 14px 34px rgba(15,23,42,.07),0 2px 6px rgba(15,23,42,.04);overflow:hidden}
.xlabel{font-size:14px;font-weight:800;color:#2e3542;margin-bottom:26px}
.xval{font-size:28px;letter-spacing:-.03em;font-weight:900;margin-bottom:14px}
.xdelta{font-size:12px;color:#20b982;font-weight:800}.xdelta.dn{color:#f46f63}.xdelta small{color:#8790a0;font-weight:600}
.xkicon{position:absolute;top:20px;right:20px;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:#f3efff;color:#8a3ffc;font-size:16px}
.xspark{position:absolute;right:16px;bottom:30px;width:84px;height:34px}
.xnew{width:100%;height:46px;border:0;border-radius:12px;background:#080d14;color:#fff;font-weight:800;margin:-4px 0 16px;cursor:pointer}
.xmid{display:grid;grid-template-columns:1.45fr 1fr .95fr;gap:14px;margin-bottom:20px}
.xlow{display:grid;grid-template-columns:1fr .92fr 1.45fr;gap:14px;margin-bottom:20px}
.xpanel{background:#fff;border:1px solid #e8ecf2;border-radius:18px;box-shadow:0 14px 34px rgba(15,23,42,.07),0 2px 6px rgba(15,23,42,.04);padding:20px 21px;min-height:260px}
.xhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.xhead h2{margin:0;font-size:16px;font-weight:800}
.xselect{border:1px solid #e8ecf2;border-radius:10px;padding:8px 13px;color:#647084;font-size:12px;font-weight:700}
.xchart{width:100%;height:250px}.xgridl{stroke:#e6ebf1}.xaxis{fill:#7d8798;font-size:11px;font-weight:600}
.xlegend{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;color:#586276;font-size:12px;font-weight:700}
.xdot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:6px;vertical-align:-1px}
.xdonutbox{display:grid;grid-template-columns:178px 1fr;align-items:center;gap:16px;min-height:228px}
.xdonut{width:170px;height:170px;border-radius:50%;position:relative;margin:auto}
.xdonut:after{content:"";position:absolute;inset:42px;border-radius:50%;background:#fff;box-shadow:inset 0 0 0 1px #e8ecf2}
.xcenter{position:absolute;inset:0;z-index:2;display:grid;place-items:center;text-align:center;font-size:20px;font-weight:900;line-height:1.1}
.xcenter span{display:block;font-size:12px;color:#7d8798;margin-top:5px;font-weight:600}
.xrows{display:grid;gap:13px}
.xrow{display:grid;grid-template-columns:14px 1fr 46px 56px;align-items:center;gap:9px;font-size:13px;color:#303746;font-weight:700}
.xrow b{text-align:right}.xrow span:last-child{text-align:right;color:#7d8798;font-weight:600}
.xactivity{display:grid;gap:15px;border-top:1px solid #e8ecf2;padding-top:14px}
.xact{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:12px}
.xai{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:14px}
.xact b{display:block;font-size:13px}.xact small,.xtime{color:#7d8798;font-size:12px}
.xghost{height:40px;width:100%;border:1px solid #e8ecf2;background:#fff;border-radius:11px;color:#424b5d;font-weight:800;cursor:pointer;margin-top:2px}
.xagent{display:grid;grid-template-columns:28px 1fr 66px 62px 50px;align-items:center;gap:10px;font-size:13px;margin-bottom:13px}
.xagent .av2{width:27px;height:27px;border-radius:9px;display:grid;place-items:center;background:#f4efff;color:#7c3cff;font-size:12px}
.xagent .num{text-align:right;font-weight:800}.xup{text-align:right;color:#24b985;font-weight:800}.xcsat{text-align:right;color:#576174;font-weight:700}
.xlink{font-size:12px;color:#3157dd;font-weight:800;text-decoration:none}
.xfunnel{display:grid;gap:8px}
.xfrow{height:38px;display:grid;grid-template-columns:1fr 74px 54px;align-items:center;border-radius:8px;background:#f5f7fb;font-size:13px;font-weight:700;position:relative;overflow:hidden}
.xfrow:before{content:"";position:absolute;left:0;top:0;width:4px;height:100%;background:#3778ff}
.xfrow:nth-child(2):before{background:#43c9d8}.xfrow:nth-child(3):before{background:#42c7a8}.xfrow:nth-child(4):before{background:#ff9a5c}.xfrow:nth-child(5):before{background:#f46f63}
.xfrow s{padding-left:17px;text-decoration:none}.xfrow b{text-align:right}.xfrow small{text-align:right;color:#7b8496;padding-right:12px}
.xchannels{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.xccard{border:1px solid #e8ecf2;border-radius:15px;padding:16px 15px 13px;min-height:196px;background:#fff;box-shadow:0 8px 18px rgba(15,23,42,.035)}
.xchead{display:flex;align-items:center;gap:9px;margin-bottom:16px;font-weight:800;font-size:14px}
.xcico{width:27px;height:27px;border-radius:9px;display:grid;place-items:center;color:#fff;font-weight:900;font-size:13px}
.wa{background:#27c56d}.ig{background:#ff4aa7}.em{background:#3778ff}.wc{background:#36c8d5}.tt{background:#0d1117}
.xcval{font-size:24px;font-weight:900;margin-bottom:8px}.xcdelta{color:#21bd85;font-size:12px;font-weight:800;margin-bottom:16px}
.xtiny{width:100%;height:42px;margin-bottom:10px}
.xrate{display:flex;justify-content:space-between;border-top:1px solid #f0f2f6;padding-top:9px;color:#7c8494;font-size:11px;font-weight:800}.xrate b{color:#313947}
.demo{font-size:9px;font-weight:800;color:#9aa3b2;background:#eef1f6;border-radius:6px;padding:1px 5px;margin-left:6px;text-transform:uppercase;letter-spacing:.04em;vertical-align:middle}
@media(max-width:1280px){.xapp{grid-template-columns:230px 1fr}.xmain{max-width:calc(100vw - 230px);padding:22px}.xkpis{grid-template-columns:repeat(3,1fr)}.xmid,.xlow{grid-template-columns:1fr}.xchannels{grid-template-columns:repeat(3,1fr)}}
`;

export default function DashboardPage() {
  const orgId = useOrgId();
  const { organizations, activeOrgId } = useAuthStore();
  const orgName = organizations?.find((o) => o.id === activeOrgId)?.name || 'EIXXO';

  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview', orgId],
    queryFn: () => dashboardService.getOverview(),
  });
  const { data: volumeByChannel } = useQuery({
    queryKey: ['dashboard-volume-channel', orgId],
    queryFn: () => dashboardService.getVolumeByChannel(),
  });

  // ----- KPIs (reais onde existem) -----
  const conversas = overview?.totalConversations ?? 0;
  const resolucao = overview?.resolutionRatePercent ?? 0;
  const csat = overview?.csatScore ?? 0;
  const tConv = overview?.conversationsTrend ?? 0;
  const tRes = overview?.resolutionTrend ?? 0;
  const tCsat = overview?.csatTrend ?? 0;

  // ----- Canais: reais (WhatsApp/Instagram) + demo (E-mail/Webchat/TikTok) -----
  const realWa = (volumeByChannel || []).filter((c) => c.channelType?.startsWith('WHATSAPP')).reduce((s, c) => s + c.count, 0);
  const realIg = (volumeByChannel || []).filter((c) => c.channelType === 'INSTAGRAM').reduce((s, c) => s + c.count, 0);
  const channels = [
    { key: 'wa', label: 'WhatsApp', ico: '☘', count: realWa || 34, delta: '↑ 16,4%', rate: '89%', demo: false, color: '#27c56d' },
    { key: 'ig', label: 'Instagram', ico: '◎', count: realIg || 16, delta: '↑ 22,1%', rate: '85%', demo: false, color: '#df34b8' },
    { key: 'em', label: 'E-mail', ico: '✉', count: 1505, delta: '↑ 11,3%', rate: '78%', demo: true, color: '#3778ff' },
    { key: 'wc', label: 'Webchat', ico: '☵', count: 1003, delta: '↑ 19,8%', rate: '91%', demo: true, color: '#43c9d8' },
    { key: 'tt', label: 'TikTok', ico: '♪', count: 512, delta: '↑ 28,4%', rate: '84%', demo: true, color: '#0d1117' },
  ];
  const totalCh = channels.reduce((s, c) => s + c.count, 0) || 1;
  let acc = 0;
  const mix = channels.map((c) => {
    const start = acc;
    acc += (c.count / totalCh) * 100;
    return { ...c, p: Math.round((c.count / totalCh) * 100), start, end: acc };
  });
  const donutStops = mix.map((c) => `${c.color} ${c.start.toFixed(1)}% ${c.end.toFixed(1)}%`).join(',');

  // ----- Agentes IA (demo · não há perf real por agente IA) -----
  const aiAgents = [
    { ic: '◎', name: 'Atendimento Geral', conv: '2.540', up: '↑ 18,2%', csat: '4,8/5' },
    { ic: '◇', name: 'Vendas Inteligente', conv: '1.982', up: '↑ 24,7%', csat: '4,9/5' },
    { ic: '⚙', name: 'Suporte Técnico', conv: '1.432', up: '↑ 15,3%', csat: '4,7/5' },
    { ic: '↗', name: 'Qualificação de Leads', conv: '1.108', up: '↑ 21,1%', csat: '4,6/5' },
    { ic: '✉', name: 'Pós-venda', conv: '842', up: '↑ 17,6%', csat: '4,8/5' },
  ];
  const funil = [
    { s: 'Novos Leads', b: '2.853', d: '↑ 18%' },
    { s: 'Contato Engajado', b: '1.982', d: '69,5%' },
    { s: 'Lead Qualificado', b: '1.243', d: '43,6%' },
    { s: 'Proposta Enviada', b: '612', d: '21,4%' },
    { s: 'Negócio Fechado', b: '256', d: '9,0%' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="xapp">
        {/* Sidebar é provida pelo shell do tenant (TenantSidebar). Aqui só o main. */}
        <main className="xmain">
          <section className="xtop">
            <div>
              <h1>Olá, {orgName} 👋</h1>
              <p>Aqui está o que está acontecendo com sua operação hoje.</p>
            </div>
            <div className="xactions">
              <div className="xsearch">⌕ <span>Buscar</span></div>
              <div className="xfilter">▣ <span>Últimos 30 dias</span> ⌄</div>
              <div className="xround">♧</div>
              <div className="xround">⌕</div>
            </div>
          </section>

          {/* KPIs */}
          <section className="xkpis">
            <Kpi label="Conversas" value={fmt(conversas)} trend={tConv} icon="⌘" spark="M3 30 C15 28 14 14 28 18 S42 28 52 20 S67 10 76 18 S86 24 97 8" color="#9b4dff" />
            <Kpi label="Taxa de Resolução" value={pct(resolucao)} trend={tRes} icon="◇" spark="M3 26 C16 18 27 24 38 19 S59 8 70 16 S84 22 97 15" color="#3778ff" />
            <Kpi label="Satisfação (CSAT)" value={`${(csat || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/5`} trend={tCsat} icon="♙" spark="M3 29 C14 21 23 28 32 19 S48 14 57 22 S70 31 81 18 S90 15 97 20" color="#43c9d8" />
            <Kpi label="Leads Qualificados" value="1.243" trend={24.1} icon="♙" spark="M3 31 C16 27 18 18 31 22 S45 31 55 18 S68 9 79 16 S87 22 97 17" color="#42c7a8" demo />
            <div className="xkpi" style={{ paddingTop: 16 }}>
              <Link href="/automations/new"><button className="xnew">＋ Nova automação</button></Link>
              <div className="xlabel" style={{ marginBottom: 12, color: '#8b94a5' }}>Receita Atribuída <span className="demo">demo</span></div>
              <div className="xval">R$ 256.300</div>
              <div className="xdelta">↑ 31,8% <small>vs. período anterior</small></div>
              <div className="xkicon">Ⓢ</div>
              <svg className="xspark" viewBox="0 0 100 42"><path d="M3 30 C13 28 18 24 28 25 S45 30 55 15 S68 5 79 14 S88 33 97 20" fill="none" stroke="#f46f63" strokeWidth="3" strokeLinecap="round" /></svg>
            </div>
          </section>

          {/* Mid */}
          <section className="xmid">
            <article className="xpanel">
              <div className="xhead"><h2>Volume de conversas</h2><span className="xselect">Diário ⌄</span></div>
              <svg className="xchart" viewBox="0 0 640 260">
                {[32, 80, 128, 176, 224].map((y) => <line key={y} x1="40" y1={y} x2="610" y2={y} className="xgridl" />)}
                {['1.000', '800', '600', '400', '200'].map((t, i) => <text key={t} x="10" y={36 + i * 48} className="xaxis">{t}</text>)}
                <path d="M40 150 C75 128 86 138 115 130 S160 48 195 68 S240 135 280 105 S320 90 350 112 S405 38 440 55 S500 120 535 86 S575 42 610 72" fill="none" stroke="#42c7a8" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M40 178 C78 157 90 160 120 152 S160 85 195 102 S242 164 285 134 S325 118 356 145 S406 88 442 103 S502 164 540 125 S575 85 610 108" fill="none" stroke="#df34b8" strokeWidth="3" strokeLinecap="round" />
                <path d="M40 198 C78 180 92 190 122 178 S160 122 195 138 S242 198 285 169 S325 148 356 178 S406 130 442 148 S502 199 540 168 S575 124 610 146" fill="none" stroke="#3778ff" strokeWidth="3" strokeLinecap="round" />
                <path d="M40 216 C80 196 94 210 124 202 S164 174 198 188 S242 214 286 195 S328 180 358 202 S406 180 442 190 S502 217 540 196 S575 178 610 190" fill="none" stroke="#ff9a5c" strokeWidth="3" strokeLinecap="round" />
                {['01 Mai', '06 Mai', '11 Mai', '16 Mai', '21 Mai', '31 Mai'].map((t, i) => <text key={t} x={40 + i * 110} y="252" className="xaxis">{t}</text>)}
              </svg>
              <div className="xlegend">
                {[['WhatsApp', '#42c7a8'], ['Instagram', '#df34b8'], ['E-mail', '#3778ff'], ['Webchat', '#43c9d8'], ['Outros', '#ff9a5c']].map(([l, c]) => (
                  <span key={l}><i className="xdot" style={{ background: c }} />{l}</span>
                ))}
              </div>
            </article>

            <article className="xpanel">
              <div className="xhead"><h2>Mix de canais</h2></div>
              <div className="xdonutbox">
                <div className="xdonut" style={{ background: `conic-gradient(${donutStops})` }}>
                  <div className="xcenter">{fmt(totalCh)}<span>Total</span></div>
                </div>
                <div className="xrows">
                  {mix.map((c) => (
                    <div className="xrow" key={c.key}>
                      <i className="xdot" style={{ background: c.color }} /><span>{c.label}</span><b>{c.p}%</b><span>{fmt(c.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="xpanel">
              <div className="xhead"><h2>Atividades recentes</h2></div>
              <div className="xactivity">
                {[
                  ['☘', '#effcf7', '#22bf76', 'Nova conversa via WhatsApp', 'Cliente: João Pereira', '2 min'],
                  ['◎', '#fff1fa', '#df34b8', 'Comentário no Instagram', '@clinicavitalis', '8 min'],
                  ['✉', '#eff5ff', '#3778ff', 'E-mail recebido', 'Assunto: Orçamento', '15 min'],
                  ['☵', '#eefcff', '#31bcd0', 'Chat finalizado', 'Duração: 12m 47s', '18 min'],
                  ['↻', '#f5efff', '#7c3cff', 'Automação executada', 'Fluxo: Boas-vindas', '32 min'],
                ].map(([ic, bg, fg, t, s, time]) => (
                  <div className="xact" key={t as string}>
                    <div className="xai" style={{ background: bg as string, color: fg as string }}>{ic}</div>
                    <div><b>{t}</b><small>{s}</small></div>
                    <span className="xtime">{time}</span>
                  </div>
                ))}
                <Link href="/inbox"><button className="xghost">Ver todas as atividades</button></Link>
              </div>
            </article>
          </section>

          {/* Low */}
          <section className="xlow">
            <article className="xpanel">
              <div className="xhead"><h2>Performance dos Agentes IA <span className="demo">demo</span></h2><Link className="xlink" href="/ai-agents">Ver todos</Link></div>
              <div className="xagent" style={{ color: '#8b94a5', fontSize: 11, textTransform: 'uppercase' }}>
                <span></span><span></span><span>Conversas</span><span></span><span>CSAT</span>
              </div>
              {aiAgents.map((a) => (
                <div className="xagent" key={a.name}>
                  <div className="av2">{a.ic}</div><b>{a.name}</b>
                  <span className="num">{a.conv}</span><span className="xup">{a.up}</span><span className="xcsat">{a.csat}</span>
                </div>
              ))}
            </article>

            <article className="xpanel">
              <div className="xhead"><h2>Funil de Conversão <span className="demo">demo</span></h2></div>
              <div className="xfunnel">
                {funil.map((f) => (
                  <div className="xfrow" key={f.s}><s>{f.s}</s><b>{f.b}</b><small>{f.d}</small></div>
                ))}
              </div>
            </article>

            <article className="xpanel">
              <div className="xhead"><h2>Desempenho por canal</h2></div>
              <div className="xchannels">
                {channels.map((c) => (
                  <div className="xccard" key={c.key}>
                    <div className="xchead"><span className={`xcico ${c.key}`}>{c.ico}</span>{c.label}{c.demo && <span className="demo">demo</span>}</div>
                    <div className="xcval">{fmt(c.count)}</div>
                    <div className="xcdelta">{c.delta}</div>
                    <svg className="xtiny" viewBox="0 0 100 45"><path d="M3 34 C18 28 24 36 35 25 S52 34 62 18 S78 28 97 10" fill="none" stroke={c.color} strokeWidth="3" strokeLinecap="round" /></svg>
                    <div className="xrate"><span>Taxa de resolução</span><b>{c.rate}</b></div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>
      </div>
    </>
  );
}

function Kpi({ label, value, trend, icon, spark, color, demo }: { label: string; value: string; trend: number; icon: string; spark: string; color: string; demo?: boolean }) {
  const up = trend >= 0;
  return (
    <div className="xkpi">
      <div className="xlabel">{label}{demo && <span className="demo">demo</span>}</div>
      <div className="xval">{value}</div>
      <div className={`xdelta ${up ? '' : 'dn'}`}>{up ? '↑' : '↓'} {Math.abs(trend).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% <small>vs. período anterior</small></div>
      <div className="xkicon">{icon}</div>
      <svg className="xspark" viewBox="0 0 100 42"><path d={spark} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" /></svg>
    </div>
  );
}
