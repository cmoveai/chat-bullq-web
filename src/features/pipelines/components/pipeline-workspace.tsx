'use client';

/**
 * Pipelines — CRM Workspace premium (board kanban + drawer + DnD + ações de coluna).
 * Usado por /pipelines e /pipelines/[id] (rota operacional real).
 * Lógica real: pipelinesService.list/getBoard/moveCard/createCard/removeCard/upsertStages.
 * Sem API: "Criar impulso" (demo/futuro). Filtros avançados: parte client-side, parte visual.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus, Search, Settings2, MoreHorizontal, ChevronDown, X, SlidersHorizontal, ArrowDownUp,
  Calendar, Tag as TagIcon, Paperclip, MessageSquare, User,
  MoveRight, Zap, Trash2, AlertTriangle, MessageCircle, Activity,
  Layers, Wallet, Percent, GitBranch, CreditCard, Check, ArrowRight, Clock, Package,
} from 'lucide-react';
import {
  pipelinesService, type Pipeline, type BoardResponse, type CardSummary, type PipelineStage, type StageType,
} from '@/features/pipelines/services/pipelines.service';

const num = (v: string | number | null | undefined) => (v == null ? 0 : Number(v) || 0);
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const initial = (s?: string | null) => (s?.trim()?.[0] || '?').toUpperCase();
const fmtFull = (s?: string | null) => (s ? new Date(s).toLocaleDateString('pt-BR') : '—');
const stageTint = (t: string) => (t === 'WON' ? '#25c77a' : t === 'LOST' ? '#f46f63' : '#7c8aa0');
const AV_TINTS: Array<[string, string]> = [['#e8f0ff', '#3568d4'], ['#e7f8ef', '#1f9d63'], ['#f1ebff', '#7c3cff'], ['#fff2de', '#cf8520'], ['#e3f6f9', '#1390a0'], ['#fdebf3', '#c52a9e'], ['#feeee4', '#d9663a']];
const avTint = (s?: string | null) => AV_TINTS[((s || '?').toUpperCase().charCodeAt(0)) % AV_TINTS.length];

const COLORS = ['#7c3cff', '#3778ff', '#43c9d8', '#42c7a8', '#25c77a', '#ff9a5c', '#f46f63', '#df34b8', '#7c8aa0'];

const SORTS: Array<{ k: SortKey; label: string }> = [
  { k: 'recent', label: 'Mais recentes' },
  { k: 'old', label: 'Mais antigos' },
  { k: 'moved-recent', label: 'Movidos recentemente' },
  { k: 'moved-old', label: 'Movidos há mais tempo' },
];
type SortKey = 'recent' | 'old' | 'moved-recent' | 'moved-old';

// Filtros: funcionais (client-side) + visuais (pendentes de API de filtro no backend)
const FILTER_FUNCTIONAL = ['Status', 'Responsável', 'Valor mínimo', 'Valor máximo'];
const FILTER_VISUAL = ['Tags', 'Produtos', 'Atendente', 'Intervalo', 'Data de movimentação', 'Data de criação', 'Data de ganho/perdido', 'Origem', 'Campos adicionais do negócio', 'Campos adicionais do lead', 'Motivo de perda'];

const CSS = `
.pwrap{display:grid;grid-template-columns:256px 1fr;gap:18px;height:100%;min-height:100%;padding:18px 22px;background:#f4f6f9;color:#111827;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
/* sidebar */
.ppanel{background:#fff;border:1px solid #e9edf3;border-radius:18px;box-shadow:0 10px 30px rgba(15,23,42,.05),0 1px 3px rgba(15,23,42,.04);display:flex;flex-direction:column;overflow:hidden}
.ppanel-h{padding:15px 15px 13px;border-bottom:1px solid #eef1f6}
.pnew{width:100%;height:42px;border:0;border-radius:12px;color:#fff;font-weight:800;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(120deg,#3d54e8,#7c3cff 58%,#43c9d8);box-shadow:0 8px 18px rgba(61,84,232,.26);transition:.15s}
.pnew:hover{filter:brightness(1.05);box-shadow:0 11px 22px rgba(61,84,232,.32)}
.ptree{padding:8px 8px 14px;overflow-y:auto}
.pgrp{display:flex;align-items:center;gap:6px;margin:12px 8px 5px;font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:#9aa3b2;font-weight:800;cursor:pointer;user-select:none}
.pgrp svg{transition:transform .15s}.pgrp.col svg{transform:rotate(-90deg)}
.pitem{display:flex;align-items:center;gap:10px;padding:10px 11px;border-radius:11px;cursor:pointer;color:#2b3340;transition:.12s}
.pitem:hover{background:#f4f6fb}.pitem.on{background:linear-gradient(90deg,#eef2ff,#f5f1ff);color:#21306b;box-shadow:inset 0 0 0 1px #e2e7fb}
.pitem .dotc{width:9px;height:9px;border-radius:50%;flex:0 0 9px;background:#7c3cff;box-shadow:0 0 0 3px rgba(124,60,255,.12)}
.pitem .nm{font-size:13px;font-weight:700;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center}
.pitem .ct{font-size:10.5px;color:#8a93a3;font-weight:800;background:#f1f4f9;border-radius:6px;padding:1px 7px}.pitem.on .ct{background:#fff;color:#5b6678}
.pitem .qa{border:0;background:none;color:#aeb6c2;cursor:pointer;opacity:0;display:grid;place-items:center}
.pitem:hover .qa{opacity:1}.pitem .qa:hover{color:#5b6473}
.demo{font-size:8.5px;font-weight:800;color:#9aa3b2;background:#eef1f6;border-radius:5px;padding:1px 5px;margin-left:6px;text-transform:uppercase;letter-spacing:.04em}
/* main */
.pmain{display:flex;flex-direction:column;min-width:0;background:#fff;border:1px solid #e9edf3;border-radius:18px;box-shadow:0 10px 30px rgba(15,23,42,.05),0 1px 3px rgba(15,23,42,.04);overflow:hidden}
.pmain-h{padding:18px 22px 0;border-bottom:1px solid #eef1f6;background:linear-gradient(180deg,#fcfdff,#fff)}
.ttl{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.ttl-l{display:flex;align-items:center;gap:13px;min-width:0}
.picon{width:46px;height:46px;border-radius:13px;flex:0 0 46px;display:grid;place-items:center;color:#fff;box-shadow:0 10px 20px rgba(61,84,232,.24)}
.pmain-h h1{margin:0;font-size:18px;font-weight:850;letter-spacing:.01em;color:#1a2230;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pmain-h .sub{margin:3px 0 0;font-size:12.5px;color:#7b8496;font-weight:500}
.htools{display:flex;align-items:center;gap:9px;flex:0 0 auto}
.pcfg{height:38px;border:1px solid #e3e8f1;border-radius:11px;background:#fff;color:#3a4150;font-weight:750;font-size:12.5px;padding:0 14px;cursor:pointer;display:flex;align-items:center;gap:7px;white-space:nowrap;transition:.12s}
.pcfg:hover{background:#f5f7fb;border-color:#d4dbe8}
.hnewcol{height:38px;border:0;border-radius:11px;background:linear-gradient(120deg,#3d54e8,#7c3cff);color:#fff;font-size:12.5px;font-weight:800;padding:0 16px;display:flex;align-items:center;gap:7px;cursor:pointer;white-space:nowrap;box-shadow:0 8px 16px rgba(61,84,232,.22);transition:.15s}
.hnewcol:hover{filter:brightness(1.07)}.hnewcol:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
/* toolbar */
.pfilters{display:flex;align-items:center;gap:9px;margin-top:16px;padding-bottom:16px;flex-wrap:wrap;position:relative}
.psearch{display:flex;align-items:center;gap:8px;height:36px;border:1px solid #e6eaf1;border-radius:10px;padding:0 12px;color:#9aa3b2;font-size:12px;min-width:248px;background:#f8fafc;transition:.12s}
.psearch:focus-within{border-color:#aab8e8;background:#fff;box-shadow:0 0 0 3px rgba(61,84,232,.1)}
.psearch input{border:0;outline:0;background:transparent;font-size:12.5px;color:#303746;width:100%}
.chipbtn{height:36px;border:1px solid #e6eaf1;border-radius:10px;background:#fff;color:#5b6678;font-size:12px;font-weight:700;padding:0 13px;display:flex;align-items:center;gap:7px;cursor:pointer;white-space:nowrap;transition:.12s}
.chipbtn:hover{background:#f5f7fb}.chipbtn.act{background:#eef2ff;border-color:#cfd9f7;color:#2746cc}
.chipbtn .fcount{background:#3d54e8;color:#fff;border-radius:6px;font-size:10px;padding:0 5px;min-width:16px;height:16px;display:grid;place-items:center;font-weight:800}
.tbsp{flex:1}
/* dropdown */
.mscrim2{position:fixed;inset:0;z-index:40}
.dropdown{position:absolute;z-index:50;background:#fff;border:1px solid #e6ebf2;border-radius:13px;box-shadow:0 18px 50px rgba(15,23,42,.18);padding:7px;min-width:230px}
.dd-item{display:flex;align-items:flex-start;gap:11px;padding:9px 11px;border-radius:9px;cursor:pointer;color:#2b3340}
.dd-item:hover{background:#f5f7fb}.dd-item.danger{color:#d9534f}.dd-item.danger:hover{background:#fdeeec}
.dd-item .di{margin-top:1px;color:#7c8aa0;flex:0 0 16px}.dd-item.danger .di{color:#d9534f}
.dd-item b{font-size:13px;font-weight:800;display:block}.dd-item small{font-size:11.5px;color:#8a93a3}
.dd-sep{height:1px;background:#eef1f6;margin:5px 4px}
.dd-h{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#9aa3b2;font-weight:800;padding:7px 10px 4px}
.dd-radio{display:flex;align-items:center;gap:10px;padding:8px 11px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:700;color:#3a424f}
.dd-radio:hover{background:#f5f7fb}.dd-radio.on{color:#2746cc}.dd-radio .rk{margin-left:auto;color:#3d54e8}
.fblock{padding:6px 6px 4px}.fblock label{font-size:11px;font-weight:800;color:#5b6678;display:block;margin:8px 6px 5px}
.fchips{display:flex;flex-wrap:wrap;gap:6px;padding:0 6px}
.fchip{font-size:11.5px;font-weight:700;border:1px solid #e3e8f0;border-radius:8px;padding:5px 10px;cursor:pointer;color:#5b6678}
.fchip.on{background:#eef2ff;border-color:#cfd9f7;color:#2746cc}
.finput{width:100%;height:36px;border:1px solid #e1e6ef;border-radius:9px;padding:0 11px;font-size:13px;outline:0;margin:0 0 2px}
.fvisual{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:8px;font-size:12.5px;color:#7b8496}
.fvisual .demo{margin:0}
/* board */
.board{flex:1;display:flex;gap:16px;overflow-x:auto;overflow-y:hidden;padding:20px 22px 24px;background:#f3f5f9}
.board::-webkit-scrollbar{height:10px}.board::-webkit-scrollbar-thumb{background:#d6dde9;border-radius:9px;border:2px solid #f3f5f9}
.col{flex:0 0 278px;display:flex;flex-direction:column;background:#fff;border:1px solid #e8ecf3;border-radius:16px;max-height:100%;position:relative;box-shadow:0 4px 16px rgba(15,23,42,.05);transition:box-shadow .16s,border-color .16s}
.col-accent{height:4px;border-radius:16px 16px 0 0;opacity:.92}
.col.over{border-color:#b9c8f5;box-shadow:0 0 0 2px rgba(61,84,232,.22),0 14px 30px rgba(61,84,232,.15)}
.col.over .col-body{background:#f3f6ff}
.col-h{display:flex;align-items:center;gap:9px;padding:13px 13px 7px}
.cdot{width:10px;height:10px;border-radius:50%;flex:0 0 10px;box-shadow:0 0 0 3px rgba(124,138,160,.13)}
.cnm{font-size:13px;font-weight:800;color:#283143;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.01em}
.cbadge{min-width:23px;height:21px;border-radius:7px;background:#f1f4f9;border:1px solid #e7ebf2;display:grid;place-items:center;font-size:11px;font-weight:800;color:#5b6678;padding:0 7px}
.cmenu{border:0;background:none;color:#aab2bf;cursor:pointer;display:grid;place-items:center;width:25px;height:25px;border-radius:7px;transition:.12s}.cmenu:hover{color:#5b6473;background:#f1f4f9}
.col-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 14px 11px}
.cm-val{font-size:12px;font-weight:750;color:#6b7686;font-variant-numeric:tabular-nums}
.cm-lbl{font-size:11px;color:#9aa3b2;font-weight:650}
.col-body{flex:1;overflow-y:auto;padding:3px 11px 11px;display:flex;flex-direction:column;gap:11px;transition:background .15s}
.col-body::-webkit-scrollbar{width:8px}.col-body::-webkit-scrollbar-thumb{background:#dde4ee;border-radius:7px;border:2px solid #fff}
.col-foot{padding:9px 11px 12px}
.col-add{width:100%;height:38px;border:1px dashed #d3dae5;border-radius:11px;background:#fafbfd;color:#5b6678;font-weight:700;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:.12s}
.col-add:hover{border-color:#9fb0e8;color:#3d54e8;background:#f3f6ff}
.empty{color:#aab2bf;font-size:11.5px;text-align:center;padding:18px 6px;border:1.5px dashed #e3e8f0;border-radius:11px;font-weight:600}
/* PipelineDealCard — estruturado premium (base 4ª imagem) */
.pdcard{position:relative;background:#fff;border:1px solid #e8ecf3;border-radius:14px;padding:13px 14px;box-shadow:0 1px 2px rgba(15,23,42,.05);cursor:grab;transition:box-shadow .16s,transform .08s,border-color .16s}
.pdcard:hover{box-shadow:0 10px 24px rgba(15,23,42,.1);border-color:#dde4ef;transform:translateY(-2px)}
.pdcard:active{cursor:grabbing}
.pdcard.drag{opacity:.5;transform:rotate(1.3deg) scale(.97);box-shadow:0 18px 34px rgba(15,23,42,.18)}
.pdcard.sel{border-color:#aab8e8;box-shadow:0 0 0 1.5px rgba(61,84,232,.28),0 10px 24px rgba(15,23,42,.1)}
.pdcard:before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:0 3px 3px 0;background:transparent}
.pdcard.won:before{background:linear-gradient(#34c77b,#1f9d63)}.pdcard.lost:before{background:linear-gradient(#f08378,#e0584e)}
.pd-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}
.pd-av{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;font-size:13px;font-weight:800;flex:0 0 36px;margin-top:1px}
.pd-tt{flex:1;min-width:0;padding-top:1px}
.pd-name{font-size:13.5px;font-weight:800;color:#1f2733;line-height:1.2;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pd-prod{font-size:11.5px;color:#3d6fe0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.pd-prod.none{color:#9aa3b2;font-weight:500}
.pd-id{font-size:11px;font-weight:650;color:#aab2bf;font-variant-numeric:tabular-nums;flex:0 0 auto;margin-top:1px}
.pd-mid{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
.pd-owner{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:650;color:#56606e;min-width:0}
.pd-owner svg{color:#aeb6c2;flex:0 0 14px}.pd-owner span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pd-val{font-size:14px;font-weight:850;color:#1f9d63;flex:0 0 auto;font-variant-numeric:tabular-nums}
.pd-sub{display:flex;align-items:center;gap:8px;font-size:11px;color:#9aa3b2;font-weight:550;margin-bottom:12px}
.pd-sub .si{display:flex;align-items:center;gap:5px;min-width:0}.pd-sub .si span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pd-sub svg{flex:0 0 13px;color:#bcc4ce}.pd-sub .dotsep{opacity:.5}
.pd-status{display:inline-flex;align-items:center;gap:6px;margin-bottom:11px;height:22px;font-size:10.5px;font-weight:750;border-radius:7px;padding:0 9px}
.pd-status .bd{width:5px;height:5px;border-radius:50%}
.pd-foot{display:flex;align-items:center;gap:6px;padding-top:11px;border-top:1px solid #f1f3f7}
.pd-act{width:29px;height:29px;border-radius:8px;border:1px solid #edf0f5;background:#fff;color:#8a93a3;display:grid;place-items:center;cursor:pointer;transition:.12s}
.pd-act:hover{background:#f5f7fb;color:#3d54e8;border-color:#dbe2f0}
.pd-act.wa:hover{background:#eefaf2;border-color:#cdeeda;color:#1aa05f}
.pd-act.dis{opacity:.45;cursor:not-allowed}
.pd-open{margin-left:auto;display:inline-flex;align-items:center;gap:6px;height:29px;padding:0 13px;border-radius:8px;border:1px solid #dfe5f1;background:linear-gradient(90deg,#f3f6ff,#fff);color:#2746cc;font-weight:750;font-size:11.5px;cursor:pointer;white-space:nowrap;transition:.12s}
.pd-open:hover{background:#eef2ff;border-color:#cfd9f7}
/* drawer */
.scrim{position:fixed;inset:0;background:rgba(15,23,42,.3);backdrop-filter:blur(2px);z-index:60;animation:fade .2s ease}
@keyframes fade{from{opacity:0}to{opacity:1}}
.drawer{position:fixed;top:0;right:0;height:100vh;width:436px;max-width:94vw;background:#fff;z-index:61;box-shadow:-24px 0 64px rgba(15,23,42,.2);display:flex;flex-direction:column;animation:slide .24s cubic-bezier(.22,.61,.36,1)}
@keyframes slide{from{transform:translateX(100%)}to{transform:none}}
.dr-h{padding:20px 22px 18px;border-bottom:1px solid #eef1f6;position:relative;background:linear-gradient(155deg,#fbfbff,#f3f0ff)}
.dr-close{position:absolute;top:16px;right:16px;background:#fff;border:1px solid #e8ecf2;border-radius:9px;width:32px;height:32px;cursor:pointer;color:#5b6473;display:grid;place-items:center;transition:.12s}.dr-close:hover{background:#f5f7fb;color:#222a36}
.dr-top{display:flex;align-items:center;gap:12px;margin-bottom:13px;padding-right:38px}
.dr-av{width:42px;height:42px;border-radius:12px;flex:0 0 42px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3cff,#3d54e8);color:#fff;font-size:16px;font-weight:800;box-shadow:0 8px 16px rgba(124,60,255,.24)}
.dr-h h2{margin:0;font-size:17px;font-weight:850;letter-spacing:-.01em;line-height:1.2}
.dr-h .dsub{font-size:11.5px;color:#8a93a3;font-weight:600;margin-top:2px}
.dr-stats{display:flex;gap:10px}
.dr-stat{flex:1;background:rgba(255,255,255,.7);border:1px solid #eae6f7;border-radius:11px;padding:9px 12px}
.dr-stat .v{font-size:15px;font-weight:850;line-height:1.1;font-variant-numeric:tabular-nums}
.dr-stat .l{font-size:10px;color:#8a93a3;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-top:3px}
.dr-stat .badge{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:800;border-radius:8px;padding:3px 9px}
.dr-body{flex:1;overflow-y:auto;padding:18px 22px 28px}
.dstepper{display:flex;align-items:flex-start;gap:0;overflow-x:auto;padding:2px 0 4px}
.dstep{flex:1;min-width:58px;display:flex;flex-direction:column;align-items:center;position:relative;text-align:center}
.dstep:before{content:"";position:absolute;top:11px;left:-50%;width:100%;height:2px;background:#e9edf3}
.dstep:first-child:before{display:none}
.dstep.done:before,.dstep.cur:before{background:#cbb8f5}
.dstep .sdot{width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid #e3e8f0;display:grid;place-items:center;color:#aab2bf;z-index:1;font-size:10px;font-weight:800}
.dstep.cur .sdot{box-shadow:0 0 0 4px rgba(124,60,255,.13)}
.dstep .slbl{font-size:9.5px;font-weight:700;color:#9aa3b2;margin-top:6px;max-width:70px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dstep.cur .slbl,.dstep.done .slbl{color:#5b4b86}
.dsec{margin-bottom:22px}.dsec h4{margin:0 0 11px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#9aa3b2;font-weight:800}
.drow{display:flex;align-items:center;gap:10px;font-size:13px;color:#3a424f;margin-bottom:9px}.drow svg{color:#8a93a3;flex:0 0 16px}
.dtags{display:flex;flex-wrap:wrap;gap:7px}.dtag{font-size:11px;font-weight:800;color:#5b4b86;background:#f3eeff;border:1px solid #e6e0f6;border-radius:20px;padding:3px 11px}
.tl{display:grid;gap:0}.tlitem{display:grid;grid-template-columns:14px 1fr;gap:12px;position:relative}
.tlitem .tldot{width:10px;height:10px;border-radius:50%;background:#7c3cff;margin-top:3px;box-shadow:0 0 0 3px rgba(124,60,255,.14)}
.tlitem .tlline{position:absolute;left:6px;top:13px;bottom:-6px;width:2px;background:#eef1f6}.tlitem:last-child .tlline{display:none}
.tlitem .tlc{padding-bottom:16px}.tlitem b{font-size:12.5px;font-weight:800;color:#2b3340;display:block}.tlitem small{font-size:11.5px;color:#8a93a3}
.dnote{background:#f7f8fb;border:1px solid #eef1f6;border-radius:11px;padding:11px 13px;font-size:12.5px;color:#4a5260;line-height:1.5}
.datt{display:flex;align-items:center;gap:9px;padding:9px 12px;border:1px solid #eef1f6;border-radius:10px;font-size:12.5px;color:#3a424f;font-weight:700;margin-bottom:8px}
/* modal */
.mscrim{position:fixed;inset:0;background:rgba(15,23,42,.34);backdrop-filter:blur(2px);z-index:62;display:grid;place-items:center;animation:fade .2s ease}
.modal{width:464px;max-width:94vw;background:#fff;border-radius:18px;box-shadow:0 34px 84px rgba(15,23,42,.32);overflow:hidden;animation:pop .2s cubic-bezier(.22,.61,.36,1)}
@keyframes pop{from{transform:scale(.95) translateY(8px);opacity:0}to{transform:none;opacity:1}}
.m-h{padding:21px 23px 5px}.m-h h2{margin:0;font-size:17px;font-weight:850;display:flex;align-items:center;gap:10px;color:#1a2230}
.m-h h2 .mhic{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,#3d54e8,#7c3cff);color:#fff;flex:0 0 32px;box-shadow:0 6px 14px rgba(61,84,232,.24)}
.m-h h2.danger .mhic{background:linear-gradient(135deg,#e0584e,#d9534f);box-shadow:0 6px 14px rgba(217,83,79,.24)}
.m-h p{margin:8px 0 0;font-size:12.5px;color:#7b8496;line-height:1.45}
.m-body{padding:17px 23px 8px;display:grid;gap:14px}
.m-group{display:grid;gap:14px;padding:14px;border:1px solid #eef1f6;border-radius:13px;background:#fbfcfe}
.field label{display:block;font-size:11px;font-weight:800;color:#5b6678;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
.field input,.field select,.field textarea{width:100%;min-height:42px;border:1px solid #e1e6ef;border-radius:11px;padding:10px 13px;font-size:13.5px;color:#222a36;outline:0;background:#fff;font-family:inherit;transition:.12s}
.field input:focus,.field select:focus,.field textarea:focus{border-color:#9fb0e8;box-shadow:0 0 0 3px rgba(61,84,232,.12)}
.field .hint{font-size:11px;color:#9aa3b2;font-weight:500;margin-top:5px}
.colorrow{display:flex;gap:8px;flex-wrap:wrap}
.swatch{width:28px;height:28px;border-radius:9px;cursor:pointer;border:2px solid transparent;transition:.1s}.swatch:hover{transform:scale(1.08)}.swatch.on{border-color:#111827;box-shadow:0 0 0 2px #fff inset}
.m-foot{display:flex;gap:10px;padding:15px 23px 21px}
.m-cancel{flex:1;height:44px;border:1px solid #e1e6ef;border-radius:12px;background:#fff;color:#3a4150;font-weight:800;cursor:pointer;transition:.12s}.m-cancel:hover{background:#f5f7fb}
.m-save{flex:1;height:44px;border:0;border-radius:12px;color:#fff;font-weight:850;cursor:pointer;background:linear-gradient(120deg,#3d54e8,#7c3cff);box-shadow:0 8px 18px rgba(61,84,232,.24);transition:.14s}.m-save:hover:not(:disabled){filter:brightness(1.06)}
.m-save.danger{background:linear-gradient(120deg,#e0584e,#d9534f);box-shadow:0 8px 18px rgba(217,83,79,.24)}
.m-save:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}
.warnbox{display:flex;gap:10px;align-items:flex-start;background:#fff7f6;border:1px solid #f6dcd8;border-radius:11px;padding:12px 13px;font-size:12.5px;color:#9a4a43;margin-bottom:4px;line-height:1.45}
.warnbox svg{color:#e0584e;flex:0 0 18px;margin-top:1px}
/* ===== Detalhe do negócio — painel amplo (ref 2ª imagem) ===== */
.ldscrim{position:fixed;inset:0;background:rgba(10,15,25,.55);backdrop-filter:blur(3px);z-index:63;display:grid;place-items:center;padding:24px;animation:fade .2s ease}
.ldmodal{position:relative;width:1160px;max-width:96vw;height:684px;max-height:92vh;background:#fff;border-radius:20px;box-shadow:0 44px 110px rgba(10,15,25,.42);display:flex;overflow:hidden;animation:pop .24s cubic-bezier(.22,.61,.36,1)}
.ldclose{position:absolute;top:16px;right:18px;z-index:6;background:#fff;border:1px solid #e8ecf2;border-radius:10px;width:34px;height:34px;cursor:pointer;color:#5b6473;display:grid;place-items:center;transition:.12s}.ldclose:hover{background:#f5f7fb;color:#222a36}
.ldleft{flex:0 0 322px;background:#fafbfd;border-right:1px solid #eef1f6;display:flex;flex-direction:column;overflow-y:auto}
.ldl-hd{padding:28px 22px 20px;text-align:center;background:linear-gradient(180deg,#0b1118,#181f2a);color:#fff}
.ldl-av{width:86px;height:86px;border-radius:24px;margin:0 auto 14px;display:grid;place-items:center;font-size:32px;font-weight:850;box-shadow:0 14px 30px rgba(0,0,0,.32)}
.ldl-nm{font-size:17px;font-weight:850;letter-spacing:-.01em;line-height:1.25}
.ldl-prod{font-size:12px;color:#9fb0c8;margin-top:4px;font-weight:600}
.ldl-chips{display:flex;flex-direction:column;gap:7px;margin-top:16px}
.ldl-chip{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:33px;border:1px solid rgba(255,255,255,.16);border-radius:9px;color:#cdd7e6;font-size:11.5px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.05);transition:.12s}.ldl-chip:hover{background:rgba(255,255,255,.11);color:#fff}
.ldl-body{padding:18px 20px 26px}
.ldl-h4{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#9aa3b2;font-weight:800;margin:0 0 11px}
.ldl-metrics{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:22px}
.ldl-metric{border:1px solid #eef1f6;border-radius:11px;padding:11px 12px;background:#fff}
.ldl-metric .mi{display:flex;align-items:center;gap:6px;font-size:9.5px;color:#9aa3b2;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.ldl-metric .mi svg{color:#b1b9c5}
.ldl-metric .mv{font-size:15px;font-weight:850;color:#1a2230;margin-top:5px;font-variant-numeric:tabular-nums}
.ldl-notes{background:#fff;border:1px solid #eef1f6;border-radius:11px;padding:12px 13px;font-size:12.5px;color:#4a5260;line-height:1.5;margin-bottom:22px}
.ldl-prow{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #f2f4f8;font-size:12.5px}
.ldl-prow:last-child{border-bottom:0}.ldl-prow .k{color:#9aa3b2;font-weight:600;flex:0 0 auto}.ldl-prow .vv{color:#2b3340;font-weight:700;text-align:right;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ldright{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.ldr-tabs{display:flex;gap:3px;padding:15px 22px 0;border-bottom:1px solid #eef1f6;overflow-x:auto;flex:0 0 auto}
.ldr-tabs::-webkit-scrollbar{height:0}
.ldr-tab{padding:9px 13px;font-size:12.5px;font-weight:700;color:#7b8496;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:.12s}
.ldr-tab:hover{color:#3a424f}.ldr-tab.on{color:#3d54e8;border-color:#3d54e8}
.ldr-body{flex:1;overflow-y:auto;padding:20px 22px 26px}
.ldr-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px}
.ldr-stat{border:1px solid #eef1f6;border-radius:13px;padding:13px 15px}
.ldr-stat.green{background:linear-gradient(160deg,#f0fbf5,#fff);border-color:#d8f0e2}
.ldr-stat.blue{background:linear-gradient(160deg,#eef3ff,#fff);border-color:#dde6fb}
.ldr-stat.violet{background:linear-gradient(160deg,#f6f1ff,#fff);border-color:#e9e1fb}
.ldr-stat .l{font-size:10px;color:#8a93a3;font-weight:750;text-transform:uppercase;letter-spacing:.05em}
.ldr-stat .v{font-size:18px;font-weight:850;color:#1a2230;margin-top:5px;font-variant-numeric:tabular-nums}
.ldr-stat.green .v{color:#1f9d63}
.ldr-jt-wrap{display:flex;gap:20px;margin-bottom:16px;border-bottom:1px solid #eef1f6}
.ldr-jt{padding:0 0 10px;font-size:12.5px;font-weight:750;color:#9aa3b2;cursor:pointer;border-bottom:2px solid transparent}.ldr-jt.on{color:#2b3340;border-color:#7c3cff}
.ldr-sectabs{display:flex;gap:18px;margin:24px 0 16px;border-bottom:1px solid #eef1f6;overflow-x:auto}
.ldr-sectabs::-webkit-scrollbar{height:0}
.ldr-st{padding:0 0 9px;font-size:12px;font-weight:700;color:#9aa3b2;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}.ldr-st.on{color:#3d54e8;border-color:#3d54e8}
.ldr-ptbl{border:1px solid #eef1f6;border-radius:13px;overflow:hidden}
.ldr-pr{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid #f2f4f8;font-size:13px;color:#3a424f;font-weight:600}
.ldr-pr:last-child{border-bottom:0}
.ldr-pr .pl{display:flex;align-items:center;gap:9px}.ldr-pr .pl svg{color:#aab2bf}
.ldr-pr.total{background:#fafbfd;font-weight:850;color:#1a2230;font-size:14px}
.ldr-empty{text-align:center;color:#9aa3b2;font-size:13px;padding:54px 20px;font-weight:600}
.ldr-empty .ei{width:46px;height:46px;border-radius:14px;background:#f1f4f9;display:grid;place-items:center;margin:0 auto 12px;color:#aab2bf}
`;

type DemoPipe = { id: string; name: string; group: string; demo: true };
const DEMO_PIPES: DemoPipe[] = [
  { id: 'dp_sup', name: 'Suporte ao Cliente', group: 'Suporte', demo: true },
  { id: 'dp_par', name: 'Parcerias & Indicações', group: 'Parcerias', demo: true },
];

export function PipelineWorkspace({ initialPipelineId }: { initialPipelineId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(initialPipelineId ?? null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [drawerCard, setDrawerCard] = useState<CardSummary | null>(null);
  const [modalStage, setModalStage] = useState<string | null>(null);
  const [dragCard, setDragCard] = useState<{ id: string; from: string } | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  // novas features
  const [menuStage, setMenuStage] = useState<string | null>(null);
  const [headerMenu, setHeaderMenu] = useState<'filters' | 'sort' | null>(null);
  const [sort, setSort] = useState<SortKey>('recent');
  const [fStatus, setFStatus] = useState<'all' | 'OPEN' | 'WON' | 'LOST'>('all');
  const [fResp, setFResp] = useState<string>('all');
  const [fMin, setFMin] = useState('');
  const [fMax, setFMax] = useState('');
  const [newColOpen, setNewColOpen] = useState(false);
  const [moveDeals, setMoveDeals] = useState<string | null>(null);
  const [delStage, setDelStage] = useState<string | null>(null);
  const [delDeals, setDelDeals] = useState<string | null>(null);
  const [impulse, setImpulse] = useState<string | null>(null);

  const pipesQuery = useQuery({ queryKey: ['pipelines', 'list'], queryFn: () => pipelinesService.list() });
  const pipes: Pipeline[] = useMemo(() => pipesQuery.data ?? [], [pipesQuery.data]);

  useEffect(() => { if (!activeId && pipes.length) setActiveId(pipes.find((p) => p.isDefault)?.id ?? pipes[0].id); }, [pipes, activeId]);

  const boardKey = ['pipeline-board', activeId];
  const { data: board } = useQuery({ queryKey: boardKey, queryFn: () => pipelinesService.getBoard(activeId!), enabled: !!activeId });

  const moveMutation = useMutation({
    mutationFn: ({ cardId, toStageId, toIndex }: { cardId: string; toStageId: string; toIndex: number }) => pipelinesService.moveCard(cardId, toStageId, toIndex),
    onError: () => { toast.error('Não foi possível mover o negócio'); qc.invalidateQueries({ queryKey: boardKey }); },
  });
  const createMutation = useMutation({
    mutationFn: (input: { title: string; value?: number; stageId: string }) => pipelinesService.createCard(activeId!, input),
    onSuccess: () => { toast.success('Negócio criado'); qc.invalidateQueries({ queryKey: boardKey }); setModalStage(null); },
    onError: (e: any) => toast.error(e?.message || 'Erro ao criar negócio'),
  });
  const stagesMutation = useMutation({
    mutationFn: (stagesPayload: Array<{ id?: string; name: string; color?: string; type?: StageType; order?: number }>) => pipelinesService.upsertStages(activeId!, stagesPayload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: boardKey }); qc.invalidateQueries({ queryKey: ['pipelines', 'list'] }); },
    onError: (e: any) => { toast.error(e?.message || 'Erro ao atualizar etapas'); qc.invalidateQueries({ queryKey: boardKey }); },
  });

  const activePipe = pipes.find((p) => p.id === activeId);
  const stages: PipelineStage[] = board?.stages ?? [];
  const cardsByStage: Record<string, CardSummary[]> = board?.cards ?? {};

  const respOptions = useMemo(() => {
    const s = new Set<string>();
    Object.values(cardsByStage).flat().forEach((c) => { if (c.assignedTo?.name) s.add(c.assignedTo.name); });
    return Array.from(s);
  }, [cardsByStage]);

  const activeFilters = (fStatus !== 'all' ? 1 : 0) + (fResp !== 'all' ? 1 : 0) + (fMin ? 1 : 0) + (fMax ? 1 : 0);

  function processCards(list: CardSummary[]) {
    let out = list;
    if (search) { const q = search.toLowerCase(); out = out.filter((c) => c.title.toLowerCase().includes(q) || c.contact?.name?.toLowerCase().includes(q) || c.assignedTo?.name?.toLowerCase().includes(q)); }
    if (fStatus !== 'all') out = out.filter((c) => c.status === fStatus);
    if (fResp !== 'all') out = out.filter((c) => c.assignedTo?.name === fResp);
    if (fMin) out = out.filter((c) => num(c.value) >= Number(fMin));
    if (fMax) out = out.filter((c) => num(c.value) <= Number(fMax));
    const by = (s?: string | null) => (s ? new Date(s).getTime() : 0);
    out = [...out].sort((a, b) => {
      if (sort === 'recent') return by(b.createdAt) - by(a.createdAt);
      if (sort === 'old') return by(a.createdAt) - by(b.createdAt);
      if (sort === 'moved-recent') return by(b.updatedAt) - by(a.updatedAt);
      return by(a.updatedAt) - by(b.updatedAt);
    });
    return out;
  }

  function stagesPayload() {
    return stages.map((s, i) => ({ id: s.id, name: s.name, color: s.color ?? undefined, type: s.type, order: i }));
  }

  function onDrop(toStage: string) {
    setOverStage(null);
    if (!dragCard || !board) { setDragCard(null); return; }
    const { id, from } = dragCard; setDragCard(null);
    if (from === toStage) return;
    const toIndex = cardsByStage[toStage]?.length ?? 0;
    qc.setQueryData<BoardResponse>(boardKey, (prev) => {
      if (!prev) return prev;
      const next = { ...prev, cards: { ...prev.cards } };
      const moved = (prev.cards[from] || []).find((c) => c.id === id);
      next.cards[from] = (next.cards[from] || []).filter((c) => c.id !== id);
      next.cards[toStage] = [...(next.cards[toStage] || []), ...(moved ? [{ ...moved, stageId: toStage }] : [])];
      return next;
    });
    moveMutation.mutate({ cardId: id, toStageId: toStage, toIndex });
    toast.success(`Negócio movido para “${stages.find((s) => s.id === toStage)?.name ?? 'etapa'}”`, { duration: 2200 });
  }

  // ---- ações de coluna (APIs reais) ----
  function createColumn(name: string, color: string, type: StageType, afterId: string | null) {
    const base = stagesPayload();
    const newStage = { name, color, type, order: 0 };
    let arr;
    if (!afterId) arr = [...base, newStage];
    else { const idx = base.findIndex((s) => s.id === afterId); arr = [...base.slice(0, idx + 1), newStage, ...base.slice(idx + 1)]; }
    arr = arr.map((s, i) => ({ ...s, order: i }));
    stagesMutation.mutate(arr, { onSuccess: () => { toast.success('Coluna criada'); setNewColOpen(false); } });
  }
  function deleteStage(stageId: string) {
    const arr = stagesPayload().filter((s) => s.id !== stageId).map((s, i) => ({ ...s, order: i }));
    stagesMutation.mutate(arr, { onSuccess: () => { toast.success('Etapa excluída'); setDelStage(null); } });
  }
  async function moveAllDeals(fromId: string, toId: string) {
    const list = cardsByStage[fromId] || [];
    setMoveDeals(null);
    const base = cardsByStage[toId]?.length ?? 0;
    try {
      await Promise.all(list.map((c, i) => pipelinesService.moveCard(c.id, toId, base + i)));
      toast.success(`${list.length} negócio(s) movido(s)`);
    } catch { toast.error('Erro ao mover negócios'); }
    qc.invalidateQueries({ queryKey: boardKey });
  }
  async function deleteAllDeals(stageId: string) {
    const list = cardsByStage[stageId] || [];
    setDelDeals(null);
    try { await Promise.all(list.map((c) => pipelinesService.removeCard(c.id))); toast.success(`${list.length} negócio(s) excluído(s)`); }
    catch { toast.error('Erro ao excluir negócios'); }
    qc.invalidateQueries({ queryKey: boardKey });
  }

  const groups = [
    { name: 'Vendas', real: pipes, demo: [] as DemoPipe[] },
    { name: 'Suporte', real: [] as Pipeline[], demo: DEMO_PIPES.filter((d) => d.group === 'Suporte') },
    { name: 'Parcerias', real: [] as Pipeline[], demo: DEMO_PIPES.filter((d) => d.group === 'Parcerias') },
  ];
  const otherStages = (excl: string) => stages.filter((s) => s.id !== excl);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pwrap">
        {/* Sidebar contextual */}
        <aside className="ppanel">
          <div className="ppanel-h"><button className="pnew" onClick={() => toast('Criar nova pipeline — em breve')}><Plus size={16} /> Nova pipeline</button></div>
          <div className="ptree">
            {groups.map((g) => {
              const col = collapsed[g.name];
              return (
                <div key={g.name}>
                  <div className={`pgrp ${col ? 'col' : ''}`} onClick={() => setCollapsed((c) => ({ ...c, [g.name]: !c[g.name] }))}><ChevronDown size={13} /> {g.name}</div>
                  {!col && (<>
                    {g.real.map((p) => (
                      <div key={p.id} className={`pitem ${p.id === activeId ? 'on' : ''}`} onClick={() => { setActiveId(p.id); router.push(`/pipelines/${p.id}`); }}>
                        <span className="dotc" style={{ background: p.color || '#7c3cff' }} /><span className="nm">{p.name}</span>
                        <span className="ct">{p._count?.cards ?? ''}</span>
                        <button className="qa" onClick={(e) => { e.stopPropagation(); toast('Ações da pipeline — em breve'); }}><MoreHorizontal size={15} /></button>
                      </div>
                    ))}
                    {g.demo.map((d) => (<div key={d.id} className="pitem" onClick={() => toast('Pipeline demo (visual)')}><span className="dotc" style={{ background: '#cbd2dc' }} /><span className="nm">{d.name}<span className="demo">demo</span></span><button className="qa"><MoreHorizontal size={15} /></button></div>))}
                    {g.real.length === 0 && g.demo.length === 0 && <div style={{ padding: '4px 12px', fontSize: 12, color: '#aab2bf' }}>—</div>}
                  </>)}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Área principal */}
        <section className="pmain">
          <div className="pmain-h">
            <div className="ttl">
              <div className="ttl-l">
                <div className="picon" style={{ background: `linear-gradient(135deg, ${activePipe?.color || '#3d54e8'}, #7c3cff)` }}><GitBranch size={22} /></div>
                <div style={{ minWidth: 0 }}>
                  <h1>{activePipe?.name || 'Pipeline'}</h1>
                  <p className="sub">{activePipe?.description || 'Acompanhe e mova seus negócios pelas etapas do funil comercial.'}</p>
                </div>
              </div>
              <div className="htools">
                <button className="pcfg" onClick={() => toast('Configurar stages — use o menu de cada coluna ou “Nova coluna”')}><Settings2 size={15} /> Configurar stages</button>
                <button className="hnewcol" onClick={() => setNewColOpen(true)} disabled={stages.length === 0}><Plus size={15} /> Nova coluna</button>
              </div>
            </div>

            <div className="pfilters">
              <span className="psearch"><Search size={14} /><input placeholder="Pesquisar negócio, contato ou responsável..." value={search} onChange={(e) => setSearch(e.target.value)} /></span>
              <button className={`chipbtn ${headerMenu === 'filters' || activeFilters ? 'act' : ''}`} onClick={() => setHeaderMenu(headerMenu === 'filters' ? null : 'filters')}><SlidersHorizontal size={14} /> Filtros{activeFilters > 0 && <span className="fcount">{activeFilters}</span>}</button>
              <button className={`chipbtn ${headerMenu === 'sort' ? 'act' : ''}`} onClick={() => setHeaderMenu(headerMenu === 'sort' ? null : 'sort')}><ArrowDownUp size={14} /> Ordenação</button>

              {headerMenu === 'filters' && (
                <>
                  <div className="mscrim2" onClick={() => setHeaderMenu(null)} />
                  <div className="dropdown" style={{ top: 46, left: 257, minWidth: 300, maxHeight: 420, overflowY: 'auto' }}>
                    <div className="fblock">
                      <label>Status</label>
                      <div className="fchips">
                        {(['all', 'OPEN', 'WON', 'LOST'] as const).map((s) => (
                          <span key={s} className={`fchip ${fStatus === s ? 'on' : ''}`} onClick={() => setFStatus(s)}>{s === 'all' ? 'Todos' : s === 'OPEN' ? 'Em aberto' : s === 'WON' ? 'Ganho' : 'Perdido'}</span>
                        ))}
                      </div>
                      <label>Responsável</label>
                      <select className="finput" value={fResp} onChange={(e) => setFResp(e.target.value)}><option value="all">Todos</option>{respOptions.map((r) => <option key={r} value={r}>{r}</option>)}</select>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}><label>Valor mínimo</label><input className="finput" type="number" placeholder="0" value={fMin} onChange={(e) => setFMin(e.target.value)} /></div>
                        <div style={{ flex: 1 }}><label>Valor máximo</label><input className="finput" type="number" placeholder="∞" value={fMax} onChange={(e) => setFMax(e.target.value)} /></div>
                      </div>
                    </div>
                    <div className="dd-sep" />
                    <div className="dd-h">Mais filtros (em breve)</div>
                    {FILTER_VISUAL.map((f) => <div className="fvisual" key={f}>{f}<span className="demo">em breve</span></div>)}
                    <div className="dd-sep" />
                    <div className="dd-radio" onClick={() => { setFStatus('all'); setFResp('all'); setFMin(''); setFMax(''); }}>Limpar filtros</div>
                  </div>
                </>
              )}
              {headerMenu === 'sort' && (
                <>
                  <div className="mscrim2" onClick={() => setHeaderMenu(null)} />
                  <div className="dropdown" style={{ top: 46, left: 370, minWidth: 220 }}>
                    <div className="dd-h">Ordenar por</div>
                    {SORTS.map((s) => (<div key={s.k} className={`dd-radio ${sort === s.k ? 'on' : ''}`} onClick={() => { setSort(s.k); setHeaderMenu(null); }}>{s.label}{sort === s.k && <span className="rk">✓</span>}</div>))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Board */}
          <div className="board">
            {stages.length === 0 && <div style={{ margin: 'auto', color: '#9aa3b2', fontSize: 13 }}>Carregando board…</div>}
            {stages.map((st) => {
              const list = processCards(cardsByStage[st.id] || []);
              const total = list.reduce((s, c) => s + num(c.value), 0);
              const rawCount = cardsByStage[st.id]?.length ?? 0;
              const stColor = st.color || stageTint(st.type);
              return (
                <div key={st.id} className={`col ${overStage === st.id ? 'over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); if (overStage !== st.id) setOverStage(st.id); }}
                  onDragLeave={(e) => { if (e.currentTarget === e.target) setOverStage(null); }}
                  onDrop={() => onDrop(st.id)}>
                  <div className="col-accent" style={{ background: `linear-gradient(90deg, ${stColor}, ${stColor}99)` }} />
                  <div className="col-h">
                    <span className="cdot" style={{ background: stColor }} />
                    <span className="cnm">{st.name}</span>
                    <span className="cbadge">{list.length}</span>
                    <button className="cmenu" onClick={() => setMenuStage(menuStage === st.id ? null : st.id)}><MoreHorizontal size={15} /></button>
                  </div>
                  <div className="col-meta"><span className="cm-val">{brl(total)}</span><span className="cm-lbl">{list.length === 0 ? 'Nenhum negócio' : list.length === 1 ? '1 negócio' : `${list.length} negócios`}</span></div>
                  {menuStage === st.id && (
                    <>
                      <div className="mscrim2" onClick={() => setMenuStage(null)} />
                      <div className="dropdown" style={{ top: 48, right: 8 }}>
                        <div className="dd-item" onClick={() => { setMenuStage(null); setMoveDeals(st.id); }}><MoveRight size={16} className="di" /><div><b>Mover negócios</b><small>Mova todos os negócios desta etapa para outra coluna.</small></div></div>
                        <div className="dd-item" onClick={() => { setMenuStage(null); setImpulse(st.id); }}><Zap size={16} className="di" /><div><b>Criar impulso <span className="demo">demo</span></b><small>Crie e execute um impulso para os leads desta etapa.</small></div></div>
                        <div className="dd-sep" />
                        <div className="dd-item danger" onClick={() => { setMenuStage(null); setDelStage(st.id); }}><Trash2 size={16} className="di" /><div><b>Excluir etapa</b><small>Excluir esta etapa da pipeline.</small></div></div>
                        <div className="dd-item danger" onClick={() => { setMenuStage(null); setDelDeals(st.id); }}><AlertTriangle size={16} className="di" /><div><b>Excluir negócios</b><small>Excluir todos os {rawCount} negócio(s) desta etapa.</small></div></div>
                      </div>
                    </>
                  )}
                  <div className="col-body">
                    {list.map((c) => (
                      <PipelineDealCard
                        key={c.id}
                        card={c}
                        dragging={dragCard?.id === c.id}
                        selected={drawerCard?.id === c.id}
                        onOpen={() => setDrawerCard(c)}
                        onDragStart={() => setDragCard({ id: c.id, from: st.id })}
                        onDragEnd={() => { setDragCard(null); setOverStage(null); }}
                      />
                    ))}
                    {list.length === 0 && <div className="empty">Sem negócios</div>}
                  </div>
                  <div className="col-foot"><button className="col-add" onClick={() => setModalStage(st.id)}><Plus size={14} /> Novo negócio</button></div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {drawerCard && <LeadDetailModal card={drawerCard} stages={stages} stageName={stages.find((s) => s.id === drawerCard.stageId)?.name} onClose={() => setDrawerCard(null)} />}
      {modalStage && <NewDealModal stageName={stages.find((s) => s.id === modalStage)?.name || ''} saving={createMutation.isPending} onCancel={() => setModalStage(null)} onSave={(t, v) => createMutation.mutate({ title: t, value: v, stageId: modalStage })} />}
      {newColOpen && <NewColumnModal stages={stages} saving={stagesMutation.isPending} onCancel={() => setNewColOpen(false)} onSave={createColumn} />}
      {moveDeals && <MoveDealsModal from={stages.find((s) => s.id === moveDeals)!} count={cardsByStage[moveDeals]?.length ?? 0} options={otherStages(moveDeals)} onCancel={() => setMoveDeals(null)} onConfirm={(toId) => moveAllDeals(moveDeals, toId)} />}
      {delStage && <DeleteStageModal stage={stages.find((s) => s.id === delStage)!} count={cardsByStage[delStage]?.length ?? 0} saving={stagesMutation.isPending} onCancel={() => setDelStage(null)} onConfirm={() => deleteStage(delStage)} onMove={() => { const id = delStage; setDelStage(null); setMoveDeals(id); }} />}
      {delDeals && <DeleteDealsModal stage={stages.find((s) => s.id === delDeals)!} count={cardsByStage[delDeals]?.length ?? 0} onCancel={() => setDelDeals(null)} onConfirm={() => deleteAllDeals(delDeals)} />}
      {impulse && <ImpulseModal stageName={stages.find((s) => s.id === impulse)?.name || ''} onClose={() => setImpulse(null)} />}
    </>
  );
}

/* ====== PipelineDealCard ====== */

function PipelineDealCard({ card, dragging, selected, onOpen, onDragStart, onDragEnd }: {
  card: CardSummary; dragging: boolean; selected: boolean; onOpen: () => void; onDragStart: () => void; onDragEnd: () => void;
}) {
  const v = num(card.value);
  const owner = card.assignedTo?.name || null;
  const noOwner = !owner;
  const state = card.status === 'WON' ? 'won' : card.status === 'LOST' ? 'lost' : noOwner ? 'no_owner' : '';
  const tint = avTint(owner || card.contact?.name || card.title);
  const statusBadge = card.status === 'WON'
    ? { label: 'Negócio ganho', bg: '#e7f8ef', fg: '#1f9d63', dot: '#25c77a' }
    : { label: 'Negócio perdido', bg: '#fdeeec', fg: '#d9534f', dot: '#f46f63' };
  const phone = card.contact?.phone?.replace(/\D/g, '');
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className={`pdcard ${state} ${dragging ? 'drag' : ''} ${selected ? 'sel' : ''}`} draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onOpen}>
      <div className="pd-top">
        <div className="pd-av" style={{ background: tint[0], color: tint[1] }}>{initial(owner || card.contact?.name || card.title)}</div>
        <div className="pd-tt">
          <div className="pd-name">{card.title}</div>
          <div className={`pd-prod ${card.description ? '' : 'none'}`} onClick={(e) => { stop(e); onOpen(); }}>{card.description || 'Sem produto'}</div>
        </div>
        <span className="pd-id">#{card.id.slice(-5).toUpperCase()}</span>
      </div>

      <div className="pd-mid">
        <span className="pd-owner"><User size={14} /><span>{owner || 'Sem responsável'}</span></span>
        {v > 0 && <span className="pd-val">{brl(v)}</span>}
      </div>
      <div className="pd-sub">
        <span className="si"><Calendar size={13} /><span>{fmtFull(card.createdAt)}</span></span>
        <span className="dotsep">·</span>
        <span className="si"><Activity size={13} /><span>Sem atividades</span></span>
      </div>

      {(card.status === 'WON' || card.status === 'LOST') && (
        <span className="pd-status" style={{ background: statusBadge.bg, color: statusBadge.fg }}><span className="bd" style={{ background: statusBadge.dot }} />{statusBadge.label}</span>
      )}

      <div className="pd-foot">
        {phone ? (
          <a className="pd-act wa" href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" onClick={stop}><MessageCircle size={15} /></a>
        ) : (
          <button className="pd-act" title="Adicionar atividade" onClick={(e) => { stop(e); toast('Adicionar atividade — em breve'); }}><Plus size={15} /></button>
        )}
        <button className="pd-act" title="Mover de etapa" onClick={(e) => { stop(e); toast('Arraste o card ou use o menu da coluna para mover'); }}><MoveRight size={15} /></button>
        <button className="pd-act" title="Etiquetas" onClick={(e) => { stop(e); toast('Etiquetas — em breve'); }}><TagIcon size={14} /></button>
        <button className="pd-open" onClick={(e) => { stop(e); onOpen(); }}>Detalhes <ArrowRight size={13} /></button>
      </div>
    </div>
  );
}

/* ====== Modais / Drawer ====== */

function NewColumnModal({ stages, saving, onCancel, onSave }: { stages: PipelineStage[]; saving: boolean; onCancel: () => void; onSave: (name: string, color: string, type: StageType, afterId: string | null) => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [pos, setPos] = useState<string>('end');
  return (
    <div className="mscrim" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-h"><h2><span className="mhic"><Layers size={17} /></span> Nova coluna</h2><p>Adicione uma etapa ao funil e defina sua cor e posição.</p></div>
        <div className="m-body">
          <div className="m-group">
            <div className="field"><label>Nome da coluna</label><input autoFocus placeholder="Ex.: Em negociação" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label>Cor da etapa</label><div className="colorrow">{COLORS.map((c) => <span key={c} className={`swatch ${color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />)}</div></div>
            <div className="field"><label>Posição</label><select value={pos} onChange={(e) => setPos(e.target.value)}><option value="end">No final</option>{stages.map((s) => <option key={s.id} value={s.id}>Após “{s.name}”</option>)}</select></div>
          </div>
        </div>
        <div className="m-foot">
          <button className="m-cancel" onClick={onCancel}>Cancelar</button>
          <button className="m-save" disabled={!name.trim() || saving} onClick={() => onSave(name.trim(), color, 'NORMAL', pos === 'end' ? null : pos)}>{saving ? 'Criando…' : 'Criar coluna'}</button>
        </div>
      </div>
    </div>
  );
}

function MoveDealsModal({ from, count, options, onCancel, onConfirm }: { from: PipelineStage; count: number; options: PipelineStage[]; onCancel: () => void; onConfirm: (toId: string) => void }) {
  const [to, setTo] = useState(options[0]?.id || '');
  return (
    <div className="mscrim" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-h"><h2><MoveRight size={18} /> Mover negócios</h2><p>Mover os <b>{count}</b> negócio(s) de “{from.name}” para outra etapa.</p></div>
        <div className="m-body"><div className="field"><label>Etapa de destino</label><select value={to} onChange={(e) => setTo(e.target.value)}>{options.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div></div>
        <div className="m-foot"><button className="m-cancel" onClick={onCancel}>Cancelar</button><button className="m-save" disabled={!to || count === 0} onClick={() => onConfirm(to)}>Mover {count}</button></div>
      </div>
    </div>
  );
}

function DeleteStageModal({ stage, count, saving, onCancel, onConfirm, onMove }: { stage: PipelineStage; count: number; saving: boolean; onCancel: () => void; onConfirm: () => void; onMove: () => void }) {
  return (
    <div className="mscrim" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-h"><h2><Trash2 size={18} /> Excluir etapa</h2><p>Excluir a etapa “{stage.name}” da pipeline.</p></div>
        <div className="m-body">
          {count > 0 ? (
            <div className="warnbox"><AlertTriangle size={18} /><div>Esta etapa tem <b>{count}</b> negócio(s). Mova-os para outra etapa antes de excluir.</div></div>
          ) : (
            <div className="warnbox"><AlertTriangle size={18} /><div>A etapa não tem negócios. Esta ação não pode ser desfeita.</div></div>
          )}
        </div>
        <div className="m-foot">
          <button className="m-cancel" onClick={onCancel}>Cancelar</button>
          {count > 0 ? <button className="m-save" onClick={onMove}><MoveRight size={15} /> Mover negócios</button> : <button className="m-save danger" disabled={saving} onClick={onConfirm}>{saving ? 'Excluindo…' : 'Excluir etapa'}</button>}
        </div>
      </div>
    </div>
  );
}

function DeleteDealsModal({ stage, count, onCancel, onConfirm }: { stage: PipelineStage; count: number; onCancel: () => void; onConfirm: () => void }) {
  const [confirmText, setConfirmText] = useState('');
  return (
    <div className="mscrim" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-h"><h2><AlertTriangle size={18} /> Excluir negócios</h2><p>Excluir <b>todos</b> os negócios da etapa “{stage.name}”.</p></div>
        <div className="m-body">
          <div className="warnbox"><AlertTriangle size={18} /><div>Ação destrutiva. <b>{count}</b> negócio(s) serão excluídos permanentemente. Digite <b>EXCLUIR</b> para confirmar.</div></div>
          <div className="field"><input autoFocus placeholder="Digite EXCLUIR" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} /></div>
        </div>
        <div className="m-foot"><button className="m-cancel" onClick={onCancel}>Cancelar</button><button className="m-save danger" disabled={confirmText !== 'EXCLUIR' || count === 0} onClick={onConfirm}>Excluir {count}</button></div>
      </div>
    </div>
  );
}

function ImpulseModal({ stageName, onClose }: { stageName: string; onClose: () => void }) {
  const [name, setName] = useState('');
  return (
    <div className="mscrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-h"><h2><Zap size={18} /> Criar impulso <span className="demo">demo</span></h2><p>Para os leads da etapa “{stageName}”. Fluxo futuro — nada é enviado.</p></div>
        <div className="m-body">
          <div className="warnbox" style={{ background: '#f6f9ff', borderColor: '#dbe6ff', color: '#3a4d80' }}><Zap size={18} style={{ color: '#3d54e8' }} /><div>Impulso ainda não tem execução no backend. Você pode estruturar; nada é disparado (sem Meta, sem campanha real).</div></div>
          <div className="field"><label>Nome do impulso</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Reengajamento etapa" /></div>
          <div className="field"><label>Canal</label><select><option>WhatsApp</option><option>Instagram</option></select></div>
          <div className="field"><label>Mensagem</label><textarea rows={3} placeholder="Olá! Vi que você demonstrou interesse..." /></div>
          <div className="field"><label>Condição</label><select><option>Sem resposta há 24h</option><option>Sem movimento há 3 dias</option></select></div>
        </div>
        <div className="m-foot"><button className="m-cancel" onClick={onClose}>Fechar</button><button className="m-save" onClick={() => { toast('Impulso salvo (demo) — execução futura'); onClose(); }}>Salvar impulso</button></div>
      </div>
    </div>
  );
}

const DETAIL_TABS: Array<[string, string]> = [['hist', 'Histórico'], ['ativ', 'Atividades'], ['neg', 'Negócios'], ['arq', 'Arquivos'], ['atend', 'Atendimentos'], ['info', 'Informações do Negócio']];
const DETAIL_SECS: Array<[string, string]> = [['produtos', 'Produtos e Valores'], ['campos', 'Campos adicionais'], ['anexos', 'Anexos'], ['hist', 'Histórico'], ['ativ', 'Atividades']];

function LeadDetailModal({ card, stages, stageName, onClose }: { card: CardSummary; stages: PipelineStage[]; stageName?: string; onClose: () => void }) {
  const [tab, setTab] = useState('info');
  const [journey, setJourney] = useState<'pipe' | 'lead'>('pipe');
  const [sec, setSec] = useState('produtos');
  const curIdx = stages.findIndex((s) => s.id === card.stageId);
  const v = num(card.value);
  const owner = card.assignedTo?.name || null;
  const contact = card.contact?.name || null;
  const tint = avTint(owner || contact || card.title);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const timeline = (
    <div className="tl">
      {[['Negócio criado', new Date(card.createdAt).toLocaleDateString('pt-BR')], ['Primeiro contato', '1ª resposta registrada'], ['Qualificação', 'Lead avançou no funil'], ['Proposta', 'Aguardando retorno']].map(([t, s], i) => (
        <div className="tlitem" key={i}><div><div className="tldot" /><div className="tlline" /></div><div className="tlc"><b>{t}</b><small>{s}</small></div></div>
      ))}
    </div>
  );
  const activities = (
    <>
      <div className="drow"><MessageSquare size={16} /> 3 mensagens trocadas <span className="demo">demo</span></div>
      <div className="drow"><Calendar size={16} /> Follow-up agendado <span className="demo">demo</span></div>
      <div className="drow"><Activity size={16} /> Lead movido para “{stageName || '—'}”</div>
    </>
  );

  return (
    <div className="ldscrim" onClick={onClose}>
      <div className="ldmodal" onClick={stop}>
        <button className="ldclose" onClick={onClose}><X size={17} /></button>

        {/* Bloco esquerdo */}
        <div className="ldleft">
          <div className="ldl-hd">
            <div className="ldl-av" style={{ background: tint[0], color: tint[1] }}>{initial(contact || owner || card.title)}</div>
            <div className="ldl-nm">{card.title}</div>
            <div className="ldl-prod">{card.description || 'Sem produto'}</div>
            <div className="ldl-chips">
              <span className="ldl-chip" onClick={() => toast('Adicionar tags — em breve')}><TagIcon size={14} /> Adicionar tags</span>
              <span className="ldl-chip" onClick={() => toast('Adicionar listas — em breve')}><Layers size={14} /> Adicionar listas</span>
              <span className="ldl-chip" onClick={() => toast('Executar automação — em breve')}><Zap size={14} /> Executar automação</span>
            </div>
          </div>
          <div className="ldl-body">
            <h4 className="ldl-h4">Métricas</h4>
            <div className="ldl-metrics">
              <div className="ldl-metric"><div className="mi"><Wallet size={12} /> Ticket médio</div><div className="mv">{v > 0 ? brl(v) : 'R$ 0'}</div></div>
              <div className="ldl-metric"><div className="mi"><CreditCard size={12} /> Total</div><div className="mv">{v > 0 ? brl(v) : 'R$ 0'}</div></div>
              <div className="ldl-metric"><div className="mi"><Clock size={12} /> Ciclo de compra</div><div className="mv">0d</div></div>
              <div className="ldl-metric"><div className="mi"><Calendar size={12} /> Última compra</div><div className="mv">—</div></div>
            </div>
            <h4 className="ldl-h4">Notas</h4>
            <div className="ldl-notes">Cliente demonstrou interesse no pacote Growth Assistido. Retomar após envio da proposta. <span className="demo">demo</span></div>
            <h4 className="ldl-h4">Perfil</h4>
            <div className="ldl-prow"><span className="k">Nome</span><span className="vv">{contact || 'Contato não vinculado'}</span></div>
            <div className="ldl-prow"><span className="k">Empresa</span><span className="vv">—</span></div>
            <div className="ldl-prow"><span className="k">E-mail</span><span className="vv">{(contact ? contact.split(' ')[0].toLowerCase() : 'contato')}@example.com</span></div>
            <div className="ldl-prow"><span className="k">Telefone</span><span className="vv">{card.contact?.phone || '—'}</span></div>
          </div>
        </div>

        {/* Bloco direito */}
        <div className="ldright">
          <div className="ldr-tabs">
            {DETAIL_TABS.map(([k, label]) => (
              <span key={k} className={`ldr-tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{label}</span>
            ))}
          </div>
          <div className="ldr-body">
            {tab === 'info' && (
              <>
                <div className="ldr-stats">
                  <div className="ldr-stat violet"><div className="l">Número</div><div className="v">#{card.id.slice(-5).toUpperCase()}</div></div>
                  <div className="ldr-stat green"><div className="l">Valor total</div><div className="v">{v > 0 ? brl(v) : 'R$ 0'}</div></div>
                  <div className="ldr-stat blue"><div className="l">Data de criação</div><div className="v" style={{ fontSize: 15 }}>{new Date(card.createdAt).toLocaleDateString('pt-BR')}</div></div>
                </div>

                <div className="ldr-jt-wrap">
                  <span className={`ldr-jt ${journey === 'pipe' ? 'on' : ''}`} onClick={() => setJourney('pipe')}>Pipeline completa</span>
                  <span className={`ldr-jt ${journey === 'lead' ? 'on' : ''}`} onClick={() => setJourney('lead')}>Jornada do negócio</span>
                </div>
                {journey === 'pipe' ? (
                  <div className="dstepper">
                    {stages.map((s, i) => (
                      <div className={`dstep ${curIdx >= 0 && i < curIdx ? 'done' : i === curIdx ? 'cur' : ''}`} key={s.id}>
                        <span className="sdot" style={i === curIdx ? { borderColor: s.color || '#7c3cff', color: s.color || '#7c3cff' } : i < curIdx ? { background: s.color || '#7c3cff', borderColor: s.color || '#7c3cff' } : undefined}>{i < curIdx ? <Check size={13} /> : ''}</span>
                        <span className="slbl">{s.name}</span>
                      </div>
                    ))}
                  </div>
                ) : timeline}

                <div className="ldr-sectabs">
                  {DETAIL_SECS.map(([k, label]) => (
                    <span key={k} className={`ldr-st ${sec === k ? 'on' : ''}`} onClick={() => setSec(k)}>{label}</span>
                  ))}
                </div>
                {sec === 'produtos' && (
                  <div className="ldr-ptbl">
                    <div className="ldr-pr"><span className="pl"><TagIcon size={15} /> {card.description || 'Item do negócio'}</span><span>{v > 0 ? brl(v) : 'R$ 0'}</span></div>
                    <div className="ldr-pr"><span className="pl"><Percent size={15} /> Desconto (-)</span><span>R$ 0</span></div>
                    <div className="ldr-pr"><span className="pl"><Plus size={15} /> Acréscimo (+)</span><span>R$ 0</span></div>
                    <div className="ldr-pr"><span className="pl"><Package size={15} /> Frete (+)</span><span>R$ 0</span></div>
                    <div className="ldr-pr total"><span>Total</span><span style={{ color: '#1f9d63' }}>{v > 0 ? brl(v) : 'R$ 0'}</span></div>
                  </div>
                )}
                {sec === 'campos' && <div className="ldr-empty"><div className="ei"><Layers size={20} /></div>Sem campos adicionais cadastrados <span className="demo">demo</span></div>}
                {sec === 'anexos' && <div className="datt"><Paperclip size={15} /> proposta-growth-assistido.pdf <span className="demo">demo</span></div>}
                {sec === 'hist' && timeline}
                {sec === 'ativ' && activities}
              </>
            )}
            {tab === 'hist' && <div className="dsec"><h4>Histórico</h4>{timeline}</div>}
            {tab === 'ativ' && <div className="dsec"><h4>Atividades</h4>{activities}</div>}
            {tab === 'neg' && <div className="ldr-empty"><div className="ei"><GitBranch size={20} /></div>Nenhum outro negócio vinculado a este contato <span className="demo">demo</span></div>}
            {tab === 'arq' && <div className="dsec"><h4>Arquivos</h4><div className="datt"><Paperclip size={15} /> proposta-growth-assistido.pdf <span className="demo">demo</span></div></div>}
            {tab === 'atend' && <div className="ldr-empty"><div className="ei"><MessageSquare size={20} /></div>Atendimentos aparecem aqui quando há conversa vinculada <span className="demo">demo</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewDealModal({ stageName, saving, onCancel, onSave }: { stageName: string; saving: boolean; onCancel: () => void; onSave: (title: string, value?: number) => void }) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  return (
    <div className="mscrim" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-h"><h2><span className="mhic"><Plus size={17} /></span> Novo negócio</h2><p>Adicionando à etapa <b>{stageName}</b>. Preencha os dados principais do negócio.</p></div>
        <div className="m-body">
          <div className="m-group">
            <div className="field"><label>Título do negócio</label><input autoFocus placeholder="Ex.: Consulta — João Pereira" value={title} onChange={(e) => setTitle(e.target.value)} /><div className="hint">Use o formato “Oferta — Nome do contato” para facilitar a leitura no board.</div></div>
            <div className="field"><label>Valor estimado (R$)</label><input type="number" placeholder="0" value={value} onChange={(e) => setValue(e.target.value)} /></div>
          </div>
        </div>
        <div className="m-foot"><button className="m-cancel" onClick={onCancel}>Cancelar</button><button className="m-save" disabled={!title.trim() || saving} onClick={() => onSave(title.trim(), value ? Number(value) : undefined)}>{saving ? 'Criando…' : 'Criar negócio'}</button></div>
      </div>
    </div>
  );
}
