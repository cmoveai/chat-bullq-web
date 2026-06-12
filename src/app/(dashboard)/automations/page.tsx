'use client';

/**
 * Automation Workspace (Flow Builder) — experiência premium clara.
 * Mantém o shell global EIXXO; redesenha só o conteúdo da rota /automations.
 * Lógica preservada: list/stats/toggle(update)/remove + abrir builder + criar nova.
 * Dados reais quando existem; cards demo locais completam o workspace (sem integração real).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Power, PowerOff, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { automationsService, type Automation } from '@/features/automations/services/automations.service';

const CSS = `
.awrap{display:grid;grid-template-columns:288px 1fr;gap:16px;height:100%;min-height:100%;padding:20px 22px;background:#f7f8fb;color:#111827;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
.apanel{background:#fff;border:1px solid #e8ecf2;border-radius:18px;box-shadow:0 14px 34px rgba(15,23,42,.06),0 2px 6px rgba(15,23,42,.04);display:flex;flex-direction:column;overflow:hidden}
.aside-h{padding:18px 18px 14px;border-bottom:1px solid #eef1f6}
.aside-h h2{margin:0 0 12px;font-size:16px;font-weight:900}
.asearch{display:flex;align-items:center;gap:8px;height:38px;border:1px solid #e8ecf2;border-radius:10px;padding:0 12px;color:#8a93a3;font-size:13px;background:#fafbfc}
.asearch input{border:0;outline:0;background:transparent;font-size:13px;color:#303746;width:100%}
.aadd{margin-top:11px;width:100%;height:40px;border:0;border-radius:11px;color:#fff;font-weight:800;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(90deg,#3d54e8,#43c9d8)}
.alist{padding:8px 10px 14px;overflow-y:auto}
.agrp{margin:12px 8px 6px;font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#9aa3b2;font-weight:800}
.aitem{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:11px;cursor:pointer}
.aitem:hover{background:#f5f7fb}
.aico{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:#f3efff;color:#7c3cff;font-size:13px;flex:0 0 30px}
.aitem .nm{font-size:13px;font-weight:700;color:#2b3340;line-height:1.15;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.adot{width:8px;height:8px;border-radius:50%;flex:0 0 8px}.adot.on{background:#25c77a}.adot.off{background:#cbd2dc}
.amenu{border:0;background:none;color:#aab2bf;cursor:pointer;display:grid;place-items:center;padding:2px}
.amenu:hover{color:#5b6473}
.amain{display:flex;flex-direction:column;min-width:0;background:#fff;border:1px solid #e8ecf2;border-radius:18px;box-shadow:0 14px 34px rgba(15,23,42,.06),0 2px 6px rgba(15,23,42,.04);overflow:hidden}
.amain-h{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #eef1f6}
.amain-h h1{margin:0;font-size:19px;font-weight:900;letter-spacing:-.02em}
.atabs{display:flex;gap:6px;margin-top:10px}
.atab{font-size:12.5px;font-weight:800;color:#3157dd;background:#eef2ff;border-radius:9px;padding:6px 13px}
.amain-search{display:flex;align-items:center;gap:8px;height:40px;border:1px solid #e8ecf2;border-radius:11px;padding:0 13px;color:#8a93a3;font-size:13px;min-width:230px;background:#fafbfc}
.amain-search input{border:0;outline:0;background:transparent;font-size:13px;color:#303746;width:100%}
.canvas{flex:1;overflow-y:auto;padding:24px;background:#fbfcfe;background-image:radial-gradient(#d7deea 1px,transparent 1px);background-size:22px 22px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(264px,1fr));gap:18px}
.fcard{background:#fff;border:1px solid #e8ecf2;border-radius:16px;box-shadow:0 8px 20px rgba(15,23,42,.05);overflow:hidden;display:flex;flex-direction:column}
.thumb{height:118px;background:#f6f8fc;background-image:radial-gradient(#dde4ef 1px,transparent 1px);background-size:14px 14px;position:relative;border-bottom:1px solid #eef1f6}
.fbody{padding:15px 16px 16px}
.fbody h3{margin:0 0 3px;font-size:14.5px;font-weight:850}
.fbody p{margin:0 0 14px;font-size:12px;color:#7b8496;line-height:1.4}
.fstatus{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;margin-bottom:13px}
.fstatus.on{color:#1f9d63}.fstatus.off{color:#97a0ad}
.fopen{width:100%;height:38px;border:1px solid #d8e0f5;border-radius:10px;background:#fff;color:#2746cc;font-weight:800;font-size:12.5px;cursor:pointer}
.fopen:hover{background:#f3f6ff}
.demo{font-size:8.5px;font-weight:800;color:#9aa3b2;background:#eef1f6;border-radius:5px;padding:1px 5px;margin-left:6px;text-transform:uppercase;letter-spacing:.04em;vertical-align:middle}
/* card criar nova — claro premium */
.newcard{background:linear-gradient(165deg,#ffffff,#f4f1ff);color:#111827;border:1px solid #e4ddf7;border-radius:16px;padding:20px 19px;display:flex;flex-direction:column;box-shadow:0 14px 30px rgba(124,60,255,.08),0 2px 6px rgba(15,23,42,.04)}
.newcard h3{margin:0 0 8px;font-size:16px;font-weight:900}
.newcard p{margin:0 0 16px;font-size:12.5px;color:#6b7480;line-height:1.5}
.cats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
.cat{height:36px;border-radius:9px;border:1px solid #e6e0f6;background:#faf8ff;color:#5b4b86;font-size:12px;font-weight:700;display:grid;place-items:center}
.newbtn{margin-top:auto;width:100%;height:42px;border:0;border-radius:11px;color:#fff;font-weight:850;font-size:13px;cursor:pointer;background:linear-gradient(90deg,#7c3cff,#3d54e8 55%,#43c9d8)}
.notice{margin:0 24px 22px;display:flex;align-items:flex-start;gap:11px;padding:13px 15px;border:1px solid #e6ebf2;border-left:3px solid #43c9d8;border-radius:0 12px 12px 0;background:#f6fafc;color:#5b6678;font-size:12.5px;line-height:1.5}
.notice b{color:#3a4150}
.nico{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;background:#e3f5f8;color:#2a9fb0;flex:0 0 22px;font-size:12px}
`;

// preview esquemático de fluxo (nós + conectores) sobre grid pontilhado
function FlowThumb({ tint = '#7c3cff' }: { tint?: string }) {
  return (
    <svg viewBox="0 0 264 118" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <line x1="48" y1="40" x2="118" y2="40" stroke="#cfd8e6" strokeWidth="2" />
      <line x1="166" y1="40" x2="210" y2="40" stroke="#cfd8e6" strokeWidth="2" />
      <line x1="142" y1="56" x2="142" y2="80" stroke="#cfd8e6" strokeWidth="2" />
      <rect x="18" y="28" width="30" height="24" rx="7" fill={tint} opacity="0.85" />
      <rect x="118" y="26" width="48" height="28" rx="8" fill="#fff" stroke="#d7dfeb" strokeWidth="1.5" />
      <rect x="120" y="80" width="44" height="24" rx="7" fill="#fff" stroke="#d7dfeb" strokeWidth="1.5" />
      <rect x="210" y="30" width="30" height="22" rx="7" fill="#43c9d8" opacity="0.8" />
      <circle cx="142" cy="40" r="3" fill={tint} />
    </svg>
  );
}

type DemoCard = { id: string; name: string; subtitle: string; group: 'Lançamento' | 'Suporte'; active: boolean; tint: string; demo: true };

const DEMO_CARDS: DemoCard[] = [
  { id: 'd_seq', name: 'Sequência de Lançamento', subtitle: 'Aquecimento do lançamento', group: 'Lançamento', active: true, tint: '#df34b8', demo: true },
  { id: 'd_leadnovo', name: 'Automação “LEAD NOVO”', subtitle: 'Captura com Leadster', group: 'Lançamento', active: true, tint: '#3778ff', demo: true },
  { id: 'd_novolead', name: 'Novo Lead', subtitle: 'Entrada e roteamento', group: 'Lançamento', active: false, tint: '#7c3cff', demo: true },
  { id: 'd_onb', name: 'Onboarding do Aluno', subtitle: 'Suporte pós-compra', group: 'Suporte', active: true, tint: '#42c7a8', demo: true },
];

export default function AutomationsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const [q, setQ] = useState('');

  useQuery({ queryKey: ['automations', 'stats'], queryFn: () => automationsService.stats(), refetchInterval: 60_000 });
  const listQuery = useQuery({ queryKey: ['automations', 'list'], queryFn: () => automationsService.list() });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => automationsService.update(id, { isActive }),
    onSuccess: () => { toast.success('Automação atualizada'); qc.invalidateQueries({ queryKey: ['automations'] }); },
    onError: (err: any) => toast.error(err?.message || 'Erro ao atualizar automação'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => automationsService.remove(id),
    onSuccess: () => { toast.success('Automação removida'); qc.invalidateQueries({ queryKey: ['automations'] }); },
    onError: (err: any) => toast.error(err?.message || 'Erro ao remover'),
  });

  const raw = listQuery.data;
  const real: Automation[] = Array.isArray(raw) ? raw : [];

  const openReal = (a: Automation) => router.push(`/automations/builder/${a.id}`);
  const createNew = () => router.push('/automations/new');
  const handleToggle = (a: Automation) => toggleMutation.mutate({ id: a.id, isActive: !a.isActive });
  const handleDelete = (a: Automation) => { if (confirm(`Excluir a automação "${a.name}"?`)) deleteMutation.mutate(a.id); };

  // grupos do painel contextual (reais em Lançamento; demo de Suporte completa)
  const realActive = real.filter((a) => q ? a.name.toLowerCase().includes(q.toLowerCase()) : true);
  const groups = {
    'Lançamento': [
      ...realActive.map((a) => ({ kind: 'real' as const, a })),
      ...DEMO_CARDS.filter((d) => d.group === 'Lançamento').map((d) => ({ kind: 'demo' as const, d })),
    ],
    'Suporte': DEMO_CARDS.filter((d) => d.group === 'Suporte').map((d) => ({ kind: 'demo' as const, d })),
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="awrap">
        {/* ===== Painel contextual esquerdo ===== */}
        <aside className="apanel">
          <div className="aside-h">
            <h2>Automações</h2>
            <div className="asearch"><Search size={15} /><input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <button className="aadd" onClick={createNew}><Plus size={16} /> Adicionar automação</button>
          </div>
          <div className="alist">
            {Object.entries(groups).map(([grp, items]) => (
              <div key={grp}>
                <div className="agrp">{grp}</div>
                {items.length === 0 && <div style={{ padding: '4px 12px', fontSize: 12, color: '#aab2bf' }}>—</div>}
                {items.map((it, i) => {
                  if (it.kind === 'real') {
                    const a = it.a;
                    return (
                      <div className="aitem" key={a.id} onClick={() => openReal(a)}>
                        <div className="aico">⚡</div>
                        <span className="nm">{a.name}</span>
                        <span className={`adot ${a.isActive ? 'on' : 'off'}`} />
                        <button className="amenu" title={a.isActive ? 'Desativar' : 'Ativar'} onClick={(e) => { e.stopPropagation(); handleToggle(a); }}>
                          {a.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                        </button>
                        <button className="amenu" title="Excluir" onClick={(e) => { e.stopPropagation(); handleDelete(a); }}><Trash2 size={14} /></button>
                      </div>
                    );
                  }
                  const d = it.d;
                  return (
                    <div className="aitem" key={d.id} onClick={createNew}>
                      <div className="aico" style={{ background: '#eef2ff', color: d.tint }}>⚡</div>
                      <span className="nm">{d.name}<span className="demo">demo</span></span>
                      <span className={`adot ${d.active ? 'on' : 'off'}`} />
                      <button className="amenu"><MoreHorizontal size={15} /></button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* ===== Área principal ===== */}
        <section className="amain">
          <div className="amain-h">
            <div>
              <h1>Fluxo de automações</h1>
              <div className="atabs"><span className="atab">Minhas Automações</span></div>
            </div>
            <div className="amain-search"><Search size={15} /><input placeholder="Pesquisar..." /></div>
          </div>

          <div className="canvas">
            <div className="cards">
              {/* Card criar nova */}
              <div className="newcard">
                <h3>Criar nova automação</h3>
                <p>Crie fluxos automáticos para qualificar leads, acionar follow-ups e organizar sua operação comercial.</p>
                <div className="cats">
                  {['Lançamento', 'Suporte', 'Vendas', 'Atendimento'].map((c) => <div className="cat" key={c}>{c}</div>)}
                </div>
                <button className="newbtn" onClick={createNew}>Criar nova automação</button>
              </div>

              {/* Cards reais */}
              {realActive.map((a) => (
                <div className="fcard" key={a.id}>
                  <div className="thumb"><FlowThumb tint="#7c3cff" /></div>
                  <div className="fbody">
                    <h3>{a.name}</h3>
                    <p>{a.description || 'Fluxo de automação comercial'}</p>
                    <div className={`fstatus ${a.isActive ? 'on' : 'off'}`}><span className={`adot ${a.isActive ? 'on' : 'off'}`} />{a.isActive ? 'Ativa' : 'Inativa'}</div>
                    <button className="fopen" onClick={() => openReal(a)}>Abrir automação</button>
                  </div>
                </div>
              ))}

              {/* Cards demo */}
              {DEMO_CARDS.map((d) => (
                <div className="fcard" key={d.id}>
                  <div className="thumb"><FlowThumb tint={d.tint} /></div>
                  <div className="fbody">
                    <h3>{d.name}<span className="demo">demo</span></h3>
                    <p>{d.subtitle}</p>
                    <div className={`fstatus ${d.active ? 'on' : 'off'}`}><span className={`adot ${d.active ? 'on' : 'off'}`} />{d.active ? 'Ativa' : 'Inativa'}</div>
                    <button className="fopen" onClick={createNew}>Abrir automação</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aviso técnico discreto */}
          <div className="notice">
            <div className="nico">ℹ</div>
            <div><b>Execução automática via webhook Meta ainda está em evolução.</b> Você já pode estruturar fluxos e validar jornadas em ambiente seguro.</div>
          </div>
        </section>
      </div>
    </>
  );
}
