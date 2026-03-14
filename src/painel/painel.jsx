import React, { useState, useEffect } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import { INITIAL_HOME_DATA, INITIAL_MINISTRIES_DATA, INITIAL_FOOTER_DATA, INITIAL_HEADER_DATA } from '../lib/constants';
import { deepMerge, transformImageLink, parseSafeJson } from '../lib/dbUtils';
import { broadcastUpdate } from '../hooks/usePageUpdate';

const palette = {
  bg: '#0f1117',
  surface: '#1a1d27',
  surfaceHover: '#22263a',
  border: '#2a2f45',
  accent: '#6c63ff',
  accentLight: '#8b84ff',
  accentGlow: 'rgba(108,99,255,0.18)',
  success: '#22d3a5',
  warning: '#f59e0b',
  danger: '#f43f5e',
  info: '#38bdf8',
  text: '#e8eaf0',
  textMuted: '#7c82a0'
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  .painel-layout *, .painel-login-wrap *, .pm-backdrop * {box-sizing:border-box;margin:0;padding:0}
  body.painel-body{font-family:'Inter',sans-serif;background:${palette.bg};color:${palette.text}}
  .painel-login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${palette.bg};padding:1rem}
  .painel-login-card{width:100%;max-width:420px;background:${palette.surface};border:1px solid ${palette.border};border-radius:16px;padding:2rem;box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 0 1px rgba(108,99,255,.08)}
  .painel-login-logo{display:flex;align-items:center;gap:10px;margin-bottom:1.2rem}
  .painel-login-logo-icon{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,${palette.accent},${palette.accentLight});display:flex;align-items:center;justify-content:center}
  .painel-field{margin-bottom:1rem}
  .painel-field label{display:block;font-size:.78rem;color:${palette.textMuted};margin-bottom:.35rem;letter-spacing:.04em;text-transform:uppercase}
  .painel-field-wrap{position:relative}
  .painel-field-wrap span{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:1rem;color:${palette.textMuted};pointer-events:none}
  .painel-input{width:100%;background:${palette.bg};border:1px solid ${palette.border};border-radius:10px;padding:.7rem 1rem .7rem 2.4rem;color:${palette.text};font-size:.93rem;outline:none;transition:border-color .2s,box-shadow .2s}
  .painel-input:focus{border-color:${palette.accent};box-shadow:0 0 0 3px ${palette.accentGlow}}
  .painel-btn-primary{width:100%;padding:.82rem;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,${palette.accent},${palette.accentLight});color:#fff;font-size:.95rem;font-weight:600;box-shadow:0 4px 16px ${palette.accentGlow}}
  .painel-login-error{background:rgba(244,63,94,.12);border:1px solid rgba(244,63,94,.3);color:${palette.danger};border-radius:8px;padding:.65rem .9rem;font-size:.83rem;margin-bottom:.9rem;display:flex;align-items:center;gap:6px}
  .painel-layout{display:flex;min-height:100vh}
  .painel-sidebar{width:240px;background:${palette.surface};border-right:1px solid ${palette.border};display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;overflow-y:auto;transition:transform .3s ease;z-index:100}
  .painel-sidebar.collapsed{transform:translateX(-240px)}
  .painel-sidebar-logo{display:flex;align-items:center;gap:10px;padding:1.2rem;border-bottom:1px solid ${palette.border}}
  .painel-sidebar-logo-icon{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,${palette.accent},${palette.accentLight});display:flex;align-items:center;justify-content:center}
  .painel-sidebar-section{padding:.9rem .8rem .3rem}
  .painel-sidebar-section-label{font-size:.68rem;color:${palette.textMuted};font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:0 .4rem .4rem}
  .painel-nav-item{display:flex;align-items:center;gap:10px;padding:.62rem .75rem;border-radius:10px;cursor:pointer;font-size:.88rem;font-weight:500;color:${palette.textMuted};transition:background .18s,color .18s;margin-bottom:2px}
  .painel-nav-item:hover{background:${palette.surfaceHover};color:${palette.text}}
  .painel-nav-item.active{background:${palette.accentGlow};color:${palette.accentLight};font-weight:600}
  .painel-nav-item .nav-icon{font-size:1.05rem;width:20px;text-align:center}
  
  /* Status de Conexão */
  .conn-status-wrap { padding: 1rem .8rem; border-top: 1px solid ${palette.border}; margin-top: auto; }
  .conn-badge { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: ${palette.textMuted}; margin-bottom: 8px; }
  .conn-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
  .conn-status-dot.online { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4); }
  .conn-status-dot.offline { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.4); }
  .conn-status-dot.testing { background: #f59e0b; animation: conn-pulse 1s infinite; }
  .conn-test-btn { width: 100%; padding: 8px; font-size: 0.7rem; background: ${palette.bg}; border: 1px solid ${palette.border}; border-radius: 6px; color: ${palette.text}; cursor: pointer; transition: all 0.2s; }
  .conn-test-btn:hover { background: ${palette.accentGlow}; border-color: ${palette.accent}; }
  @keyframes conn-pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

  .painel-sidebar-footer{padding:1rem .8rem;border-top:1px solid ${palette.border}}
  .painel-topbar{position:fixed;top:0;right:0;left:240px;height:60px;background:${palette.surface};border-bottom:1px solid ${palette.border};display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;z-index:99;transition:left .3s ease}
  .painel-topbar.full{left:0}
  .painel-hamburger{background:none;border:none;cursor:pointer;color:${palette.textMuted};font-size:1.2rem;padding:4px;border-radius:6px}
  .painel-breadcrumb{font-size:.85rem;color:${palette.textMuted}}
  .painel-breadcrumb strong{color:${palette.text};margin-left:4px}
  .painel-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,${palette.accent},${palette.accentLight});display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700}
  .painel-badge-btn{position:relative;background:none;border:none;color:${palette.textMuted};font-size:1.1rem;padding:4px;cursor:pointer}
  .painel-badge{position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:${palette.danger};border-radius:50%;border:2px solid ${palette.surface}}
  .painel-main{flex:1;margin-left:240px;margin-top:60px;padding:1.6rem;transition:margin-left .3s ease;min-height:calc(100vh - 60px)}
  .painel-main.full{margin-left:0}
  .painel-page-header{margin-bottom:1.6rem}
  .painel-page-header h1{font-size:1.5rem;font-weight:700}
  .painel-page-header p{color:${palette.textMuted};font-size:.87rem;margin-top:3px}
  .painel-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem}
  .painel-stat-card{background:${palette.surface};border:1px solid ${palette.border};border-radius:14px;padding:1.2rem 1.2rem 1rem;display:flex;flex-direction:column;gap:.5rem;position:relative}
  .painel-stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent-color)}
  .painel-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--accent-bg)}
  .painel-stat-label{font-size:.78rem;color:${palette.textMuted};font-weight:500;letter-spacing:.04em;text-transform:uppercase}
  .painel-stat-value{font-size:1.7rem;font-weight:700;line-height:1}
  .painel-stat-change{font-size:.78rem}
  .painel-card{background:${palette.surface};border:1px solid ${palette.border};border-radius:14px;padding:1.2rem}
  .painel-chart{display:flex;align-items:flex-end;gap:6px;height:80px}
  .painel-bar{flex:1;border-radius:4px 4px 0 0;background:linear-gradient(180deg,${palette.accent},${palette.accentLight})}
  .painel-activity-list{display:flex;flex-direction:column;gap:.7rem}
  .painel-activity-item{display:flex;align-items:center;gap:.75rem}
  .painel-activity-dot{width:8px;height:8px;border-radius:50%}
  .painel-activity-dot.success{background:${palette.success}}
  .painel-activity-dot.warning{background:${palette.warning}}
  .painel-activity-dot.danger{background:${palette.danger}}
  .painel-activity-dot.info{background:${palette.info}}
  .painel-activity-info{flex:1;min-width:0}
  .painel-activity-info p{font-size:.83rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .painel-activity-info span{font-size:.74rem;color:${palette.textMuted}}
  .painel-activity-time{font-size:.73rem;color:${palette.textMuted};white-space:nowrap}
  .painel-table-wrap{width:100%;overflow-x:auto}
  .painel-table{width:100%;border-collapse:collapse;font-size:.85rem}
  .painel-table th{padding:.7rem 1rem;text-align:left;font-size:.75rem;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;background:#2e7d32}
  .painel-table th:first-child{border-radius:8px 0 0 0}
  .painel-table th:last-child{border-radius:0 8px 0 0}
  .painel-table td{padding:.75rem 1rem;border-bottom:1px solid rgba(42,47,69,.5);vertical-align:middle}
  .painel-table tr:hover td{background:rgba(108,99,255,.04)}
  .status-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:.74rem;font-weight:600}
  .status-pill.active{background:rgba(34,211,165,.12);color:${palette.success}}
  .status-pill.pending{background:rgba(245,158,11,.12);color:${palette.warning}}
  .status-pill.inactive{background:rgba(124,130,160,.12);color:${palette.textMuted}}
  .status-pill.danger{background:rgba(244,63,94,.12);color:${palette.danger}}
  .status-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
  .painel-action-btn{background:none;border:1px solid ${palette.border};color:${palette.textMuted};border-radius:6px;padding:3px 8px;font-size:.75rem;cursor:pointer}
  .btn-editar{background:#1976d2;border:none;color:#fff;border-radius:6px;padding:5px 14px;font-size:.78rem;font-weight:600;cursor:pointer;transition:background .2s}
  .btn-editar:hover{background:#1565c0}
  .btn-deletar{background:#d32f2f;border:none;color:#fff;border-radius:6px;padding:5px 14px;font-size:.78rem;font-weight:600;cursor:pointer;transition:background .2s}
  .btn-deletar:hover{background:#c62828}
  .btn-ver{background:#388e3c;border:none;color:#fff;border-radius:6px;padding:5px 14px;font-size:.78rem;font-weight:600;cursor:pointer;transition:background .2s}
  .btn-ver:hover{background:#2e7d32}
  .painel-table-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:.7rem;flex-wrap:wrap}
  .painel-search-wrap{position:relative}
  .painel-search-wrap span{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:.9rem;color:${palette.textMuted}}
  .painel-search{background:${palette.bg};border:1px solid ${palette.border};border-radius:8px;padding:.52rem 1rem .52rem 2.2rem;color:${palette.text};font-size:.85rem;outline:none;width:200px}
  .painel-filter-select{background:${palette.bg};border:1px solid ${palette.border};border-radius:8px;padding:.52rem .8rem;color:${palette.text};font-size:.85rem;outline:none}
  .painel-logout-btn{display:flex;align-items:center;gap:8px;width:100%;padding:.65rem .75rem;background:none;border:1px solid rgba(244,63,94,.2);border-radius:10px;color:${palette.danger};font-size:.87rem;font-weight:500}
  .painel-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99}
  @media (max-width:1024px){.painel-sidebar{width:220px}.painel-topbar{left:220px}.painel-main{margin-left:220px}}
  @media (max-width:768px){
    .painel-sidebar{transform:translateX(-240px);width:240px}
    .painel-sidebar.open{transform:translateX(0)}
    .painel-topbar{left:0!important}
    .painel-main{margin-left:0!important;padding:1rem}
    .painel-overlay.visible{display:block}
    .painel-stats-grid{grid-template-columns:1fr}
    .painel-table-bar{flex-direction:column;align-items:stretch}
    .painel-search{width:100%}
    .pm-modal{width:95%;margin:auto}
    .pm-row{grid-template-columns:1fr}
    .painel-page-header h1{font-size:1.3rem}
  }
  .pm-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
  .pm-modal{background:${palette.surface};border:1px solid ${palette.border};border-radius:18px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 40px 80px rgba(0,0,0,.6)}
  .pm-header{display:flex;align-items:center;justify-content:space-between;padding:1.3rem 1.5rem 1rem;border-bottom:1px solid ${palette.border}}
  .pm-close{background:none;border:none;color:${palette.textMuted};font-size:1.3rem;cursor:pointer;padding:2px}
  .pm-body{padding:1.4rem 1.5rem}
  .pm-photo-wrap{display:flex;flex-direction:column;align-items:center;gap:.6rem;margin-bottom:1.4rem}
  .pm-photo-preview{width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid ${palette.border};background:${palette.bg};display:flex;align-items:center;justify-content:center;font-size:2rem;overflow:hidden}
  .pm-photo-preview img{width:100%;height:100%;object-fit:cover;border-radius:50%}
  .pm-photo-btn{background:${palette.accentGlow};border:1px dashed ${palette.accent};color:${palette.accentLight};border-radius:8px;padding:.4rem .9rem;font-size:.8rem;font-weight:600;cursor:pointer}
  .pm-row{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
  .pm-field{margin-bottom:.9rem}
  .pm-field label{display:block;font-size:.75rem;color:${palette.textMuted};font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin-bottom:.35rem}
  .pm-field-wrap{position:relative}
  .pm-field-wrap .pm-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:.9rem;color:${palette.textMuted}}
  .pm-input{width:100%;background:${palette.bg};border:1px solid ${palette.border};border-radius:9px;padding:.65rem 1rem .65rem 2.2rem;color:${palette.text};font-size:.88rem;outline:none}
  .pm-input:focus{border-color:${palette.accent};box-shadow:0 0 0 3px ${palette.accentGlow}}
  .pm-select{width:100%;background:${palette.bg};border:1px solid ${palette.border};border-radius:9px;padding:.65rem .9rem;color:${palette.text};font-size:.88rem;outline:none}
  .pm-footer{display:flex;gap:.7rem;justify-content:flex-end;padding:1rem 1.5rem;border-top:1px solid ${palette.border}}
  .pm-btn-cancel{padding:.62rem 1.2rem;border-radius:9px;border:1px solid ${palette.border};background:none;color:${palette.textMuted};font-size:.88rem;cursor:pointer}
  .pm-btn-save{padding:.62rem 1.4rem;border-radius:9px;border:none;cursor:pointer;background:linear-gradient(135deg,${palette.accent},${palette.accentLight});color:#fff;font-size:.88rem;font-weight:600}
  .pm-add-btn{display:flex;align-items:center;gap:6px;padding:.52rem .9rem;background:linear-gradient(135deg,${palette.accent},${palette.accentLight});border:none;border-radius:8px;color:#fff;font-size:.83rem;font-weight:600;cursor:pointer}
  .user-avatar-sm{width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid ${palette.border};display:inline-flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;background:${palette.accentGlow};color:${palette.accentLight}}
`;

const MOCK_USERS = [];

const MOCK_ACTIVITIES = [
  { type: 'success', text: 'Novo membro cadastrado', detail: 'Ana Paula Silva (Goiânia / GO)', time: '2 min atrás' },
  { type: 'info', text: 'Novo acesso detectado', detail: 'Visitante de São Paulo / SP', time: '45 min atrás' },
  { type: 'success', text: 'Publicação aprovada', detail: 'Revista Kids', time: '2 horas atrás' },
  { type: 'danger', text: 'Tentativa de login inválida', detail: 'IP: 189.20.xx.xx (Brasília / DF)', time: '3 horas atrás' }
];

const buildBars = (users = [], logs = []) => {
  // Garantir que as entradas sejam arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  // Dados base para garantir que o gráfico nunca fique vazio
  const baseData = [
    { label: 'Jan', h: 45 }, { label: 'Fev', h: 70 }, { label: 'Mar', h: 55 },
    { label: 'Abr', h: 90 }, { label: 'Mai', h: 65 }, { label: 'Jun', h: 85 },
    { label: 'Jul', h: 50 }, { label: 'Ago', h: 75 }, { label: 'Set', h: 60 },
    { label: 'Out', h: 95 }, { label: 'Nov', h: 80 }, { label: 'Dez', h: 70 }
  ];

  // Se não houver dados reais, retorna o mock com uma pequena variação para parecer "vivo"
  if (safeUsers.length === 0 && safeLogs.length === 0) {
    return baseData.map(b => ({ ...b, h: Math.min(100, Math.max(10, b.h + (Math.floor(Math.random() * 11) - 5))) }));
  }

  // Agrega usuários por mês se houver created_at ou since
  const countsByMonth = Array(12).fill(0);
  safeUsers.forEach(u => {
    if (!u) return;
    const dateStr = u.created_at || u.since;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        countsByMonth[d.getMonth()]++;
      }
    }
  });

  // Também agrega logs do mês atual
  const currentMonth = new Date().getMonth();
  countsByMonth[currentMonth] += Math.floor(safeLogs.length / 5); // Cada 5 logs contam como 1 ponto de atividade

  return baseData.map((b, idx) => {
    const count = countsByMonth[idx];
    let height = b.h;

    // Se tivermos dados reais para este mês (via usuários ou logs), usamos uma base + o proporcional
    if (count > 0) {
      height = Math.min(100, 30 + (count * 10));
    } else {
      // Se não houver dados, mantém o mock mas um pouco menor
      height = Math.max(15, b.h - 10);
    }

    return { ...b, h: height };
  });
};

// STATS transformados em função ou calculados dentro do componente
// funções utilitárias removidas para evitar avisos de variáveis não usadas

const NAV_ITEMS_DEFAULT = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'paginas', label: 'Páginas', icon: '📄' },
  { id: 'conteudo', label: 'Conteúdo', icon: '📝' },
  { id: 'mensagens', label: 'Mensagens', icon: '📩' }
];

const NAV_SETTINGS_DEFAULT = [
  { id: 'usuarios', label: 'Usuários', icon: '👤' },
  { id: 'logs', label: 'Histórico Logs', icon: '📜' },
  { id: 'configs', label: 'Configurações', icon: '⚙️' }
];

const CREDENTIALS = { email: 'admin@admin.com', password: '123456' };

// --------- Helpers para edição amigável de páginas específicas ---------

const getBetween = (source, startMarker, endMarker, fallback = '') => {
  const start = source.indexOf(startMarker);
  if (start === -1) return fallback;
  const from = start + startMarker.length;
  const end = source.indexOf(endMarker, from);
  if (end === -1) return fallback;
  return source.slice(from, end).trim();
};

// Removed unused replaceBetween function

// Remove chaves e espaços extras de qualquer lado do texto capturado
const cleanField = (value) => value.replace(/[{}]/g, '').trim();

const parseContactPage = (content) => ({
  title: cleanField(getBetween(content, '/* CMS_CONTACT_TITLE_START */', '/* CMS_CONTACT_TITLE_END */', 'Entre em Contato')),
  subtitle: cleanField(getBetween(content, '/* CMS_CONTACT_SUBTITLE_START */', '/* CMS_CONTACT_SUBTITLE_END */', '')),
  address: cleanField(getBetween(content, '/* CMS_CONTACT_ADDRESS_START */', '/* CMS_CONTACT_ADDRESS_END */', '')),
  phone: cleanField(getBetween(content, '/* CMS_CONTACT_PHONE_START */', '/* CMS_CONTACT_PHONE_END */', '')),
  email: cleanField(getBetween(content, '/* CMS_CONTACT_EMAIL_START */', '/* CMS_CONTACT_EMAIL_END */', '')),
  schedule: cleanField(getBetween(content, '/* CMS_CONTACT_SCHEDULE_START */', '/* CMS_CONTACT_SCHEDULE_END */', '')),
});

// Removed unused applyContactPage function

// -------- HomeAnivEditor: Manages birthdays from the Home editor --------
function HomeAnivEditor({ palette, ministryOptions }) {
  const [selMin, setSelMin] = React.useState(ministryOptions[0]?.value || 'jovens');
  const [bData, setBData] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const fetchMinistryBirthdays = async (id) => {
    const { data: dbData } = await supabase
      .from('site_settings')
      .select('data')
      .eq('key', `ministry_${id}`)
      .single();
    return dbData?.data?.birthdays || { title: '', text: '', videoUrl: '', people: [] };
  };

  React.useEffect(() => {
    setBData(null);
    fetchMinistryBirthdays(selMin).then(setBData);
  }, [selMin]);

  const updatePeople = (next) => setBData(d => ({ ...d, people: next }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: dbData } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', `ministry_${selMin}`)
        .single();

      const full = dbData?.data || {};
      await supabase.from('site_settings').upsert({
        key: `ministry_${selMin}`,
        data: { ...full, birthdays: bData }
      });

      broadcastUpdate(`ministry_${selMin}`);
      setMsg('✅ Salvo!');
    } catch (err) {
      console.error('Error saving birthdays:', err);
      setMsg('❌ Erro!');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 2000);
    }
  };

  const textareaStyle = { width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 };

  return (
    <div>
      {/* Ministry Selector */}
      <div className="pm-field" style={{ marginBottom: '1.2rem' }}>
        <label>Selecione o Ministério</label>
        <select
          value={selMin}
          onChange={e => setSelMin(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 1rem', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, fontSize: '.9rem', outline: 'none' }}
        >
          {ministryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {!bData ? (
        <div style={{ color: palette.textMuted, padding: '1rem' }}>Carregando...</div>
      ) : (
        <>
          <div className="pm-field">
            <label>Título da Seção</label>
            <div className="pm-field-wrap">
              <span className="pm-icon">🎉</span>
              <input className="pm-input" value={bData.title || ''} onChange={e => setBData(d => ({ ...d, title: e.target.value }))} placeholder="Ex: Aniversariantes do Mês" />
            </div>
          </div>
          <div className="pm-field">
            <label>Texto Descritivo</label>
            <textarea value={bData.text || ''} onChange={e => setBData(d => ({ ...d, text: e.target.value }))} style={textareaStyle} />
          </div>
          <div className="pm-field">
            <label>Link do Vídeo (YouTube)</label>
            <div className="pm-field-wrap">
              <span className="pm-icon">▶</span>
              <input className="pm-input" placeholder="https://www.youtube.com/watch?v=..." value={bData.videoUrl || ''} onChange={e => setBData(d => ({ ...d, videoUrl: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', marginBottom: '0.8rem', fontWeight: 600, fontSize: '.9rem', color: palette.text }}>👥 Lista de Aniversariantes</div>
          {(bData.people || []).map((p, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem', padding: '1rem', background: palette.surfaceHover, borderRadius: '12px', border: `1px solid ${palette.border}` }}>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${palette.accent}`, flexShrink: 0, background: palette.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {p.photo ? <img src={transformImageLink(p.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                </div>
                <label style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: palette.accentGlow, color: palette.accentLight, borderRadius: '6px', border: `1px solid ${palette.accent}` }}>
                  Alterar Foto
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 1024 * 1024) {
                      alert('A imagem é muito grande (maior que 1MB).\n\nPara não sobrecarregar o sistema, use imagens menores ou links externos.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = ev => {
                      const next = [...(bData.people || [])];
                      next[idx] = { ...next[idx], photo: ev.target.result };
                      updatePeople(next);
                    };
                    reader.readAsDataURL(file);
                  }} />
                </label>
              </div>
              <div className="pm-field">
                <label>Nome</label>
                <div className="pm-field-wrap">
                  <span className="pm-icon">👤</span>
                  <input className="pm-input" value={p.name || ''} onChange={e => {
                    const next = [...(bData.people || [])];
                    next[idx] = { ...next[idx], name: e.target.value };
                    updatePeople(next);
                  }} />
                </div>
              </div>
              <div className="pm-field">
                <label>Data (ex: 15/05)</label>
                <div className="pm-field-wrap">
                  <span className="pm-icon">📅</span>
                  <input className="pm-input" placeholder="DD/MM" value={p.date || ''} onChange={e => {
                    const next = [...(bData.people || [])];
                    next[idx] = { ...next[idx], date: e.target.value };
                    updatePeople(next);
                  }} />
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn-deletar"
                  onClick={() => {
                    if (currentUser?.role === 'Viewer') {
                      alert('Visualizadores não podem excluir dados.');
                      return;
                    }
                    const next = [...(bData.people || [])];
                    next.splice(idx, 1);
                    updatePeople(next);
                  }}
                  disabled={currentUser?.role === 'Viewer'}
                  style={currentUser?.role === 'Viewer' ? { opacity: .5, cursor: 'not-allowed' } : {}}
                >Excluir</button>
              </div>
            </div>
          ))}
          <button className="pm-add-btn" onClick={() => updatePeople([...(bData.people || []), { name: '', date: '', photo: '' }])}>
            + Adicionar Aniversariante
          </button>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="painel-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : '💾 Salvar Aniversariantes'}
            </button>
            {msg && <span style={{ color: palette.accent, fontWeight: 600 }}>{msg}</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default function PainelAdm() {
  const hasSupabase = Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY);
  const [isLogged, setIsLogged] = useState(() => sessionStorage.getItem('painel_auth') === '1');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Status de Conexão com Supabase
  const [connStatus, setConnStatus] = useState({ state: 'testing', message: 'Iniciando...' });
  const [isTestingConn, setIsTestingConn] = useState(false);

  const checkConnection = async (manual = false) => {
    setIsTestingConn(true);
    if (manual) setConnStatus({ state: 'testing', message: 'Testando...' });
    
    const { testSupabaseConnection } = await import('../lib/supabase');
    const result = await testSupabaseConnection();
    
    setConnStatus({
      state: result.ok ? 'online' : 'offline',
      message: result.ok ? 'Online' : 'Desativado'
    });
    setIsTestingConn(false);
    
    if (manual) {
      alert(result.ok ? 'Conexão estabelecida com sucesso!' : `Falha: ${result.message}`);
    }
  };

  useEffect(() => {
    if (isLogged) checkConnection();
  }, [isLogged]);

  const [showPassword, setShowPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [activePage, setActivePage] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showModalPw, setShowModalPw] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Viewer', status: 'active', photo: null, location: '' });
  const [userMode, setUserMode] = useState('create');
  const [editingUserId, setEditingUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [pageMode, setPageMode] = useState('create'); // create | edit | contact
  const [pageName, setPageName] = useState('');
  const [pageData, setPageData] = useState({ title: '', description: '', photo: null });
  const [pageSaving, setPageSaving] = useState(false);
  const [visitorCount, setVisitorCount] = useState(327);
  const [logs, setLogs] = useState([]);
  const [bars, setBars] = useState(() => buildBars([], []));

  const [navMain, setNavMain] = useState(NAV_ITEMS_DEFAULT);
  const [navSettings, setNavSettings] = useState(NAV_SETTINGS_DEFAULT);

  // Aplica classe ao body para os estilos do painel não vazarem para o site
  useEffect(() => {
    document.body.classList.add('painel-body');
    return () => document.body.classList.remove('painel-body');
  }, []);

  const [ministryId, setMinistryId] = useState('jovens');
  const [ministryData, setMinistryData] = useState(null);
  const [ministryLoading, setMinistryLoading] = useState(false);
  const [ministryTab, setMinistryTab] = useState('geral');
  const [homeData, setHomeData] = useState(null);
  const [homeVideos, setHomeVideos] = useState([]);
  const [homeTab, setHomeTab] = useState('bemvindo');

  // Função utilitária para remover thumbnails pesadas do JSON antes de salvar no Supabase
  const sanitizeVideos = (arr) => (arr || []).map((v) => {
    if (!v) return null;
    const rest = { ...v };
    if ('thumbnail' in rest) delete rest.thumbnail;
    return rest;
  }).filter(Boolean);

  useEffect(() => {
    // Atualiza o gráfico sempre que os usuários ou logs forem carregados
    setBars(buildBars(users, logs));
  }, [users, logs]);

  const [hasPagesNotif, setHasPagesNotif] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bem-vindo ao Painel', text: 'Você agora pode ler avisos e alertas aqui no sino.', time: '01m atrás', read: false }
  ]);
  const [siteMessages, setSiteMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNotifBox, setShowNotifBox] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // Tenta a chave nova e depois a legado para evitar logout forçado
      const storedUser = localStorage.getItem('admac_current_user') || localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      loadUsers();
      loadPages();
      loadVisitorCount();
      loadSiteMessages();
      loadLogs();
    }
  }, [currentUser]);

  const handleFileUpload = (callback) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const MAX_SIZE_MB = hasSupabase ? 5 : 1;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`A imagem é muito grande (limite ${MAX_SIZE_MB}MB).`);
        return;
      }

      // Tenta enviar para Supabase Storage se disponível
      if (hasSupabase && supabase?.storage) {
        try {
          const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
          const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const path = `uploads/${safeName}`;
          const { error: upErr } = await supabase.storage.from('site-images').upload(path, file, {
            upsert: true,
            contentType: file.type || 'image/jpeg',
            cacheControl: '3600'
          });
          if (!upErr) {
            const { data } = supabase.storage.from('site-images').getPublicUrl(path);
            if (data?.publicUrl) {
              callback(data.publicUrl);
              return;
            }
          }
        } catch {
          // fallback abaixo
        }
      }

      // Fallback: base64 local (modo offline)
      const reader = new FileReader();
      reader.onload = (ev) => callback(ev.target.result);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const loadLogs = async () => {
    if (!hasSupabase) {
      setLogs([]);
      return;
    }
    const { data: dbLogs } = await supabase
      .from('site_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setLogs(dbLogs || []);
  };
  const ministryOptions = [
    { id: 'home', label: 'Home' },
    { id: 'jovens', label: 'Jovens' },
    { id: 'mulheres', label: 'Mulheres' },
    { id: 'homens', label: 'Homens' },
    { id: 'louvor', label: 'Louvor' },
    { id: 'kids', label: 'Kids' },
    { id: 'ebd', label: 'EBD' },
    { id: 'lares', label: 'Lares' },
    { id: 'social', label: 'Ação Social' },
    { id: 'retiro', label: 'Retiro' },
    { id: 'intercessao', label: 'Intercessão' },
    { id: 'missoes', label: 'Missões' },
    { id: 'midia', label: 'Mídia' },
    { id: 'revista', label: 'Revista' },
    { id: 'sobre', label: 'Sobre' },
  ];
  const pageToMinistry = {
    'Home': 'home',
    'HomePage': 'home',
    'Min. Kids': 'kids',
    'Kids': 'kids',
    'Min. Louvor': 'louvor',
    'Louvor': 'louvor',
    'Min. Jovens': 'jovens',
    'Jovens': 'jovens',
    'Min. Mulheres': 'mulheres',
    'Mulheres': 'mulheres',
    'Min. Homens': 'homens',
    'Homens': 'homens',
    'Min. Lares': 'lares',
    'Lares': 'lares',
    'Ação Social': 'social',
    'Social': 'social',
    'EBD': 'ebd',
    'Retiros': 'retiro',
    'Retiro': 'retiro',
    'Intercessão': 'intercessao',
    'Missões': 'missoes',
    'Missoes': 'missoes',
    'Midia': 'midia',
    'Revista': 'revista',
    'Revista Admac': 'revista',
    'Sobre': 'sobre',
    'Contact': 'contact'
  };

  // Carrega configurações do menu do painel (se existirem)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admac_painel_nav');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.main) && parsed.main.length) {
        const mainFiltered = parsed.main.filter((i) => i.id !== 'eventos' && i.id !== 'servicos' && i.id !== 'membros' && i.id !== 'financeiro');
        setNavMain(mainFiltered);
        const membItem = parsed.main.find((i) => i.id === 'membros');
        if (membItem) {
          const currentSettings = Array.isArray(parsed.settings) ? parsed.settings : [];
          const exists = currentSettings.some((i) => i.id === 'membros');
          if (!exists) {
            setNavSettings([...(currentSettings.length ? currentSettings : NAV_SETTINGS_DEFAULT), membItem]);
            return;
          }
        }
      }
      if (Array.isArray(parsed.settings) && parsed.settings.length) {
        let settingsMerged = parsed.settings;
        if (!settingsMerged.some(i => i.id === 'membros')) {
          settingsMerged = [...settingsMerged, { id: 'membros', label: 'Membros', icon: '👥' }];
        }
        if (!settingsMerged.some(i => i.id === 'relatorios')) {
          settingsMerged = [...settingsMerged, { id: 'relatorios', label: 'Relatórios', icon: '📊' }];
        }
        setNavSettings(settingsMerged);
      }
    } catch {
      // se der erro, usa defaults
    }
  }, []);

  const saveNavConfig = async () => {
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem alterar as configurações do menu.');
      return;
    }
    try {
      const payload = { main: navMain, settings: navSettings };
      await supabase.from('site_settings').upsert({
        key: 'painel_nav',
        data: payload
      });
      alert('Configurações do menu salvas com sucesso!');
    } catch {
      alert('Erro ao salvar configurações do menu.');
    }
  };

  const loadUsers = async () => {
    try {
      if (!hasSupabase) {
        setUsers([]);
        return;
      }
      const { data: dbUsers, error } = await supabase
        .from('site_users')
        .select('*');

      if (error) {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        setUsers(authUsers?.users || []);
        return;
      }
      setUsers(dbUsers || []);
    } catch (err) {
      console.warn('Error loading users:', err);
    }
  };

  const loadVisitorCount = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', 'visitor_stats')
        .single();

      if (data && data.data && typeof data.data.value === 'number') {
        setVisitorCount(data.data.value);
      }
    } catch (err) {
      console.warn('Error loading visitor count:', err);
    }
  };

  const loadSiteMessages = async () => {
    setMessagesLoading(true);
    try {
      const { data: msgs } = await supabase
        .from('site_messages')
        .select('*')
        .order('created_at', { ascending: false });
      setSiteMessages(msgs || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const approveTestimonial = async (msg) => {
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem aprovar testemunhos.');
      return;
    }
    try {
      const key = `ministry_${msg.category}`;
      const { data: dbData } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', key)
        .single();

      const mData = dbData?.data || {};
      const testimonials = mData.testimonials || [];

      const newTestimonial = {
        name: msg.name,
        text: msg.message,
        photo: '',
        age: ''
      };

      const updated = {
        ...mData,
        testimonials: [...testimonials, newTestimonial]
      };

      const { error } = await supabase.from('site_settings').upsert({ key, data: updated });

      if (!hasSupabase || error) {
        try {
          localStorage.setItem(`admac_site_settings:${key}`, JSON.stringify(updated));
        } catch { /* ignore */ }
      }

      if (error && hasSupabase) throw error;

      await supabase.from('site_messages').update({ type: 'testimonial_approved' }).eq('id', msg.id);

      broadcastUpdate(key);
      alert('Testemunho aprovado com sucesso!');
      loadSiteMessages();
    } catch (err) {
      console.error('Err:', err);
      alert('Erro ao aprovar.');
    }
  };

  useEffect(() => {
    if (activePage === 'mensagens') loadSiteMessages();
  }, [activePage]);

  // Header and Footer Data for Configs Tab
  const [headerData, setHeaderData] = useState(INITIAL_HEADER_DATA);
  const [footerData, setFooterData] = useState(INITIAL_FOOTER_DATA);

  useEffect(() => {
    const fetchHeaderFooter = async () => {
      try {
        const [headerRes, footerRes] = await Promise.all([
          supabase.from('site_settings').select('data').eq('key', 'header').single(),
          supabase.from('site_settings').select('data').eq('key', 'footer').single()
        ]);

        if (headerRes.data?.data) {
          const parsedHeader = typeof headerRes.data.data === 'string' ? JSON.parse(headerRes.data.data) : headerRes.data.data;
          setHeaderData(deepMerge(INITIAL_HEADER_DATA, parsedHeader));
        } else {
          try {
            const cached = localStorage.getItem('admac_site_settings:header');
            if (cached) {
              setHeaderData(deepMerge(INITIAL_HEADER_DATA, JSON.parse(cached)));
            } else {
              setHeaderData(INITIAL_HEADER_DATA);
            }
          } catch {
            setHeaderData(INITIAL_HEADER_DATA);
          }
        }

        if (footerRes.data?.data) {
          const parsedFooter = typeof footerRes.data.data === 'string' ? JSON.parse(footerRes.data.data) : footerRes.data.data;
          setFooterData(deepMerge(INITIAL_FOOTER_DATA, parsedFooter));
        } else {
          try {
            const cached = localStorage.getItem('admac_site_settings:footer');
            if (cached) {
              setFooterData(deepMerge(INITIAL_FOOTER_DATA, JSON.parse(cached)));
            } else {
              setFooterData(INITIAL_FOOTER_DATA);
            }
          } catch {
            setFooterData(INITIAL_FOOTER_DATA);
          }
        }
      } catch (err) {
        console.error('Error fetching header/footer:', err);
        setHeaderData(INITIAL_HEADER_DATA);
        setFooterData(INITIAL_FOOTER_DATA);
      }
    };
    fetchHeaderFooter();
  }, []);

  const openCreateUser = () => {
    setUserMode('create')
    setEditingUserId(null)
    setNewUser({ name: '', email: '', password: '', role: 'Viewer', status: 'active', photo: null, location: '' })
    setShowModal(true)
  }

  const openEditUser = (u) => {
    setUserMode('edit')
    setEditingUserId(u.id)
    setNewUser({ name: u.name, email: u.email, password: u.password || '', role: u.role, status: u.status, photo: u.photo || null, location: u.location || '' })
    setShowModal(true)
  }

  const openViewUser = (u) => {
    setUserMode('view')
    setEditingUserId(u.id)
    setNewUser({ name: u.name, email: u.email, password: u.password || '', role: u.role, status: u.status, photo: u.photo || null, location: u.location || '' })
    setShowModal(true)
  }

  const saveUser = async (e) => {
    e.preventDefault();
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem criar ou editar usuários.');
      return;
    }
    try {
      if (userMode === 'create') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: newUser.email,
          password: newUser.password,
          options: {
            data: {
              full_name: newUser.name,
              role: newUser.role
            }
          }
        });
        if (signUpError) throw signUpError;

        // Inserir na tabela site_users com os dados completos
        const { error: dbError } = await supabase.from('site_users').insert({
          id: authData.user.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          location: newUser.location,
          photo: newUser.photo,
          since: new Date().toLocaleDateString('pt-BR')
        });
        if (dbError) throw dbError;

        alert('Usuário cadastrado com sucesso!');
      } else {
        // Edit mode - updating profile data
        const { error } = await supabase.from('site_users').upsert({
          id: editingUserId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          location: newUser.location,
          photo: newUser.photo
        });
        if (error) throw error;
        alert('Usuário atualizado com sucesso!');
      }
      setShowModal(false);
      await loadUsers();
    } catch (err) {
      alert(`Erro ao salvar usuário: ${err.message}`);
    }
  }

  const deleteUser = async (id) => {
    if (id === currentUser?.id || id === 'offline-admin') {
      alert('Você não pode excluir o seu próprio usuário ou o administrador padrão.');
      return;
    }

    if (currentUser?.role !== 'Administrador') {
      alert('Apenas administradores podem excluir usuários.');
      return;
    }

    const ok = window.confirm('Excluir este usuário?');
    if (!ok) return;

    try {
      const { error } = await supabase.from('site_users').delete().eq('id', id);
      if (error) throw error;

      await loadUsers();
      alert('Usuário excluído com sucesso!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(`Erro ao excluir usuário: ${err.message}`);
    }
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('A foto é muito grande (limite 1MB).\n\nReduza o tamanho da imagem ou use um link externo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setNewUser(u => ({ ...u, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [sidebarOpen]);

  useEffect(() => {
    loadUsers();
    loadPages();
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onStorage = (e) => { if (!e.key || e.key === 'admac_analytics') setBars(buildBars(users, logs)); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [users, logs]);

  useEffect(() => {
    const loadUser = () => {
      try {
        const u = localStorage.getItem('admac_current_user');
        setCurrentUser(u ? JSON.parse(u) : null);
      } catch { setCurrentUser(null) }
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  useEffect(() => {
    if (activePage === 'paginas') setHasPagesNotif(false);
  }, [activePage]);

  // Sincroniza o usuário atual com a lista de usuários para restaurar fotos ausentes
  useEffect(() => {
    if (currentUser && !currentUser.photo && users.length > 0) {
      const match = users.find(u => u.email === currentUser.email);
      if (match && match.photo) {
        const updated = { ...currentUser, photo: match.photo, name: match.name, role: match.role };
        localStorage.setItem('admac_current_user', JSON.stringify(updated));
        setCurrentUser(updated);
      }
    }
  }, [users, currentUser]);

  // Simula alerta de visitantes
  useEffect(() => {
    const timer = setTimeout(() => {
      const visitorCount = Math.floor(Math.random() * 5) + 1;
      const locations = ['São Paulo / SP', 'Rio de Janeiro / RJ', 'Goiânia / GO', 'Brasília / DF', 'Curitiba / PR', 'Belo Horizonte / MG'];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const newNotif = {
        id: Date.now(),
        title: 'Novos Visitantes',
        text: `Neste momento há ${visitorCount} pessoas de ${loc} visitando o site. Clique para saber mais.`,
        time: 'Agora',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      setHasPagesNotif(true);
    }, 15000); // 15 segundos para o primeiro alerta
    return () => clearTimeout(timer);
  }, []);
  const loadMinistry = async (id) => {
    try {
      setMinistryLoading(true);
      const key = id === 'home' ? 'home' : `ministry_${id}`;

      const [settingRes, videoRes] = await Promise.all([
        supabase.from('site_settings').select('data').eq('key', key).single(),
        id === 'home' ? supabase.from('site_settings').select('data').eq('key', 'videos').single() : Promise.resolve({ data: null })
      ]);

      let rawData = settingRes.data?.data;
      let vids = videoRes.data?.data;

      // Fallback offline: se falhar no Supabase ou vier vazio, tenta localStorage
      if (!rawData || settingRes.error) {
        try {
          const local = localStorage.getItem(`admac_site_settings:${key}`);
          if (local) rawData = JSON.parse(local);
        } catch { }
      }
      if (id === 'home' && (!vids || videoRes.error)) {
        try {
          const localVideos = localStorage.getItem('admac_site_settings:videos');
          if (localVideos) vids = JSON.parse(localVideos);
        } catch { }
      }

      const defaultData = id === 'home' ? INITIAL_HOME_DATA : INITIAL_MINISTRIES_DATA[id];
      const parsedRaw = parseSafeJson(rawData);
      
      // Fusão robusta: Garante que nunca seja null
      let data = defaultData;
      if (parsedRaw) {
        data = typeof deepMerge === 'function' ? deepMerge(defaultData, parsedRaw) : { ...defaultData, ...parsedRaw };
      }
      
      vids = parseSafeJson(vids) || [];

      if (id === 'home') {
        const syncedData = { ...data, videos: vids || [] };
        setHomeData(syncedData);
        setMinistryData(syncedData);
        setHomeVideos(vids || []);
      } else {
        setMinistryData(data);
      }
    } catch (err) {
      console.error('Error loading content:', err);
      // Fallback supremo para não deixar a tela branca/vazia
      const fallback = id === 'home' ? INITIAL_HOME_DATA : INITIAL_MINISTRIES_DATA[id];
      setMinistryData(fallback);
      if (id === 'home') setHomeData(fallback);
    } finally {
      setMinistryLoading(false);
    }
  };

  useEffect(() => {
    if (activePage === 'conteudo') {
      loadMinistry(ministryId);
    }
  }, [activePage, ministryId]);

  const saveMinistry = async () => {
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem salvar alterações em ministérios.');
      return;
    }
    if (!ministryId || !ministryData) return;
    try {
      const key = ministryId === 'home' ? 'home' : `ministry_${ministryId}`;

      const cleanHomeVideos = ministryId === 'home' ? sanitizeVideos(homeVideos) : null;
      const sanitizedVideos = cleanHomeVideos || sanitizeVideos(ministryData?.videos);

      const sanitizedMinistryData = {
        ...ministryData,
        videos: sanitizedVideos
      };

      if (ministryId === 'home') {
        const [r1, r2] = await Promise.all([
          supabase.from('site_settings').upsert({ key: 'home', data: sanitizedMinistryData }),
          supabase.from('site_settings').upsert({ key: 'videos', data: cleanHomeVideos })
        ]);

        const e1 = r1?.error, e2 = r2?.error;
        if (e1 || e2) {
          console.error('[Supabase Error] Home Save (home):', e1);
          console.error('[Supabase Error] Home Save (videos):', e2);
          console.log('%cAVISO: Se o erro for 413, suas fotos em base64 são muito grandes.', 'color: orange; font-weight: bold;');
        }

        if (!hasSupabase || e1 || e2) {
          try {
            localStorage.setItem('admac_site_settings:home', JSON.stringify(sanitizedMinistryData));
            localStorage.setItem('admac_site_settings:videos', JSON.stringify(cleanHomeVideos));
          } catch (err) { console.warn('LocalStorage Save Error:', err); }
        }

        setHomeData(sanitizedMinistryData);
        setHomeVideos(cleanHomeVideos);

        // CORREÇÃO: Só recarrega do banco se o save deu certo. 
        // Se deu erro, mantém o estado atual (para não apagar o que o usuário digitou)
        if (!e1 && !e2 && hasSupabase) {
          const { data: reload } = await supabase.from('site_settings').select('data').eq('key', 'home').single();
          if (reload?.data) {
            const parsedReload = parseSafeJson(reload.data);
            setMinistryData(deepMerge(INITIAL_HOME_DATA, parsedReload));
          }
        }
        
        broadcastUpdate('home');
        broadcastUpdate('videos');

        if (!hasSupabase || e1 || e2) {
          let errorHint = '';
          const err = e1 || e2;
          if (err) {
            if (err.code === '42P01') errorHint = '\n\nDICA: A tabela "site_settings" não foi encontrada no banco. Execute o SQL de configuração.';
            else if (err.code === '42501') errorHint = '\n\nDICA: Permissão negada (RLS). Você precisa autorizar o acesso anon ou entrar com uma conta real.';
            else if (err.message?.includes('payload too large') || err.code === '413') errorHint = '\n\nDICA: Suas fotos são muito grandes. Tente usar imagens menores.';
            else errorHint = `\n\nDetalhe: ${err.message || 'Erro desconhecido'}`;
          }
          alert(`Configurações da Home salvas APENAS LOCALMENTE (Offline). O Supabase retornou um erro.${errorHint}`);
        } else {
          alert('Configurações da Home salvas com sucesso no banco de dados!');
        }
      } else {
        const { error } = await supabase.from('site_settings').upsert({ key, data: sanitizedMinistryData });

        if (error) {
          console.error(`[Supabase Error] ${key} Save:`, error);
          if (error.code === '42P01') console.error('ERRO: Tabela site_settings não encontrada no novo Supabase.');
          if (error.message?.includes('payload too large')) console.error('ERRO: Imagens base64 muito grandes para o Supabase.');
        }

        if (!hasSupabase || error) {
          try {
            localStorage.setItem(`admac_site_settings:ministry_${ministryId}`, JSON.stringify(sanitizedMinistryData));
          } catch (err) { console.warn('LocalStorage Save Error:', err); }
        }

        // CORREÇÃO: Só recarrega do banco se o save deu certo.
        if (!error && hasSupabase) {
          const { data: reload } = await supabase.from('site_settings').select('data').eq('key', key).single();
          if (reload?.data) {
            const defaultData = INITIAL_MINISTRIES_DATA[ministryId] || {};
            const parsedReload = parseSafeJson(reload.data);
            setMinistryData(deepMerge(defaultData, parsedReload));
          }
        }
        
        broadcastUpdate(key);

        if (!hasSupabase || error) {
          let errorHint = '';
          if (error) {
            if (error.code === '42P01') errorHint = '\n\nDICA: Tabela não encontrada. Execute o SQL de configuração.';
            else if (error.code === '42501') errorHint = '\n\nDICA: Permissão negada (RLS). Mude para uma conta real ou libere o acesso anônimo no SQL.';
            else errorHint = `\n\nDetalhe: ${error.message}`;
          }
          alert(`Ministério salvo APENAS LOCALMENTE (Offline). ${errorHint}`);
        } else {
          alert('Ministério salvo com sucesso no banco de dados!');
        }
      }
    } catch (err) {
      console.error('Error saving content:', err);
      alert('Erro grave ao salvar conteúdo. Verifique o console.');
    }
  };

  // Gera o HTML completo de um relatório de acessos para ser aberto em nova aba ou impresso.
  // CORREÇÃO: variáveis renomeadas de `pages`/`people` para `pagesData`/`peopleData` para evitar
  // sombreamento (variable shadowing) com o estado `pages` declarado no componente.
  const buildAccessReportHTML = (days = 30) => {
    let pagesData = [];
    let peopleData = [];
    const period = new Date(Date.now() - days * 86400000).toLocaleDateString('pt-BR') + ' a ' + new Date().toLocaleDateString('pt-BR');
    const total = 0;
    const style = `
      body{font-family:Arial,Helvetica,sans-serif;color:#000;padding:20px}
      .hdr{border-bottom:2px solid #000;margin-bottom:10px}
      .title{font-weight:bold;font-size:16px;text-align:center;margin:6px 0}
      .meta{font-size:12px;display:flex;flex-wrap:wrap;gap:12px;margin-bottom:8px}
      .blk{border-top:1px solid #000;margin-top:14px;padding-top:8px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #000;padding:6px;text-align:left}
      th{background:#eee}
      .right{text-align:right}
    `;
    // Gera as linhas HTML da tabela de páginas e pessoas para o relatório
    const rowsPages = pagesData.map(p => `<tr><td>${p.path}</td><td class="right">${p.count}</td><td class="right">${p.sessions}</td><td class="right">${p.people}</td><td>${p.last ? new Date(p.last).toLocaleString('pt-BR') : ''}</td></tr>`).join('');
    const rowsPeople = peopleData.map(p => `<tr><td>${p.name}</td><td>${p.email || ''}</td><td class="right">${p.count}</td><td class="right">${p.sessions}</td><td class="right">${p.pagesCount}</td><td>${p.last ? new Date(p.last).toLocaleString('pt-BR') : ''}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><style>${style}</style><title>Relatório de Acessos</title></head><body>
      <div class="hdr">
        <div class="title">ADMAC — Relatório de Acessos</div>
      </div>
      <div class="meta">
        <div><strong>Período:</strong> ${period}</div>
        <div><strong>Total de visitas:</strong> ${total}</div>
      </div>
      <div class="blk">
        <div class="title" style="text-align:left">Páginas</div>
        <table>
          <thead><tr><th>Página</th><th>Visitas</th><th>Sessões</th><th>Pessoas</th><th>Último acesso</th></tr></thead>
          <tbody>${rowsPages || '<tr><td colspan="5">Sem dados</td></tr>'}</tbody>
        </table>
      </div>
      <div class="blk">
        <div class="title" style="text-align:left">Pessoas</div>
        <table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Visitas</th><th>Sessões</th><th>Páginas únicas</th><th>Último acesso</th></tr></thead>
          <tbody>${rowsPeople || '<tr><td colspan="6">Sem dados</td></tr>'}</tbody>
        </table>
      </div>
    </body></html>`;
  };

  const openConfigEditHome = async () => {
    setPageMode('home');
    setPageName('Home');
    try {
      const [{ data: dbHome }, { data: dbVideos }] = await Promise.all([
        supabase.from('site_settings').select('data').eq('key', 'home').single(),
        supabase.from('site_settings').select('data').eq('key', 'videos').single()
      ]);

      let hd = dbHome?.data || null;
      let videos = dbVideos?.data || null;

      // Fallback localStorage quando Supabase estiver indisponível
      if (!hd) {
        try {
          const raw = localStorage.getItem('admac_site_settings:home');
          if (raw) hd = JSON.parse(raw);
        } catch { /* ignore */ }
      }
      if (!videos) {
        try {
          const raw = localStorage.getItem('admac_site_settings:videos');
          if (raw) videos = JSON.parse(raw);
        } catch { /* ignore */ }
      }

      hd = hd || INITIAL_HOME_DATA;
      videos = videos || [];
      
      // Sincroniza os conteúdos para evitar discrepância no editor
      const syncedHome = { ...hd, videos };

      setHomeData(syncedHome);
      setMinistryData(syncedHome);
      setHomeVideos(videos);
    } catch (err) {
      console.error('Error opening home config:', err);
      setHomeData(INITIAL_HOME_DATA);
      setMinistryData(INITIAL_HOME_DATA);
      setHomeVideos([]);
    }
    setHomeTab('bemvindo');
    setPageModalOpen(true);
  };

  const openConfigEditMinistry = async (id) => {
    if (!id) return;
    if (id === 'home') return openConfigEditHome();
    setPageMode('ministry');
    setPageName(id);
    setMinistryId(id);
    setMinistryTab('geral');
    await loadMinistry(id);
    setPageModalOpen(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const email = (loginData.email || '').trim().toLowerCase();
    const password = (loginData.password || '').trim();

    try {
      // Prioridade 1: Bypass para contas administrativas padrão (offline ou primeiro acesso)
      if ((email === 'admin@admin.com' && password === '123456') || 
          (email === 'aelda@800' && password === 'igrejaadmac2026')) {
        const user = { 
          id: email === 'aelda@800' ? 'aelda-admin' : 'offline-admin', 
          name: email === 'aelda@800' ? 'Aelda ADMAC' : 'Admin (Master)', 
          email: email, 
          role: 'Administrador', 
          status: 'active', 
          photo: null 
        };
        sessionStorage.setItem('painel_auth', '1');
        localStorage.setItem('admac_current_user', JSON.stringify(user));
        setCurrentUser(user);
        setIsLogged(true);
        console.info(`[Login] Acesso via conta mestre (${email}) autorizado.`);
        return;
      }

      // Prioridade 2: Autenticação real via Supabase
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          setLoginError(`Erro de Autenticação: ${error.message}${error.message?.includes('Invalid') ? '. Tente as credenciais padrão se não possuir uma conta.' : ''}`);
          return;
        }

          if (data?.user) {
            const user = {
              id: data.user.id,
              name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
              email: data.user.email,
              role: data.user.user_metadata?.role || 'Administrador',
              status: 'active',
              photo: data.user.user_metadata?.avatar_url || null
            };
            sessionStorage.setItem('painel_auth', '1');
            localStorage.setItem('admac_current_user', JSON.stringify(user));
            setCurrentUser(user);
            setIsLogged(true);

            // Log de acesso (silencioso se falhar)
            try {
              await supabase.from('site_logs').insert({
                action: 'LOGIN_SISTEMA',
                user_email: user.email,
                details: 'Autenticado via Supabase Auth'
              });
            } catch (e) {
              console.warn('[Log] Falha ao registrar log de login:', e.message);
            }
          }
        } catch (authErr) {
          // Captura erros de rede como "Failed to fetch"
          console.error('[Auth Exception]', authErr);
          if (loginData.email === 'admin@admin.com' && loginData.password === '123456') {
            const user = { id: 'offline-admin', name: 'Admin', email: 'admin@admin.com', role: 'Administrador', status: 'active', photo: null };
            sessionStorage.setItem('painel_auth', '1');
            localStorage.setItem('admac_current_user', JSON.stringify(user));
            setCurrentUser(user);
            setIsLogged(true);
          } else {
            setLoginError('Erro de conexão com o servidor. Verifique sua internet ou tente o acesso padrão.');
          }
      }
    } catch (err) {
      console.error('Erro ao autenticar no painel:', err);
      setLoginError('Erro inesperado no login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const userEmail = currentUser?.email || 'admin@admin.com';
    sessionStorage.removeItem('painel_auth');
    localStorage.removeItem('admac_current_user');
    setCurrentUser(null);
    setIsLogged(false);
    setLoginData({ email: '', password: '' });
    setActivePage('dashboard');
    try {
      await supabase.from('site_logs').insert({
        action: 'LOGOUT_SISTEMA',
        user_email: userEmail,
        details: 'Sessão encerrada pelo usuário'
      });
    } catch {
      console.error('Error logging logout');
    }
  };

  const loadPages = async () => {
    try {
      setPagesLoading(true)

      let pageFiles = [];

      // Tenta buscar a lista real de arquivos via API do Vite (disponível em dev)
      try {
        const resp = await fetch('/api/pages');
        const data = await resp.json();
        if (data && data.items) {
          pageFiles = data.items.map(it => ({ name: it.name, file: it.file }));
        }
      } catch {
        console.warn('Vite API not available, falling back to static list');
      }

      // Fallback para lista estática se a API falhar ou não retornar itens
      if (!pageFiles.length) {
        pageFiles = [
          { name: 'Home', file: 'Home.jsx' },
          { name: 'Kids', file: 'Kids.jsx' },
          { name: 'Louvor', file: 'Louvor.jsx' },
          { name: 'Jovens', file: 'JovensPage.jsx' },
          { name: 'Mulheres', file: 'Mulheres.jsx' },
          { name: 'Homens', file: 'Homens.jsx' },
          { name: 'Lares', file: 'Lares.jsx' },
          { name: 'Retiro', file: 'Retiro.jsx' },
          { name: 'Social', file: 'Social.jsx' },
          { name: 'EBD', file: 'EBD.jsx' },
          { name: 'Midia', file: 'Midia.jsx' },
          { name: 'Sobre', file: 'Sobre.jsx' },
          { name: 'Contact', file: 'Contact.jsx' },
          { name: 'Missões', file: 'Missoes.jsx' },
          { name: 'Revista Admac', file: 'RevistaAdmac.jsx' },
          { name: 'Intercessão', file: 'Intercessao.jsx' }
        ];
      }

      const { data: dbSettings } = await supabase
        .from('site_settings')
        .select('key, data');

      const items = pageFiles.map(pf => {
        const id = pageToMinistry[pf.name] || pf.name.toLowerCase();
        const key = id === 'home' ? 'home' : `ministry_${id}`;
        let settings = dbSettings?.find(s => s.key === key)?.data;

        // Fallback offline: se não achou no Supabase, tenta no localStorage
        if (!settings) {
          try {
            const local = localStorage.getItem(`admac_site_settings:${key}`);
            if (local) settings = JSON.parse(local);
          } catch { }
        }

        // Verifica se 'active' existe no JSON do banco ou local.
        const isActive = settings?.active !== false;

        return {
          ...pf,
          active: isActive,
          photo: settings?.hero?.image || settings?.welcome?.image || null
        };
      });

      setPages(items);
    } catch (err) {
      console.error('Error loading pages:', err);
    } finally {
      setPagesLoading(false)
    }
  }

  const openCreatePage = () => {
    setPageMode('create')
    setPageName('')
    setPageData({ title: '', description: '', photo: null })
    setPageModalOpen(true)
  }

  const openEditPage = async (name) => {
    try {
      const id = pageToMinistry[name] || name.toLowerCase();
      const key = id === 'home' ? 'home' : `ministry_${id}`;

      if (name === 'Home') {
        setPageMode('home');
        setPageName(name);

        const { data: dbHome } = await supabase.from('site_settings').select('data').eq('key', 'home').single();
        const { data: dbVideos } = await supabase.from('site_settings').select('data').eq('key', 'videos').single();

        const hd = dbHome?.data || INITIAL_HOME_DATA;
        const videosArr = dbVideos?.data || [];
        const syncedHomeData = { ...hd, videos: videosArr };

        setHomeData(syncedHomeData);
        setMinistryData(syncedHomeData);
        setHomeVideos(videosArr);
        setHomeTab('bemvindo');
        setPageModalOpen(true);
        return;
      }

      if (pageToMinistry[name]) {
        setPageMode('ministry');
        setPageName(name);
        setMinistryId(id);
        setMinistryTab('geral');
        await loadMinistry(id);
        setPageModalOpen(true);
        return;
      }

      // Generic page or specialized like 'Contact'
      const { data: dbPage } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', key)
        .single();

      const raw = dbPage?.data ? (typeof dbPage.data === 'string' ? dbPage.data : JSON.stringify(dbPage.data, null, 2)) : '';


      if (name.toLowerCase() === 'contact') {
        let parsed = {};
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = parseContactPage(raw);
        }
        setPageMode('contact');
        setPageName(name);
        setPageData({
          title: parsed.title || 'Entre em Contato',
          description: parsed.subtitle || parsed.description || '',
          address: parsed.address || '',
          phone: parsed.phone || '',
          email: parsed.email || '',
          schedule: parsed.schedule || '',
        });
        setPageModalOpen(true);
        return;
      }

      setPageMode('edit');
      setPageName(name);
      let pageDataObj = { title: name, description: '', photo: null };
      try {
        const parsed = JSON.parse(raw);
        if (parsed.title) pageDataObj = parsed;
      } catch {
        pageDataObj.description = raw;
      }
      setPageData(pageDataObj);
      setPageModalOpen(true);
    } catch (err) {
      console.error('Error opening page editor:', err);
    }
  }

  const handlePagePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('A imagem é muito grande (maior que 1MB).\n\nRecomendamos usar imagens otimizadas p/ web ou links externos.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setPageData(d => ({ ...d, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const savePage = async () => {
    if (currentUser?.role === 'Viewer') {
      alert('Visualizadores não podem salvar alterações nas páginas.');
      return;
    }
    try {
      setPageSaving(true);
      if (!pageName.trim()) return;

      const id = pageToMinistry[pageName] || pageName.toLowerCase();
      const key = id === 'home' ? 'home' : `ministry_${id}`;

      if (pageMode === 'home') {
        const cleanVideos = sanitizeVideos(homeVideos);
        const cleanHome = { ...(homeData || {}), videos: cleanVideos };

        const [r1, r2] = await Promise.all([
          supabase.from('site_settings').upsert({ key: 'home', data: cleanHome }),
          supabase.from('site_settings').upsert({ key: 'videos', data: cleanVideos })
        ]);

        // Persistência local quando Supabase estiver offline/erro
        const e1 = r1?.error, e2 = r2?.error;
        if (!hasSupabase || e1 || e2) {
          try {
            localStorage.setItem('admac_site_settings:home', JSON.stringify(cleanHome));
            localStorage.setItem('admac_site_settings:videos', JSON.stringify(homeVideos || []));
          } catch { /* ignore */ }
        }

        setMinistryData(cleanHome);
        broadcastUpdate('home');
        broadcastUpdate('videos');
        try {
          localStorage.setItem('home', String(Date.now()));
          localStorage.setItem('videos', String(Date.now()));
        } catch { /* ignore */ }
        setHasPagesNotif(true);
        setPageModalOpen(false);
        await loadPages();
        if (!hasSupabase || e1 || e2) {
          alert('Página Home salva em modo offline (navegador). Configure o Supabase para sincronizar.');
        } else {
          alert('Página Home salva com sucesso!');
        }
        return;
      }

      if (pageMode === 'ministry') {
        const { error } = await supabase.from('site_settings').upsert({
          key: `ministry_${ministryId}`,
          data: ministryData || {}
        });
        if (!hasSupabase || error) {
          try {
            localStorage.setItem(`admac_site_settings:ministry_${ministryId}`, JSON.stringify(ministryData || {}));
          } catch { /* ignore */ }
        }
        broadcastUpdate(`ministry_${ministryId}`);
        setHasPagesNotif(true);
        setPageModalOpen(false);
        await loadPages();
        if (!hasSupabase || error) {
          alert('Página de Ministério salva em modo offline (navegador).');
        } else {
          alert('Página de Ministério salva com sucesso!');
        }
        return;
      }

      let content;
      if (pageMode === 'contact') {
        const fields = {
          title: pageData.title || '',
          subtitle: pageData.description || '',
          address: pageData.address || '',
          phone: pageData.phone || '',
          email: pageData.email || '',
          schedule: pageData.schedule || '',
        };
        content = JSON.stringify(fields);

        // SYNC: Update Footer as well
        const updatedFooter = {
          ...footerData,
          contact: {
            ...footerData.contact,
            address: fields.address,
            phone: fields.phone,
            email: fields.email,
            cultos: fields.schedule
          }
        };

        // Save both in parallel
        const [rPage, rFooter] = await Promise.all([
          supabase.from('site_settings').upsert({ key: key, data: content }),
          supabase.from('site_settings').upsert({ key: 'footer', data: updatedFooter })
        ]);

        const ePage = rPage?.error;
        const eFooter = rFooter?.error;

        if (!hasSupabase || ePage || eFooter) {
          try {
            localStorage.setItem(`admac_site_settings:${key}`, content);
            localStorage.setItem('admac_site_settings:footer', JSON.stringify(updatedFooter));
          } catch { }
          if (hasSupabase && (ePage || eFooter)) console.error('[Supabase Error] Contact/Footer:', ePage || eFooter);
          setFooterData(updatedFooter);
          broadcastUpdate('footer');
          alert('Página de Contato salva LOCALMENTE (Offline).');
        } else {
          setFooterData(updatedFooter);
          broadcastUpdate('footer');
          alert('Página de Contato e Rodapé atualizados com sucesso!');
        }
      } else {
        content = JSON.stringify(pageData);
        const { error } = await supabase.from('site_settings').upsert({
          key: key,
          data: content
        });

        if (!hasSupabase || error) {
          try {
            localStorage.setItem(`admac_site_settings:${key}`, content);
          } catch { }
          if (hasSupabase && error) console.error(`[Supabase Error] ${key} Save:`, error);
          alert('Página salva LOCALMENTE (Offline).');
        } else {
          alert('Página salva com sucesso no banco de dados!');
        }
      }

      broadcastUpdate(key);
      setHasPagesNotif(true);
      setPageModalOpen(false);
      await loadPages();
    } catch (err) {
      console.error('Error saving page:', err);
      alert('Erro ao salvar a página.');
    } finally {
      setPageSaving(false);
    }
  }

  const togglePageStatus = async (name, currentStatus) => {
    try {
      const id = pageToMinistry[name] || name.toLowerCase();
      const key = id === 'home' ? 'home' : `ministry_${id}`;

      // Busca dados atuais para não sobrescrever o resto do objeto JSON
      const { data: dbData } = await supabase.from('site_settings').select('data').eq('key', key).single();
      const currentData = dbData?.data || {};
      const nextData = { ...currentData, active: !currentStatus };

      // Atualiza no banco
      const { error } = await supabase.from('site_settings').upsert({ key, data: nextData });

      if (!hasSupabase || error) {
        try {
          localStorage.setItem(`admac_site_settings:${key}`, JSON.stringify(nextData));
        } catch { /* ignore */ }
      }

      if (error && hasSupabase) throw error;

      // Atualiza estado local imediatamente para feedback visual instantâneo
      setPages(prev => prev.map(p => p.name === name ? { ...p, active: !currentStatus } : p));

      broadcastUpdate(key);
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Erro ao alterar status da página. Verifique sua conexão.');
    }
  }

  const deletePage = async (name) => {
    if (currentUser?.role === 'Viewer') {
      alert('Seu perfil de Visualizador não permite excluir conteúdos.');
      return;
    }

    const isProtected = ['Home', 'Login', 'Dashboard', 'PainelAdm', 'PainelApp'].some(p => p.toLowerCase() === name.toLowerCase());
    if (isProtected) {
      alert('Esta é uma página protegida do sistema. Você não pode excluí-la.');
      return;
    }

    if (!window.confirm(`Deseja realmente excluir os dados da página "${name}"? \n\nO conteúdo voltará ao padrão original do sistema.`)) return;
    try {
      const id = pageToMinistry[name] || name.toLowerCase();
      const key = id === 'home' ? 'home' : `ministry_${id}`;

      const { error } = await supabase.from('site_settings').delete().eq('key', key);

      // Também remove do cache local para garantir sincronia em modo offline
      try {
        localStorage.removeItem(`admac_site_settings:${key}`);
      } catch { /* ignore */ }

      if (error && hasSupabase) throw error;

      alert('Conteúdo da página restaurado para o padrão do sistema!');
      broadcastUpdate(key);
      await loadPages();
    } catch (err) {
      console.error('Error deleting page:', err);
      alert('Erro ao excluir os dados da página. Verifique sua conexão.');
    }
  };

  useEffect(() => {
    if (activePage === 'paginas') loadPages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage])

  if (!isLogged) {
    return (
      <>
        <style>{globalCSS}</style>
        <div className="painel-login-wrap">
          <div className="painel-login-card">
            <div className="painel-login-logo">
              <div className="painel-login-logo-icon">⛪</div>
              <span>ADMAC — Painel</span>
            </div>
            <h2>Bem-vindo</h2>
            <p>Faça login para acessar o painel administrativo.</p>
            {loginError && <div className="painel-login-error">⚠ {loginError}</div>}
            <form onSubmit={handleLogin} autoComplete="off">
              <div className="painel-field">
                <label>E-mail</label>
                <div className="painel-field-wrap">
                  <span>✉</span>
                  <input className="painel-input" type="email" placeholder="admin@admin.com" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
                </div>
              </div>
              <div className="painel-field">
                <label>Senha</label>
                <div className="painel-field-wrap">
                  <span>🔒</span>
                  <input className="painel-input" type={showPassword ? 'text' : 'password'} placeholder="••••••" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} style={{ paddingRight: '2.6rem' }} required />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#7c82a0', padding: '2px', lineHeight: 1 }} title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button className="painel-btn-primary" type="submit" disabled={loginLoading}>{loginLoading ? 'Entrando...' : 'Entrar no Painel →'}</button>
            </form>
            <button
              className="painel-btn-primary"
              type="button"
              onClick={openCreateUser}
              style={{
                marginTop: '0.8rem',
                background: 'transparent',
                border: `2px solid ${palette.accent}`,
                color: palette.accent,
                cursor: 'pointer',
                width: '100%',
                transition: 'background .2s, color .2s'
              }}
            >
              📝 Cadastrar
            </button>
          </div>

          {/* Modal de cadastro também disponível na tela de login */}
          {showModal && (
            <div className="pm-backdrop" onClick={() => setShowModal(false)}>
              <div className="pm-modal" onClick={e => e.stopPropagation()}>
                <div className="pm-header">
                  <h3>{userMode === 'create' ? 'Novo Usuário' : userMode === 'edit' ? 'Editar Usuário' : 'Usuário'}</h3>
                  <button className="pm-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <form onSubmit={saveUser}>
                  <div className="pm-body">
                    <div className="pm-row">
                      <div className="pm-field">
                        <label>Nome</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">👤</span>
                          <input className="pm-input" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>E-mail</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">✉</span>
                          <input className="pm-input" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                        </div>
                      </div>
                    </div>
                    <div className="pm-row">
                      <div className="pm-field">
                        <label>Perfil</label>
                        <select className="pm-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                          <option value="Viewer">Viewer</option>
                          <option value="Editor">Editor</option>
                          <option value="Administrador">Administrador</option>
                        </select>
                      </div>
                      <div className="pm-field">
                        <label>Status</label>
                        <select className="pm-select" value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })}>
                          <option value="active">Ativo</option>
                          <option value="pending">Pendente</option>
                          <option value="inactive">Inativo</option>
                          <option value="danger">Risco</option>
                        </select>
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Localização (Cidade/Estado)</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">📍</span>
                        <input className="pm-input" placeholder="Ex: Goiânia / GO" value={newUser.location} onChange={e => setNewUser({ ...newUser, location: e.target.value })} />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Senha</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🔒</span>
                        <input
                          className="pm-input"
                          type={showModalPw ? 'text' : 'password'}
                          value={newUser.password}
                          onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pm-footer">
                    <button type="button" className="pm-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="pm-btn-save">Salvar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  const filteredUsers = (users || []).filter(u => {
    if (!u) return false;
    const q = search.toLowerCase();
    const matchSearch =
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.location && u.location.toLowerCase().includes(q));
    const matchFilter = filter === 'all' || u.status === filter;
    return matchSearch && matchFilter;
  });

  const dynamicStats = [
    { label: 'Membros', value: (users || []).length.toString(), change: '+0%', dir: 'up', icon: '👥', color: '#6c63ff', bg: 'rgba(108,99,255,0.12)', sub: 'Localizados' },
    { label: 'Visitantes agora', value: (visitorCount || 0).toString(), change: 'SP, RJ, GO, DF', dir: 'up', icon: '🏃', color: '#22d3a5', bg: 'rgba(34,211,165,0.12)', sub: 'Localidade' },
    { label: 'Publicações', value: (pages || []).length.toString(), change: `+${(pages || []).length}`, dir: 'up', icon: '📄', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', sub: 'Ativas' }
  ];

  const renderPage = () => {
    if (activePage === 'dashboard') {
      return (
        <div>
          <div className="painel-stats-grid">
            {dynamicStats.map((s, i) => (
              <div key={i} className="painel-stat-card" style={{ '--accent-color': s.color, '--accent-bg': s.bg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="painel-stat-label">{s.label}</div>
                    <div className="painel-stat-value">{s.value}</div>
                  </div>
                  <div className="painel-stat-icon">{s.icon}</div>
                </div>
                <div className={`painel-stat-change ${s.dir}`} style={{ fontSize: '.7rem' }}>
                  {s.icon === '🏃' ? '📍 ' : s.dir === 'up' ? '▲ ' : '▼ '}
                  {s.change} {s.sub}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div className="painel-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Páginas do Site</h3>
                <button className="painel-action-btn" onClick={() => setActivePage('paginas')}>Ver Todas</button>
              </div>
              <div className="painel-table-wrap">
                <table className="painel-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Arquivo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pages || []).slice(0, 5).map(p => (
                      <tr key={p.file}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="user-avatar-sm" style={{ width: 32, height: 32, borderRadius: 6 }}>
                              {p.photo ? <img src={transformImageLink(p.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} /> : '📄'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>{p.name}</span>
                              <span style={{ fontSize: '.68rem', color: palette.textMuted }}>📍 Última visita de: {['SP', 'RJ', 'GO', 'DF', 'PR'][Math.floor(Math.random() * 5)]}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: palette.textMuted, fontSize: '.8rem' }}>{p.file}</td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-editar" onClick={() => openEditPage(p.name)} style={{ padding: '4px 8px' }}>✏️ Editar</button>
                          <button
                            className="btn-deletar"
                            onClick={() => deletePage(p.name)}
                            style={{ padding: '4px 8px', opacity: ['Home', 'Login', 'Dashboard', 'PainelAdm', 'PainelApp'].some(name => name.toLowerCase() === p.name.toLowerCase()) ? 0.5 : 1, cursor: ['Home', 'Login', 'Dashboard', 'PainelAdm', 'PainelApp'].some(name => name.toLowerCase() === p.name.toLowerCase()) ? 'not-allowed' : 'pointer' }}
                            disabled={['Home', 'Login', 'Dashboard', 'PainelAdm', 'PainelApp'].some(name => name.toLowerCase() === p.name.toLowerCase())}
                            title={['Home', 'Login', 'Dashboard', 'PainelAdm', 'PainelApp'].some(name => name.toLowerCase() === p.name.toLowerCase()) ? 'Página do sistema — não pode ser excluída' : 'Excluir página'}
                          >
                            🗑 Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!pages || pages.length === 0) && (
                      <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1rem', color: palette.textMuted }}>Nenhuma página encontrada</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="painel-card" style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Crescimento Mensal</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="painel-action-btn" onClick={() => {
                  const text = `Relatório de Acessos ADMAC\nData: ${new Date().toLocaleDateString()}\nStatus: Sistema em transição para Supabase.`;
                  const blob = new Blob([`<html><body><pre>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre></body></html>`], { type: 'application/msword' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'relatorio-acessos.doc'; a.click(); URL.revokeObjectURL(url);
                }}>Relatório (.doc)</button>
                <button className="painel-action-btn" onClick={() => {
                  const text = encodeURIComponent(`Relatório de Acessos ADMAC\nData: ${new Date().toLocaleDateString()}\nStatus: Sistema em transição para Supabase.`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}>WhatsApp</button>
                <button className="painel-action-btn" onClick={() => {
                  const text = encodeURIComponent(`Relatório de Acessos ADMAC\nData: ${new Date().toLocaleDateString()}\nStatus: Sistema em transição para Supabase.`);
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(location.origin)}&text=${text}`, '_blank');
                }}>Telegram</button>
              </div>
            </div>
            <div className="painel-chart">
              {bars.map((b, i) => (
                <div key={i} className="painel-bar" style={{ height: `${b.h}%` }} title={`${b.label}: ${b.h}`} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {bars.map((b, i) => <span key={i} style={{ flex: 1, fontSize: '.68rem', color: palette.textMuted, textAlign: 'center' }}>{b.label}</span>)}
            </div>
          </div>
          <div className="painel-card" style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Atividades Recentes</h3>
              <span>🔔</span>
            </div>
            <div className="painel-activity-list">
              {MOCK_ACTIVITIES.map((a, i) => (
                <div key={i} className="painel-activity-item">
                  <div className={`painel-activity-dot ${a.type}`} />
                  <div className="painel-activity-info">
                    <p>{a.text}</p>
                    <span>{a.detail}</span>
                  </div>
                  <div className="painel-activity-time">{a.time}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      );
    }

    if (activePage === 'mensagens') {
      return (
        <div className="painel-card">
          <div className="painel-table-bar">
            <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Mensagens & Testemunhos Recebidos Boris</h3>
            <button className="painel-action-btn" onClick={loadSiteMessages}>🔄 Atualizar</button>
          </div>

          {messagesLoading ? (
            <div style={{ color: palette.textMuted, padding: '1rem' }}>Carregando mensagens...</div>
          ) : (
            <div className="painel-table-wrap">
              <table className="painel-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Remetente</th>
                    <th>Categoria</th>
                    <th>Mensagem</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(siteMessages || []).map(m => (
                    <tr key={m.id}>
                      <td style={{ fontSize: '.75rem', whiteSpace: 'nowrap' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.name || 'Anônimo'}</div>
                        <div style={{ fontSize: '.7rem', color: palette.textMuted }}>{m.email}</div>
                      </td>
                      <td>
                        <span className="status-pill active" style={{ fontSize: '.65rem', textTransform: 'uppercase' }}>{m.category}</span>
                      </td>
                      <td style={{ maxWidth: 300, fontSize: '.8rem', lineHeight: 1.4 }}>{m.message}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {m.type === 'testimonial_submission' && (
                            <button className="btn-ver" onClick={() => approveTestimonial(m)} style={{ padding: '4px 8px' }}>✅ Aprovar Testemunho</button>
                          )}
                          <button className="btn-deletar" style={{ padding: '4px 8px' }} onClick={async () => {
                            if (currentUser?.role === 'Viewer') {
                              alert('Visualizadores não podem excluir mensagens.');
                              return;
                            }
                            if (window.confirm('Deseja realmente excluir esta mensagem?')) {
                              try {
                                const { error } = await supabase.from('site_messages').delete().eq('id', m.id);
                                if (error) throw error;
                                alert('Mensagem excluída com sucesso!');
                                loadSiteMessages();
                              } catch (err) {
                                console.error('Error deleting message:', err);
                                alert('Erro ao excluir mensagem.');
                              }
                            }
                          }}>🗑️ Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!siteMessages || siteMessages.length === 0) && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: palette.textMuted }}>Nenhuma mensagem encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )
          }
        </div >
      );
    }

    if (activePage === 'conteudo') {
      return (
        <div>
          <div className="painel-card" style={{ marginBottom: '1.2rem' }}>
            <div className="painel-table-bar">
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Editor de Conteúdo</h3>
              <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select className="pm-select" value={ministryId} onChange={e => {
                  setMinistryId(e.target.value);
                  setMinistryTab('geral');
                }}>
                  {ministryOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <button
                  className="painel-action-btn"
                  onClick={() => {
                    const label = ministryOptions.find(o => o.id === ministryId)?.label || ministryId;
                    if (window.confirm(`Deseja resetar todos os dados de "${label}" para o padrão original?`)) {
                      const defaultData = ministryId === 'home' ? INITIAL_HOME_DATA : INITIAL_MINISTRIES_DATA[ministryId];
                      if (defaultData) {
                        setMinistryData(defaultData);
                        if (ministryId === 'home') setHomeData(defaultData);
                      }
                    }
                  }}
                  style={{ borderColor: palette.danger, color: palette.danger }}
                >
                  Resetar Padrão
                </button>
                <button className="pm-add-btn" onClick={saveMinistry}>Salvar</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.8rem', flexWrap: 'wrap' }}>
              {(ministryId === 'home'
                ? ['geral', 'sliders', 'pastores', 'videos', 'mensagens', 'ministérios', 'programacao', 'atividades', 'cta', 'aniversariantes']
                : ministryId === 'midia'
                  ? ['geral', 'equipe', 'videos', 'mensagens', 'programacao', 'galeria', 'bastidores', 'noticias', 'testemunhos', 'aniversariantes']
                  : (ministryId === 'intercessao' || ministryId === 'missoes' || ministryId === 'social' || ministryId === 'retiro')
                    ? ['geral', 'equipe', 'programacao', 'galeria', 'testemunhos']
                    : ['geral', 'equipe', 'programacao', 'galeria', 'testemunhos', 'aniversariantes']
              ).map(t => (
                <button
                  key={t}
                  onClick={() => setMinistryTab(t)}
                  className="painel-action-btn"
                  style={{
                    borderColor: ministryTab === t ? palette.accent : palette.border,
                    color: ministryTab === t ? palette.accentLight : palette.textMuted,
                    background: ministryTab === t ? palette.accentGlow : 'transparent'
                  }}
                >
                  {t === 'geral' ? 'Geral'
                    : t === 'sliders' ? 'Sliders'
                      : t === 'pastores' ? 'Pastores'
                        : t === 'mensagens' ? 'Mensagens'
                          : t === 'ministérios' ? 'Ministérios'
                            : t === 'equipe' ? 'Equipe'
                              : t === 'programacao' ? 'Programação'
                                : t === 'atividades' ? 'Atividades'
                                  : t === 'cta' ? 'CTA'
                                    : t === 'galeria' ? 'Galeria'
                                      : t === 'aniversariantes' ? 'Aniversariantes'
                                        : t === 'bastidores' ? 'Bastidores'
                                          : t === 'noticias' ? 'Notícias'
                                            : t === 'videos' ? 'Vídeos'
                                              : 'Testemunhos'}
                </button>
              ))}
            </div>
            {ministryLoading && (
              <div style={{ color: palette.textMuted }}>Carregando...</div>
            )}
            {!ministryLoading && ministryData && (
              <div className="pm-body" style={{ padding: 0 }}>
                {ministryTab === 'geral' && (
                  <div style={{ padding: '1.2rem' }}>
                    {ministryId === 'home' ? (
                      <>
                        <div className="pm-field">
                          <label>Título de Boas‑vindas</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={ministryData?.welcome?.title || ''}
                              onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, title: e.target.value } }))}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Texto 1</label>
                          <textarea
                            value={ministryData?.welcome?.text1 || ''}
                            onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, text1: e.target.value } }))}
                            style={{ width: '100%', height: 100, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Texto 2</label>
                          <textarea
                            value={ministryData?.welcome?.text2 || ''}
                            onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, text2: e.target.value } }))}
                            style={{ width: '100%', height: 100, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Texto do Botão (Home)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🏷️</span>
                            <input
                              className="pm-input"
                              value={ministryData?.welcome?.buttonText || ''}
                              onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, buttonText: e.target.value } }))}
                              placeholder="Ex: Entre em Contato"
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Link do Botão (Home)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🔗</span>
                            <input
                              className="pm-input"
                              value={ministryData?.welcome?.buttonLink || ''}
                              onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, buttonLink: e.target.value } }))}
                              placeholder="Ex: /contato"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="pm-field">
                          <label>Título Principal</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={ministryData?.hero?.title || ''}
                              onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, title: e.target.value } }))}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Subtítulo</label>
                          <textarea
                            value={ministryData?.hero?.subtitle || ''}
                            onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, subtitle: e.target.value } }))}
                            style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Versículo em Destaque (opcional)</label>
                          <textarea
                            value={ministryData?.hero?.verse || ''}
                            onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, verse: e.target.value } }))}
                            style={{ width: '100%', height: 70, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>URL de Vídeo (opcional)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">▶</span>
                            <input
                              className="pm-input"
                              value={ministryData?.hero?.videoUrl || ''}
                              onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, videoUrl: e.target.value } }))}
                              placeholder="Link do YouTube (embed)"
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Imagem de Fundo</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={ministryData?.hero?.image || ''}
                                onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, image: e.target.value } }))}
                                placeholder="URL da imagem"
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(base64 => {
                                setMinistryData(d => ({ ...d, hero: { ...d.hero, image: base64 } }));
                              })}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Título da Seção</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📌</span>
                            <input
                              className="pm-input"
                              value={ministryData?.mission?.title || ''}
                              onChange={e => setMinistryData(d => ({ ...d, mission: { ...d.mission, title: e.target.value } }))}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Texto Descritivo</label>
                          <textarea
                            value={ministryData?.mission?.text || ''}
                            onChange={e => setMinistryData(d => ({ ...d, mission: { ...d.mission, text: e.target.value } }))}
                            style={{ width: '100%', height: 140, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        {ministryId === 'ebd' && (
                          <>
                            <div className="pm-field">
                              <label>Horário da EBD</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">⏰</span>
                                <input
                                  className="pm-input"
                                  value={ministryData?.info?.time || ''}
                                  onChange={e => setMinistryData(d => ({ ...d, info: { ...(d.info || {}), time: e.target.value } }))}
                                  placeholder="Ex: Domingos, 9h"
                                />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Local da EBD</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">📍</span>
                                <input
                                  className="pm-input"
                                  value={ministryData?.info?.location || ''}
                                  onChange={e => setMinistryData(d => ({ ...d, info: { ...(d.info || {}), location: e.target.value } }))}
                                  placeholder="Ex: ADMAC - Sala 1"
                                />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Público Alvo</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">👥</span>
                                <input
                                  className="pm-input"
                                  value={ministryData?.info?.audience || ''}
                                  onChange={e => setMinistryData(d => ({ ...d, info: { ...(d.info || {}), audience: e.target.value } }))}
                                  placeholder="Ex: Todas as idades"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
                {ministryTab === 'sliders' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.carousel || []).map((s, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={s.image || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  const next = [...(ministryData.carousel || [])];
                                  next[idx] = { ...next[idx], image: val };
                                  setMinistryData(d => ({ ...d, carousel: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(base64 => {
                                const next = [...(ministryData.carousel || [])];
                                next[idx] = { ...next[idx], image: base64 };
                                setMinistryData(d => ({ ...d, carousel: next }));
                              })}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {s.image ? <img src={transformImageLink(s.image)} alt="" style={{ width: 100, height: 60, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /> : null}
                        <div className="pm-field">
                          <label>Título</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={s.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.carousel || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, carousel: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Subtítulo</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📝</span>
                            <input
                              className="pm-input"
                              value={s.subtitle || ''}
                              onChange={e => {
                                const next = [...(ministryData.carousel || [])];
                                next[idx] = { ...next[idx], subtitle: e.target.value };
                                setMinistryData(d => ({ ...d, carousel: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.carousel || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, carousel: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, carousel: [...(d.carousel || []), { image: '', title: '', subtitle: '' }] }))}
                    >
                      + Adicionar Slider
                    </button>
                  </div>
                )}
                {ministryTab === 'pastores' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.pastors || []).map((p, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Nome</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">👤</span>
                            <input
                              className="pm-input"
                              value={p.name || ''}
                              onChange={e => {
                                const next = [...(ministryData.pastors || [])];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setMinistryData(d => ({ ...d, pastors: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Cargo/Título</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">💼</span>
                            <input
                              className="pm-input"
                              value={p.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.pastors || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, pastors: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={p.image || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  const next = [...(ministryData.pastors || [])];
                                  next[idx] = { ...next[idx], image: val };
                                  setMinistryData(d => ({ ...d, pastors: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(base64 => {
                                const next = [...(ministryData.pastors || [])];
                                next[idx] = { ...next[idx], image: base64 };
                                setMinistryData(d => ({ ...d, pastors: next }));
                              })}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {p.image ? <img src={transformImageLink(p.image)} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /> : null}
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Versículo/Mensagem</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📖</span>
                            <input
                              className="pm-input"
                              value={p.verse || ''}
                              onChange={e => {
                                const next = [...(ministryData.pastors || [])];
                                next[idx] = { ...next[idx], verse: e.target.value };
                                setMinistryData(d => ({ ...d, pastors: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.pastors || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, pastors: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, pastors: [...(d.pastors || []), { name: '', title: '', image: '', verse: '' }] }))}
                    >
                      + Adicionar Pastor
                    </button>
                  </div>
                )}
                {ministryTab === 'ministérios' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.ministries || []).map((m, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Título</label>
                          <input
                            className="pm-input"
                            value={m.title || ''}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Link</label>
                          <input
                            className="pm-input"
                            value={m.link || ''}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], link: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Ícone (Emoji)</label>
                          <input
                            className="pm-input"
                            value={m.icon || ''}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], icon: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Cor (Hex)</label>
                          <input
                            className="pm-input"
                            type="color"
                            value={m.color || '#6c63ff'}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], color: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                            style={{ height: 40, padding: 2 }}
                          />
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Descrição Curta</label>
                          <input
                            className="pm-input"
                            value={m.description || ''}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], description: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          />
                        </div>
                        <div className="pm-field">
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.ministries || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, ministries: [...(d.ministries || []), { title: '', description: '', link: '', icon: '⛪', color: '#6c63ff' }] }))}
                    >
                      + Adicionar Ministério à Home
                    </button>
                  </div>
                )}
                {ministryTab === 'mensagens' && (
                  <div style={{ padding: '1.2rem' }}>
                    {ministryId === 'midia' ? (
                      <>
                        <div className="pm-field">
                          <label>Título da Live / Vídeo</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={ministryData?.live?.title || ''}
                              onChange={e => setMinistryData(d => ({ ...d, live: { ...(d.live || {}), title: e.target.value } }))}
                              placeholder="Ex: Culto Ao Vivo"
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>URL do YouTube (Embed)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">▶</span>
                              <input
                                className="pm-input"
                                value={ministryData?.live?.url || ''}
                                onChange={e => {
                                  let val = (e.target.value || '').trim();
                                  val = val.replace(/^['"`]+|['"`]+$/g, '');
                                  const m = val.match(/src=["'`](.+?)["'`]/i);
                                  if (m && m[1]) val = m[1];
                                  if (!val.includes('/embed/')) {
                                    if (val.includes('watch?v=')) {
                                      const vidId = (val.match(/[?&]v=([a-zA-Z0-9_-]+)/) || [])[1];
                                      if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                    } else if (val.includes('youtu.be/')) {
                                      const vidId = (val.match(/youtu\.be\/([a-zA-Z0-9_-]+)/) || [])[1];
                                      if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                    } else if (val.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/)) {
                                      const vidId = (val.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/) || [])[1];
                                      if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                    } else if (val.includes('youtube.com/live')) {
                                      const vidId = (val.match(/[?&]v=([a-zA-Z0-9_-]+)/) || [])[1];
                                      if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                    }
                                  }
                                  setMinistryData(d => ({ ...d, live: { ...(d.live || {}), url: val } }));
                                }}
                                placeholder="Ex: https://www.youtube.com/embed/..."
                              />
                            </div>
                            {ministryData?.live?.url && (
                              <button
                                type="button"
                                onClick={() => setMinistryData(d => ({ ...d, live: { ...(d.live || {}), url: '' } }))}
                                title="Limpar URL"
                                style={{ background: 'rgba(244,63,94,.15)', border: '1px solid rgba(244,63,94,.3)', color: '#f43f5e', borderRadius: 8, padding: '0 12px', fontSize: '1rem', cursor: 'pointer', whiteSpace: 'nowrap', height: 38 }}
                              >
                                × Limpar
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: '.75rem', color: palette.textMuted, marginTop: 4 }}>
                            Cole qualquer link do YouTube: watch?v=, youtu.be/, youtube.com/live/ ou embed/
                          </div>
                        </div>
                        {ministryData?.live?.url && !ministryData.live.url.includes('UCxxxxxxxxxxxx') && !ministryData.live.url.includes('live_stream?channel') && (
                          <div style={{ marginTop: '1rem', borderRadius: 10, overflow: 'hidden', border: `1px solid ${palette.border}` }}>
                            <iframe
                              src={ministryData.live.url}
                              title={ministryData?.live?.title || 'Preview'}
                              width="100%"
                              height="250"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="pm-field">
                          <label>URL do Spotify (Embed)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🎧</span>
                            <input
                              className="pm-input"
                              value={ministryData?.spotifyUrl || ''}
                              onChange={e => setMinistryData(d => ({ ...d, spotifyUrl: e.target.value }))}
                              placeholder="Ex: https://open.spotify.com/embed/episode/..."
                            />
                          </div>
                        </div>
                        {ministryData?.spotifyUrl && (
                          <iframe
                            data-testid="embed-iframe"
                            style={{ borderRadius: "12px" }}
                            src={ministryData.spotifyUrl}
                            width="100%"
                            height="352"
                            frameBorder="0"
                            allowFullScreen=""
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                          ></iframe>
                        )}
                      </>
                    )}
                  </div>
                )}
                {ministryTab === 'equipe' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.team || []).map((m, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Nome</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">👤</span>
                            <input
                              className="pm-input"
                              value={m.name || ''}
                              onChange={e => {
                                const next = [...(ministryData.team || [])];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setMinistryData(d => ({ ...d, team: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Cargo</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">💼</span>
                            <input
                              className="pm-input"
                              value={m.role || ''}
                              onChange={e => {
                                const next = [...(ministryData.team || [])];
                                next[idx] = { ...next[idx], role: e.target.value };
                                setMinistryData(d => ({ ...d, team: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Foto (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={m.photo || ''}
                                onChange={e => {
                                  const val = transformImageLink(e.target.value);
                                  const next = [...(ministryData.team || [])];
                                  next[idx] = { ...next[idx], photo: val };
                                  setMinistryData(d => ({ ...d, team: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(base64 => {
                                const next = [...(ministryData.team || [])];
                                next[idx] = { ...next[idx], photo: base64 };
                                setMinistryData(d => ({ ...d, team: next }));
                              })}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {m.photo ? <img src={transformImageLink(m.photo)} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /> : null}
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.team || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, team: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, team: [...(d.team || []), { name: '', role: '', photo: '' }] }))}
                    >
                      + Adicionar Membro
                    </button>
                  </div>
                )}
                {ministryTab === 'aniversariantes' && (
                  <div style={{ padding: '1.2rem' }}>
                    {ministryId === 'home' ? (() => {
                      const MINISTRY_OPTIONS = [
                        { value: 'kids', label: 'Kids' },
                        { value: 'louvor', label: 'Louvor' },
                        { value: 'jovens', label: 'Jovens' },
                        { value: 'mulheres', label: 'Mulheres' },
                        { value: 'homens', label: 'Homens' },
                        { value: 'lares', label: 'Lares' },
                        { value: 'retiro', label: 'Retiro' },
                      ];
                      return (
                        <HomeAnivEditor
                          palette={palette}
                          ministryOptions={MINISTRY_OPTIONS}
                        />
                      );
                    })() : (
                      <>
                        <div className="pm-field">
                          <label>Título da Seção</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🎉</span>
                            <input className="pm-input" value={ministryData?.birthdays?.title || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), title: e.target.value } }))} placeholder="Ex: Aniversariantes do Mês" />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Texto Descritivo</label>
                          <textarea value={ministryData?.birthdays?.text || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), text: e.target.value } }))} style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                        </div>
                        <div className="pm-field">
                          <label>Link do Vídeo (YouTube)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">▶</span>
                              <input className="pm-input" placeholder="https://www.youtube.com/watch?v=..." value={ministryData?.birthdays?.videoUrl || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), videoUrl: e.target.value } }))} />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(base64 => {
                                setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), videoUrl: base64 } }));
                              })}
                            >
                              Subir Capa
                            </button>
                          </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', marginBottom: '0.8rem', fontWeight: 600, fontSize: '.9rem', color: palette.text }}>👥 Lista de Aniversariantes</div>
                        {(ministryData?.birthdays?.people || []).map((p, idx) => (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem', padding: '1rem', background: palette.surfaceHover, borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                              <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${palette.accent}`, flexShrink: 0, background: palette.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                {p.photo ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                              </div>
                              <label style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: palette.accentGlow, color: palette.accentLight, borderRadius: '6px', border: `1px solid ${palette.accent}` }}>
                                Trocar Foto
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = ev => {
                                    const next = [...(ministryData?.birthdays?.people || [])];
                                    next[idx] = { ...next[idx], photo: ev.target.result };
                                    setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                  };
                                  reader.readAsDataURL(file);
                                }} />
                              </label>
                            </div>
                            <div className="pm-field">
                              <label>Nome</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">👤</span>
                                <input className="pm-input" value={p.name || ''} onChange={e => {
                                  const next = [...(ministryData?.birthdays?.people || [])];
                                  next[idx] = { ...next[idx], name: e.target.value };
                                  setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                }} />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Data (ex: 15/05)</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">📅</span>
                                <input className="pm-input" placeholder="DD/MM" value={p.date || ''} onChange={e => {
                                  const next = [...(ministryData?.birthdays?.people || [])];
                                  next[idx] = { ...next[idx], date: e.target.value };
                                  setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                }} />
                              </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                className="btn-deletar"
                                onClick={() => {
                                  if (currentUser?.role === 'Viewer') {
                                    alert('Visualizadores não podem excluir dados.');
                                    return;
                                  }
                                  const next = [...(ministryData?.birthdays?.people || [])];
                                  next.splice(idx, 1);
                                  setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                }}
                                disabled={currentUser?.role === 'Viewer'}
                                style={currentUser?.role === 'Viewer' ? { opacity: .5, cursor: 'not-allowed' } : {}}
                              >Excluir</button>
                            </div>
                          </div>
                        ))}
                        <button className="pm-add-btn" onClick={() => setMinistryData(d => ({
                          ...d,
                          birthdays: { ...(d.birthdays || {}), people: [...(d.birthdays?.people || []), { name: '', date: '', photo: '' }] }
                        }))}>
                          + Adicionar Aniversariante
                        </button>
                      </>
                    )}
                  </div>
                )}
                {ministryTab === 'programacao' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.schedule || []).map((s, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        {ministryId === 'home' ? (
                          <>
                            <div className="pm-field">
                              <label>Dia</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">🗓</span>
                                <input
                                  className="pm-input"
                                  value={s.day || ''}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    next[idx] = { ...next[idx], day: e.target.value };
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Hora</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">⏰</span>
                                <input
                                  className="pm-input"
                                  value={s.time || ''}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    next[idx] = { ...next[idx], time: e.target.value };
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                            <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                              <label>Evento</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">📌</span>
                                <input
                                  className="pm-input"
                                  value={s.event || ''}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    next[idx] = { ...next[idx], event: e.target.value };
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="pm-field">
                              <label>{ministryId === 'ebd' ? 'Classe' : 'Atividade'}</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">📌</span>
                                <input
                                  className="pm-input"
                                  value={ministryId === 'ebd' ? (s.class || s.title || '') : (s.activity || s.title || '')}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    if (ministryId === 'ebd') {
                                      next[idx] = { ...next[idx], class: e.target.value };
                                    } else {
                                      next[idx] = { ...next[idx], activity: e.target.value };
                                    }
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>{ministryId === 'ebd' ? 'Professor(a)' : 'Dia'}</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">{ministryId === 'ebd' ? '👤' : '🗓'}</span>
                                <input
                                  className="pm-input"
                                  value={ministryId === 'ebd' ? (s.teacher || '') : (s.day || s.date || '')}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    if (ministryId === 'ebd') {
                                      next[idx] = { ...next[idx], teacher: e.target.value };
                                    } else {
                                      next[idx] = { ...next[idx], day: e.target.value };
                                    }
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                            {ministryId === 'ebd' ? (
                              <div className="pm-field">
                                <label>Sala</label>
                                <div className="pm-field-wrap">
                                  <span className="pm-icon">🚪</span>
                                  <input
                                    className="pm-input"
                                    value={s.room || s.location || ''}
                                    onChange={e => {
                                      const next = [...(ministryData.schedule || [])];
                                      next[idx] = { ...next[idx], room: e.target.value };
                                      setMinistryData(d => ({ ...d, schedule: next }));
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="pm-field">
                                  <label>Hora</label>
                                  <div className="pm-field-wrap">
                                    <span className="pm-icon">⏰</span>
                                    <input
                                      className="pm-input"
                                      value={s.time || ''}
                                      onChange={e => {
                                        const next = [...(ministryData.schedule || [])];
                                        next[idx] = { ...next[idx], time: e.target.value };
                                        setMinistryData(d => ({ ...d, schedule: next }));
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="pm-field">
                                  <label>Local</label>
                                  <div className="pm-field-wrap">
                                    <span className="pm-icon">📍</span>
                                    <input
                                      className="pm-input"
                                      value={s.location || ''}
                                      onChange={e => {
                                        const next = [...(ministryData.schedule || [])];
                                        next[idx] = { ...next[idx], location: e.target.value };
                                        setMinistryData(d => ({ ...d, schedule: next }));
                                      }}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                              <label>Descrição</label>
                              <textarea
                                value={s.description || ''}
                                onChange={e => {
                                  const next = [...(ministryData.schedule || [])];
                                  next[idx] = { ...next[idx], description: e.target.value };
                                  setMinistryData(d => ({ ...d, schedule: next }));
                                }}
                                style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                              />
                            </div>
                          </>
                        )}
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.schedule || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, schedule: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({
                        ...d,
                        schedule: [...(d.schedule || []), (ministryId === 'home' ? { day: '', time: '', event: '' } : { activity: '', day: '', time: '', location: '', description: '' })]
                      }))}
                    >
                      + Adicionar Item
                    </button>
                  </div>
                )}
                {ministryTab === 'videos' && (
                  <div style={{ padding: '1.2rem' }}>
                    <div style={{ marginBottom: '1.2rem', color: palette.textMuted, fontSize: '.85rem' }}>
                      Adicione vídeos do YouTube para exibição na galeria {ministryId === 'home' ? 'da página inicial' : 'deste ministério'}.
                    </div>
                    {((ministryId === 'home' ? homeVideos : ministryData?.videos) || []).map((v, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${palette.border}` }}>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Título do Vídeo</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={v.title || ''}
                              onChange={e => {
                                if (ministryId === 'home') {
                                  const next = [...(homeVideos || [])];
                                  next[idx] = { ...next[idx], title: e.target.value };
                                  setHomeVideos(next);
                                } else {
                                  const next = [...(ministryData.videos || [])];
                                  next[idx] = { ...next[idx], title: e.target.value };
                                  setMinistryData(d => ({ ...d, videos: next }));
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>URL do YouTube (Embed)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">▶</span>
                            <input
                              className="pm-input"
                              value={v.url || ''}
                              onChange={e => {
                                let val = (e.target.value || '').trim();
                                if (!val.includes('/embed/')) {
                                  const wMatch = val.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                                  const yMatch = val.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                                  const lMatch = val.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
                                  const vidId = (wMatch || yMatch || lMatch || [])[1];
                                  if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                }

                                if (ministryId === 'home') {
                                  const next = [...(homeVideos || [])];
                                  next[idx] = { ...next[idx], url: val };
                                  setHomeVideos(next);
                                } else {
                                  const next = [...(ministryData.videos || [])];
                                  next[idx] = { ...next[idx], url: val };
                                  setMinistryData(d => ({ ...d, videos: next }));
                                }
                              }}
                              placeholder="https://www.youtube.com/embed/..."
                            />
                          </div>
                        </div>
                        {/* Campo de thumbnail removido intencionalmente para evitar travamentos */}
                        <div className="pm-field">
                          <label>Data/Texto Auxiliar</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📅</span>
                            <input
                              className="pm-input"
                              value={v.date || ''}
                              onChange={e => {
                                if (ministryId === 'home') {
                                  const next = [...(homeVideos || [])];
                                  next[idx] = { ...next[idx], date: e.target.value };
                                  setHomeVideos(next);
                                } else {
                                  const next = [...(ministryData.videos || [])];
                                  next[idx] = { ...next[idx], date: e.target.value };
                                  setMinistryData(d => ({ ...d, videos: next }));
                                }
                              }}
                              placeholder="Ex: 2 horas atrás"
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Visualizações (Simulado)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">👁</span>
                            <input
                              className="pm-input"
                              value={v.views || ''}
                              onChange={e => {
                                if (ministryId === 'home') {
                                  const next = [...(homeVideos || [])];
                                  next[idx] = { ...next[idx], views: e.target.value };
                                  setHomeVideos(next);
                                } else {
                                  const next = [...(ministryData.videos || [])];
                                  next[idx] = { ...next[idx], views: e.target.value };
                                  setMinistryData(d => ({ ...d, videos: next }));
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              if (ministryId === 'home') {
                                const next = [...(homeVideos || [])];
                                next.splice(idx, 1);
                                setHomeVideos(next);
                              } else {
                                const next = [...(ministryData.videos || [])];
                                next.splice(idx, 1);
                                setMinistryData(d => ({ ...d, videos: next }));
                              }
                            }}
                          >
                            Remover Vídeo
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => {
                        const newVid = { title: '', url: '', date: 'Recente', views: '0' };
                        if (ministryId === 'home') {
                          setHomeVideos(v => [...(v || []), newVid]);
                        } else {
                          setMinistryData(d => ({ ...d, videos: [...(d.videos || []), newVid] }));
                        }
                      }}
                    >
                      + Adicionar Novo Vídeo
                    </button>
                  </div>
                )}
                {ministryTab === 'atividades' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.activities || []).map((a, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Título</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={a.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.activities || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, activities: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Data</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🗓</span>
                            <input
                              className="pm-input"
                              value={a.date || ''}
                              onChange={e => {
                                const next = [...(ministryData.activities || [])];
                                next[idx] = { ...next[idx], date: e.target.value };
                                setMinistryData(d => ({ ...d, activities: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Descrição</label>
                          <textarea
                            value={a.description || ''}
                            onChange={e => {
                              const next = [...(ministryData.activities || [])];
                              next[idx] = { ...next[idx], description: e.target.value };
                              setMinistryData(d => ({ ...d, activities: next }));
                            }}
                            style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={a.image || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  const next = [...(ministryData.activities || [])];
                                  next[idx] = { ...next[idx], image: val };
                                  setMinistryData(d => ({ ...d, activities: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(base64 => {
                                const next = [...(ministryData.activities || [])];
                                next[idx] = { ...next[idx], image: base64 };
                                setMinistryData(d => ({ ...d, activities: next }));
                              })}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {a.image ? <div style={{ marginBottom: '.5rem' }}><img src={transformImageLink(a.image)} alt="" style={{ width: 100, height: 60, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /></div> : null}
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.activities || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, activities: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, activities: [...(d.activities || []), { title: '', date: '', description: '', image: '' }] }))}
                    >
                      + Adicionar Atividade
                    </button>
                  </div>
                )}
                {ministryTab === 'cta' && (
                  <div style={{ padding: '1.2rem' }}>
                    <div className="pm-field">
                      <label>Título do CTA</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">✏️</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.title || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, title: e.target.value } }))}
                          placeholder="Ex: Faça Parte da Nossa Família"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Subtítulo do CTA</label>
                      <textarea
                        value={ministryData?.cta?.subtitle || ''}
                        onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, subtitle: e.target.value } }))}
                        placeholder="Ex: Venha nos visitar e experimente o amor de Deus em nossa comunidade"
                        style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                      />
                    </div>
                    <div className="pm-field">
                      <label>Texto do Botão Primário</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🏷️</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.primaryBtn || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, primaryBtn: e.target.value } }))}
                          placeholder="Ex: Quero Visitar"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Link do Botão Primário</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🔗</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.primaryLink || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, primaryLink: e.target.value } }))}
                          placeholder="Ex: /contato"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Texto do Botão Secundário</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🏷️</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.secondaryBtn || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, secondaryBtn: e.target.value } }))}
                          placeholder="Ex: Ligar Agora"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Link do Botão Secundário</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🔗</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.secondaryLink || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, secondaryLink: e.target.value } }))}
                          placeholder="Ex: tel:+5561999999999"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {ministryTab === 'galeria' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.gallery || []).map((g, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={g.url || ''}
                                onChange={e => {
                                  const val = transformImageLink(e.target.value);
                                  const next = [...(ministryData.gallery || [])];
                                  next[idx] = { ...next[idx], url: val };
                                  setMinistryData(d => ({ ...d, gallery: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(base64 => {
                                const next = [...(ministryData.gallery || [])];
                                next[idx] = { ...next[idx], url: base64 };
                                setMinistryData(d => ({ ...d, gallery: next }));
                              })}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {g.url ? <img src={transformImageLink(g.url)} alt="" style={{ width: 100, height: 60, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /> : null}
                        <div className="pm-field">
                          <label>Legenda</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={g.caption || ''}
                              onChange={e => {
                                const next = [...(ministryData.gallery || [])];
                                next[idx] = { ...next[idx], caption: e.target.value };
                                setMinistryData(d => ({ ...d, gallery: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.gallery || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, gallery: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, gallery: [...(d.gallery || []), { url: '', caption: '' }] }))}
                    >
                      + Adicionar Foto
                    </button>
                  </div>
                )}
                {ministryTab === 'testemunhos' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.testimonials || []).map((t, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Nome</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">👤</span>
                            <input
                              className="pm-input"
                              value={t.name || ''}
                              onChange={e => {
                                const next = [...(ministryData.testimonials || [])];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setMinistryData(d => ({ ...d, testimonials: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Idade (opcional)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">#</span>
                            <input
                              className="pm-input"
                              value={t.age || ''}
                              onChange={e => {
                                const next = [...(ministryData.testimonials || [])];
                                next[idx] = { ...next[idx], age: e.target.value };
                                setMinistryData(d => ({ ...d, testimonials: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Texto</label>
                          <textarea
                            value={t.text || ''}
                            onChange={e => {
                              const next = [...(ministryData.testimonials || [])];
                              next[idx] = { ...next[idx], text: e.target.value };
                              setMinistryData(d => ({ ...d, testimonials: next }));
                            }}
                            style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Foto (URL)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🖼</span>
                            <input
                              className="pm-input"
                              value={t.photo || ''}
                              onChange={e => {
                                const next = [...(ministryData.testimonials || [])];
                                next[idx] = { ...next[idx], photo: e.target.value };
                                setMinistryData(d => ({ ...d, testimonials: next }));
                              }}
                            />
                          </div>
                        </div>
                        {t.photo ? <img src={transformImageLink(t.photo)} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${palette.border}` }} /> : null}
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.testimonials || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, testimonials: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, testimonials: [...(d.testimonials || []), { name: '', text: '', photo: '' }] }))}
                    >
                      + Adicionar Testemunho
                    </button>
                  </div>
                )}
                {ministryTab === 'bastidores' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.backstage || []).map((b, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Título</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={b.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.backstage || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, backstage: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Texto descritivo</label>
                          <textarea
                            value={b.text || ''}
                            onChange={e => {
                              const next = [...(ministryData.backstage || [])];
                              next[idx] = { ...next[idx], text: e.target.value };
                              setMinistryData(d => ({ ...d, backstage: next }));
                            }}
                            style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🖼</span>
                            <input
                              className="pm-input"
                              value={b.image || ''}
                              onChange={e => {
                                const next = [...(ministryData.backstage || [])];
                                next[idx] = { ...next[idx], image: e.target.value };
                                setMinistryData(d => ({ ...d, backstage: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Layout</label>
                          <select
                            className="pm-input"
                            value={b.layout || 'left'}
                            onChange={e => {
                              const next = [...(ministryData.backstage || [])];
                              next[idx] = { ...next[idx], layout: e.target.value };
                              setMinistryData(d => ({ ...d, backstage: next }));
                            }}
                            style={{ background: palette.bg, color: palette.text, border: `1px solid ${palette.border}` }}
                          >
                            <option value="left">Imagem Esquerda</option>
                            <option value="right">Imagem Direita</option>
                          </select>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.backstage || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, backstage: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, backstage: [...(d.backstage || []), { title: '', text: '', image: '', layout: 'left' }] }))}
                    >
                      + Adicionar Item Bastidores
                    </button>
                  </div>
                )}
                {ministryTab === 'noticias' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.news || []).map((n, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Título da Notícia</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📰</span>
                            <input
                              className="pm-input"
                              value={n.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.news || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, news: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Data</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📅</span>
                            <input
                              className="pm-input"
                              value={n.date || ''}
                              onChange={e => {
                                const next = [...(ministryData.news || [])];
                                next[idx] = { ...next[idx], date: e.target.value };
                                setMinistryData(d => ({ ...d, news: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Resumo</label>
                          <textarea
                            value={n.summary || ''}
                            onChange={e => {
                              const next = [...(ministryData.news || [])];
                              next[idx] = { ...next[idx], summary: e.target.value };
                              setMinistryData(d => ({ ...d, news: next }));
                            }}
                            style={{ width: '100%', height: 60, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🖼</span>
                            <input
                              className="pm-input"
                              value={n.image || ''}
                              onChange={e => {
                                const next = [...(ministryData.news || [])];
                                next[idx] = { ...next[idx], image: e.target.value };
                                setMinistryData(d => ({ ...d, news: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.news || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, news: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, news: [...(d.news || []), { title: '', summary: '', image: '', date: '' }] }))}
                    >
                      + Adicionar Notícia
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    if (activePage === 'membros') {
      return (
        <div>
          <div className="painel-card" style={{ marginBottom: '1.2rem' }}>
            <div className="painel-table-bar">
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Lista de Membros</h3>
              <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="painel-search-wrap">
                  <span>🔍</span>
                  <input className="painel-search" placeholder="Buscar por nome, e-mail ou local (cidade/estado/país)..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="painel-filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="pending">Pendentes</option>
                  <option value="inactive">Inativos</option>
                </select>
                <button className="pm-add-btn" onClick={openCreateUser} title="Novo Membro">
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Novo Membro
                </button>
              </div>
            </div>
            <div className="painel-table-wrap">
              <table className="painel-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Desde</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="user-avatar-sm" style={{ marginRight: 12 }}>
                            {u.photo ? <img src={u.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (u.name || 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                            {u.location && <div style={{ fontSize: '.72rem', color: palette.textMuted }}>📍 {u.location}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <span className={`status-pill ${u.status}`}>
                          <span className="status-dot" /> {u.status}
                        </span>
                      </td>
                      <td>{u.since}</td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-ver" onClick={() => openViewUser(u)}>👁 Ver</button>
                        <button className="btn-editar" onClick={() => openEditUser(u)}>✏️ Editar</button>
                        <button
                          className="btn-deletar"
                          onClick={() => deleteUser(u.id)}
                          disabled={currentUser?.role !== 'Administrador' || u.id === currentUser?.id || u.id === 'offline-admin'}
                          style={(currentUser?.role !== 'Administrador' || u.id === currentUser?.id || u.id === 'offline-admin') ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          title={u.id === currentUser?.id ? 'Você não pode excluir a si mesmo' : currentUser?.role !== 'Administrador' ? 'Apenas administradores podem excluir usuários' : 'Excluir usuário'}
                        >
                          🗑 Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: '#7c82a0', padding: '1rem' }}>
                        Nenhum membro encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    if (activePage === 'paginas') {
      return (
        <div>
          <div className="painel-card" style={{ marginBottom: '1.2rem' }}>
            <div className="painel-table-bar">
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Páginas</h3>
              <button className="pm-add-btn" onClick={openCreatePage}><span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Nova Página</button>
            </div>
            <div className="painel-table-wrap">
              <table className="painel-table">
                <thead>
                  <tr>
                    <th>Página</th>
                    <th>Arquivo</th>
                    <th style={{ width: '100px' }}>Editar</th>
                    <th style={{ width: '80px' }}>Status</th>
                    <th style={{ width: '100px' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pagesLoading && (
                    <tr><td colSpan="5" style={{ padding: '1rem', color: '#7c82a0' }}>Carregando...</td></tr>
                  )}
                  {!pagesLoading && pages.map(p => {
                    const protectedPages = ['Home', 'Login', 'Dashboard', 'PainelAdm', 'PainelApp'];
                    const isProtected = protectedPages.some(name => name.toLowerCase() === p.name.toLowerCase());

                    return (
                      <tr key={p.file}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="user-avatar-sm" style={{ width: 40, height: 40, borderRadius: 8 }}>
                              {p.photo ? <img src={transformImageLink(p.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '📄'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '.8rem', color: palette.textMuted }}>{p.file}</span>
                        </td>
                        <td>
                          <button className="btn-editar" onClick={() => openEditPage(p.name)}>✏️ Editar</button>
                        </td>
                        <td>
                          <div
                            onClick={() => togglePageStatus(p.name, p.active)}
                            style={{
                              width: 44,
                              height: 22,
                              borderRadius: 11,
                              background: p.active ? palette.success : palette.warning,
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'background .3s',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0 4px'
                            }}
                            title={p.active ? 'Página Ativa' : 'Em Manutenção'}
                          >
                            <div style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              background: '#fff',
                              transform: p.active ? 'translateX(22px)' : 'translateX(0)',
                              transition: 'transform .3s'
                            }} />
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn-deletar"
                            onClick={() => deletePage(p.name)}
                            disabled={isProtected || currentUser?.role === 'Viewer'}
                            title={isProtected ? 'Página do sistema — não pode ser excluída' : currentUser?.role === 'Viewer' ? 'Seu perfil não tem permissão para excluir' : 'Excluir página'}
                            style={isProtected || currentUser?.role === 'Viewer' ? { opacity: .5, cursor: 'not-allowed' } : undefined}
                          >
                            🗑 Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!pagesLoading && pages.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '1rem', color: '#7c82a0', textAlign: 'center' }}>Nenhuma página encontrada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }
    if (activePage === 'relatorios') {
      let people = [];
      let reportText = 'Relatório de Acessos — Sistema em transição.';
      return (
        <div>
          <div className="painel-card" style={{ marginBottom: '1.2rem' }}>
            <div className="painel-table-bar">
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Relatórios de Acesso</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="painel-action-btn"
                  onClick={() => {
                    const html = buildAccessReportHTML(30);
                    const blob = new Blob([html], { type: 'application/msword' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'relatorio-acessos.doc'; a.click(); URL.revokeObjectURL(url);
                  }}
                >
                  Relatório (.doc)
                </button>
                <button
                  className="painel-action-btn"
                  onClick={() => {
                    const html = buildAccessReportHTML(30);
                    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'relatorio-acessos.xls'; a.click(); URL.revokeObjectURL(url);
                  }}
                >
                  Excel (.xls)
                </button>
                <button
                  className="painel-action-btn"
                  onClick={() => {
                    const html = buildAccessReportHTML(30);
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.open();
                      win.document.write(html);
                      win.document.close();
                      try { win.focus(); win.print(); } catch { void 0 }
                    }
                  }}
                >
                  PDF (imprimir)
                </button>
                <button
                  className="painel-action-btn"
                  onClick={() => {
                    const text = encodeURIComponent(reportText);
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                >
                  WhatsApp
                </button>
                <button
                  className="painel-action-btn"
                  onClick={() => {
                    const text = encodeURIComponent(reportText);
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(location.origin)}&text=${text}`, '_blank');
                  }}
                >
                  Telegram
                </button>
              </div>
            </div>
            <div className="painel-table-wrap">
              <table className="painel-table">
                <thead>
                  <tr>
                    <th>Pessoa</th>
                    <th>E-mail</th>
                    <th>Visitas</th>
                    <th>Sessões</th>
                    <th>Páginas únicas</th>
                    <th>Último acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {people.length === 0 && (
                    <tr><td colSpan="6" style={{ padding: '1rem', color: '#7c82a0', textAlign: 'center' }}>Nenhum dado de acesso registrado</td></tr>
                  )}
                  {people.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.location && <div style={{ fontSize: '.72rem', color: palette.textMuted }}>📍 {p.location}</div>}
                      </td>
                      <td>{p.email || '—'}</td>
                      <td>{p.count}</td>
                      <td>{p.sessions}</td>
                      <td>{p.pagesCount}</td>
                      <td>{p.last ? new Date(p.last).toLocaleString('pt-BR') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    if (activePage === 'conteudo' || activePage === 'configuracoes') {
      return (
        <div>
          <div className="painel-card" style={{ marginBottom: '1.2rem' }}>
            <div className="painel-table-bar">
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>{activePage === 'configuracoes' ? 'Configurações' : 'Menu do Painel'}</h3>
              <button className="pm-add-btn" onClick={saveNavConfig}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>💾</span> Salvar alterações
              </button>
            </div>
            {activePage === 'configuracoes' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div className="painel-card" style={{ padding: '1rem' }}>
                  <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '.6rem' }}>Conteúdo do Site</h3>
                  <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '.6rem' }}>
                    <button className="pm-add-btn" onClick={openConfigEditHome}>Editar Home</button>
                    <select className="pm-select" value={ministryId} onChange={e => {
                      setMinistryId(e.target.value);
                      setMinistryTab('geral');
                    }}>
                      {ministryOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                    <button className="painel-action-btn" onClick={() => openConfigEditMinistry(ministryId)}>Editar Ministério</button>
                  </div>
                  <p style={{ color: palette.textMuted, fontSize: '.85rem' }}>As páginas públicas leem os dados salvos aqui. O layout permanece o mesmo.</p>
                </div>
                <div className="painel-card" style={{ padding: '1rem' }}>
                  <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '.6rem' }}>Menu do Painel</h3>
                  <p style={{ color: palette.textMuted, fontSize: '.85rem', marginBottom: '.6rem' }}>Personalize rótulos e ícones do menu lateral.</p>
                </div>
              </div>
            )}
            <div className="painel-table-wrap">
              <table className="painel-table">
                <thead>
                  <tr>
                    <th>Seção</th>
                    <th>ID (fixo)</th>
                    <th>Nome exibido</th>
                    <th>Ícone</th>
                  </tr>
                </thead>
                <tbody>
                  {navMain.map((item, index) => (
                    <tr key={`main-${item.id}`}>
                      <td>Menu Principal</td>
                      <td><code>{item.id}</code></td>
                      <td>
                        <input
                          className="pm-input"
                          value={item.label}
                          onChange={e => {
                            const next = [...navMain];
                            next[index] = { ...next[index], label: e.target.value };
                            setNavMain(next);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          className="pm-input"
                          value={item.icon}
                          onChange={e => {
                            const next = [...navMain];
                            next[index] = { ...next[index], icon: e.target.value };
                            setNavMain(next);
                          }}
                          placeholder="Emoji ou letra"
                        />
                      </td>
                    </tr>
                  ))}
                  {navSettings.map((item, index) => (
                    <tr key={`settings-${item.id}`}>
                      <td>Administração</td>
                      <td><code>{item.id}</code></td>
                      <td>
                        <input
                          className="pm-input"
                          value={item.label}
                          onChange={e => {
                            const next = [...navSettings];
                            next[index] = { ...next[index], label: e.target.value };
                            setNavSettings(next);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          className="pm-input"
                          value={item.icon}
                          onChange={e => {
                            const next = [...navSettings];
                            next[index] = { ...next[index], icon: e.target.value };
                            setNavSettings(next);
                          }}
                          placeholder="Emoji ou letra"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    if (activePage === 'logs') {
      return (
        <div>
          <div className="painel-page-header">
            <h1>Histórico de Logs</h1>
            <p>Monitore atividades, acessos e ações no sistema.</p>
          </div>
          <div className="painel-card">
            <div className="painel-table-bar">
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Registro de Atividades</h3>
            </div>
            <div className="painel-table-wrap">
              <table className="painel-table">
                <thead>
                  <tr>
                    <th>Data e Hora</th>
                    <th>Ação</th>
                    <th>Usuário</th>
                    <th>Localização / IP</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? logs.map(l => (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(l.date).toLocaleString('pt-BR')}</td>
                      <td><strong>{l.action}</strong></td>
                      <td>{l.user || 'Sistema'}</td>
                      <td><span style={{ fontSize: '.8rem', color: palette.textMuted }}>📍 {l.location || 'Desconhecido'}</span></td>
                      <td style={{ fontSize: '.8rem', color: palette.textMuted }}>{l.details || '—'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: palette.textMuted, padding: '1.5rem' }}>
                        Nenhum log registrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    if (activePage === 'usuarios') {
      return (
        <div>
          <div className="painel-page-header">
            <h1>Usuários e Logins</h1>
            <p>Gerencie o acesso administrativo e membros da igreja.</p>
          </div>
          <div className="painel-card">
            <div className="painel-table-bar">
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Usuários do Sistema</h3>
              <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="painel-search-wrap">
                  <span>🔍</span>
                  <input className="painel-search" placeholder="Buscar por nome, e-mail ou local (cidade/estado/país)..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="painel-filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="pending">Pendentes</option>
                  <option value="inactive">Inativos</option>
                </select>
                <button className="pm-add-btn" onClick={openCreateUser} title="Novo Cadastro">
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Novo Cadastro
                </button>
              </div>
            </div>
            <div className="painel-table-wrap">
              <table className="painel-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Desde</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="user-avatar-sm" style={{ marginRight: 12 }}>
                            {u.photo ? <img src={u.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (u.name || 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                            {u.location && <div style={{ fontSize: '.72rem', color: palette.textMuted }}>📍 {u.location}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <span className={`status-pill ${u.status}`}>
                          <span className="status-dot" /> {u.status}
                        </span>
                      </td>
                      <td>{u.since}</td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-ver" onClick={() => openViewUser(u)}>👁 Ver</button>
                        <button className="btn-editar" onClick={() => openEditUser(u)}>✏️ Editar</button>
                        <button
                          className="btn-deletar"
                          onClick={() => deleteUser(u.id)}
                          disabled={currentUser?.role !== 'Administrador' || u.id === currentUser?.id || u.id === 'offline-admin'}
                          style={(currentUser?.role !== 'Administrador' || u.id === currentUser?.id || u.id === 'offline-admin') ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          title={u.id === currentUser?.id ? 'Você não pode excluir a si mesmo' : currentUser?.role !== 'Administrador' ? 'Apenas administradores podem excluir usuários' : 'Excluir usuário'}
                        >
                          🗑 Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: '#7c82a0', padding: '1rem' }}>
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    if (activePage === 'configs') {
      return (
        <div>
          <div className="painel-page-header">
            <h1>Configurações do Site</h1>
            <p>Gerencie o logotipo, favicon e outras informações globais.</p>
          </div>
          <div className="painel-card" style={{ maxWidth: 600 }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '1.2rem' }}>Identidade Visual</h3>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>Nome do Site (Texto do Logo)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">📝</span>
                <input
                  className="pm-input"
                  value={headerData?.logo?.text || ''}
                  onChange={e => setHeaderData(d => ({ ...d, logo: { ...d.logo, text: e.target.value } }))}
                />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>Logo / Favicon (URL ou Upload)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div className="pm-field-wrap">
                    <span className="pm-icon">🖼</span>
                    <input
                      className="pm-input"
                      value={headerData?.logo?.icon || ''}
                      onChange={e => setHeaderData(d => ({ ...d, logo: { ...d.logo, icon: e.target.value } }))}
                      placeholder="URL da imagem (ex: https://...)"
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ display: 'inline-block', padding: '6px 12px', background: palette.surfaceHover, border: `1px solid ${palette.border}`, borderRadius: 6, fontSize: '.8rem', cursor: 'pointer', color: palette.textMuted }}>
                      📁 Enviar Arquivo
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 512 * 1024) {
                          alert('O logo deve ser pequeno (máx 512KB) para não afetar o carregamento do site.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = ev => setHeaderData(d => ({ ...d, logo: { ...d.logo, icon: ev.target.result } }));
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                    <p style={{ fontSize: '.7rem', color: palette.textMuted, marginTop: 4 }}>Esta imagem será usada como Logo principal e como Favicon (ícone do navegador).</p>
                  </div>
                </div>
                {headerData?.logo?.icon && (
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: '#fff', border: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                    {headerData.logo.icon.includes('data:image') || headerData.logo.icon.includes('http') ? (
                      <img src={headerData.logo.icon.trim()} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '2rem', color: '#000' }}>{headerData.logo.icon}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '1.2rem', marginTop: '1.5rem' }}>Redes Sociais (Cabeçalho)</h3>
            <div className="pm-field" style={{ marginBottom: '1rem' }}>
              <label>Instagram (Link)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">📸</span>
                <input
                  className="pm-input"
                  value={headerData?.social?.instagram || ''}
                  onChange={e => setHeaderData(d => ({ ...d, social: { ...d.social, instagram: e.target.value } }))}
                  placeholder="https://instagram.com/sua-igreja"
                />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1rem' }}>
              <label>YouTube (Link)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">📺</span>
                <input
                  className="pm-input"
                  value={headerData?.social?.youtube || ''}
                  onChange={e => setHeaderData(d => ({ ...d, social: { ...d.social, youtube: e.target.value } }))}
                  placeholder="https://youtube.com/@sua-igreja"
                />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1rem' }}>
              <label>Facebook (Link)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">👥</span>
                <input
                  className="pm-input"
                  value={headerData?.social?.facebook || ''}
                  onChange={e => setHeaderData(d => ({ ...d, social: { ...d.social, facebook: e.target.value } }))}
                  placeholder="https://facebook.com/sua-igreja"
                />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1rem' }}>
              <label>Telefone / WhatsApp (Apenas Números)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">📞</span>
                <input
                  className="pm-input"
                  value={headerData?.social?.phone || ''}
                  onChange={e => setHeaderData(d => ({ ...d, social: { ...d.social, phone: e.target.value } }))}
                  placeholder="61999999999"
                />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>Música / TikTok / Spotify (Link)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">🎵</span>
                <input
                  className="pm-input"
                  value={headerData?.social?.music || ''}
                  onChange={e => setHeaderData(d => ({ ...d, social: { ...d.social, music: e.target.value } }))}
                  placeholder="https://tiktok.com/@sua-igreja"
                />
              </div>
            </div>

            <button
              className="pm-btn-save"
              style={{ width: '100%' }}
              onClick={async () => {
                try {
                  const { error } = await supabase.from('site_settings').upsert({ key: 'header', data: headerData });
                  if (error || !hasSupabase) {
                    try {
                      localStorage.setItem('admac_site_settings:header', JSON.stringify(headerData));
                    } catch { /* ignore */ }
                  }
                  broadcastUpdate('header');
                  alert(error || !hasSupabase ? "Configurações salvas no navegador (offline)." : "Configurações salvas com sucesso!");
                } catch (err) {
                  console.error('Error saving header:', err);
                  alert("Erro ao salvar configurações.");
                }
              }}
            >
              Salvar Identidade
            </button>
          </div>

          <div className="painel-card" style={{ maxWidth: 600, marginTop: '1.2rem' }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '1.2rem' }}>Informações de Contato (Rodapé)</h3>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>Endereço</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">📍</span>
                <input
                  className="pm-input"
                  value={footerData?.contact?.address || ''}
                  onChange={e => setFooterData(d => ({ ...d, contact: { ...d.contact, address: e.target.value } }))}
                />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>Telefone / WhatsApp</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">📞</span>
                <input
                  className="pm-input"
                  value={footerData?.contact?.phone || ''}
                  onChange={e => setFooterData(d => ({ ...d, contact: { ...d.contact, phone: e.target.value } }))}
                />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>E-mail</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">✉️</span>
                <input
                  className="pm-input"
                  value={footerData?.contact?.email || ''}
                  onChange={e => setFooterData(d => ({ ...d, contact: { ...d.contact, email: e.target.value } }))}
                />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>Horário dos Cultos</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">⏰</span>
                <input
                  className="pm-input"
                  value={footerData?.contact?.cultos || ''}
                  onChange={e => setFooterData(d => ({ ...d, contact: { ...d.contact, cultos: e.target.value } }))}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '1.2rem', marginTop: '1.5rem' }}>Redes Sociais</h3>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>Facebook (Link)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">🔗</span>
                <input className="pm-input" value={footerData?.social?.facebook || ''} onChange={e => setFooterData(d => ({ ...d, social: { ...d.social, facebook: e.target.value } }))} />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>Instagram (Link)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">🔗</span>
                <input className="pm-input" value={footerData?.social?.instagram || ''} onChange={e => setFooterData(d => ({ ...d, social: { ...d.social, instagram: e.target.value } }))} />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>YouTube (Link)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">🔗</span>
                <input className="pm-input" value={footerData?.social?.youtube || ''} onChange={e => setFooterData(d => ({ ...d, social: { ...d.social, youtube: e.target.value } }))} />
              </div>
            </div>
            <div className="pm-field" style={{ marginBottom: '1.5rem' }}>
              <label>Spotify (Link)</label>
              <div className="pm-field-wrap">
                <span className="pm-icon">🔗</span>
                <input className="pm-input" value={footerData?.social?.spotify || ''} onChange={e => setFooterData(d => ({ ...d, social: { ...d.social, spotify: e.target.value } }))} />
              </div>
            </div>

            <button
              className="pm-btn-save"
              style={{ width: '100%' }}
              onClick={async () => {
                try {
                  const { error } = await supabase.from('site_settings').upsert({ key: 'footer', data: footerData });
                  if (error || !hasSupabase) {
                    try {
                      localStorage.setItem('admac_site_settings:footer', JSON.stringify(footerData));
                    } catch { /* ignore */ }
                  }
                  broadcastUpdate('footer');
                  alert(error || !hasSupabase ? "Rodapé salvo no navegador (offline)." : "Rodapé e contatos salvos com sucesso!");
                } catch (err) {
                  console.error('Error saving footer:', err);
                  alert("Erro ao salvar contatos/rodapé.");
                }
              }}
            >
              Salvar Contatos e Rodapé
            </button>
          </div>

          <div className="painel-card" style={{ maxWidth: 600, marginTop: '1.2rem' }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '1.2rem' }}>Gerenciamento de Cache</h3>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '.85rem', color: palette.textMuted, marginTop: '8px' }}>
                O sistema agora utiliza Supabase para armazenamento persistente. Se você encontrar dados antigos ou comportamentos inesperados, pode limpar o cache local do navegador.
              </p>
            </div>
            <button
              className="btn-deletar"
              style={{ width: '100%', background: 'transparent', border: `1px solid ${palette.danger}`, color: palette.danger }}
              onClick={() => {
                if (window.confirm('ATENÇÃO: Deseja limpar o cache local? Isso recarregará a página.')) {
                  // Limpeza seletiva para não quebrar outras partes do navegador
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('admac_') || key.startsWith('site_settings:')) {
                      localStorage.removeItem(key);
                    }
                  });
                  window.location.reload();
                }
              }}
            >
              🗑️ Limpar Cache Local
            </button>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: '1rem', color: palette.textMuted }}>
        <div style={{ fontSize: '3rem', opacity: .4 }}>🧭</div>
        <h2 style={{ fontSize: '1.1rem', color: palette.text, fontWeight: 600 }}>Em breve</h2>
        <p style={{ fontSize: '.85rem', textAlign: 'center', maxWidth: 280 }}>Conteúdo para {([...NAV_ITEMS_DEFAULT, ...NAV_SETTINGS_DEFAULT].find(i => i.id === activePage)?.label || 'Página')}.</p>
      </div>
    );
  };

  const currentLabel = ([...NAV_ITEMS_DEFAULT, ...NAV_SETTINGS_DEFAULT].find(i => i.id === activePage)?.label) || 'Dashboard';

  return (
    <>
      <style>{globalCSS}</style>
      <div className="painel-layout">
        <aside className={`painel-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="painel-sidebar-logo">
            <div className="painel-sidebar-logo-icon" style={headerData?.logo?.icon?.includes('http') || headerData?.logo?.icon?.includes('data:image') ? { background: 'transparent' } : {}}>
              {headerData?.logo?.icon && typeof headerData.logo.icon === 'string' && (headerData.logo.icon.includes('data:image') || headerData.logo.icon.includes('http')) ? (
                <img src={headerData.logo.icon.trim()} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                headerData?.logo?.icon || '⛪'
              )}
            </div>
            <span>{headerData?.logo?.text || 'ADMAC'} Painel</span>
          </div>
          <div className="painel-sidebar-section">
            <div className="painel-sidebar-section-label">Menu</div>
            {NAV_ITEMS_DEFAULT.map(item => (
              <div key={item.id} className={`painel-nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="painel-sidebar-section">
            <div className="painel-sidebar-section-label">Administração</div>
            {NAV_SETTINGS_DEFAULT.map(item => (
              <div key={item.id} className={`painel-nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="conn-status-wrap">
            <div className="conn-badge" title={connStatus.message}>
              <div className={`conn-status-dot ${connStatus.state}`}></div>
              <span>Supabase {connStatus.state === 'online' ? 'Online' : connStatus.state === 'testing' ? 'Testando...' : 'Desativado'}</span>
            </div>
            <button 
              className="conn-test-btn" 
              onClick={() => checkConnection(true)}
              disabled={isTestingConn}
            >
              {isTestingConn ? 'Testando...' : 'Testar Conexão'}
            </button>
          </div>
          <div className="painel-sidebar-footer">
            <button className="painel-logout-btn" onClick={handleLogout}>
              <span>⏻</span> Sair
            </button>
          </div>
        </aside>

        <div className={`painel-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

        <header className={`painel-topbar ${sidebarOpen ? '' : 'full'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
            <button className="painel-hamburger" onClick={() => setSidebarOpen(v => !v)}>☰</button>
            <div className="painel-breadcrumb">Você está em <strong>{currentLabel}</strong></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', position: 'relative' }}>
            <div
              title={hasSupabase ? 'Conectado ao Supabase' : 'Modo offline (navegador)'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 8,
                border: `1px solid ${palette.border}`,
                background: hasSupabase ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                color: hasSupabase ? '#22c55e' : '#f59e0b',
                fontSize: '.8rem',
                fontWeight: 600
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: hasSupabase ? '#22c55e' : '#f59e0b'
              }} />
              <span>{hasSupabase ? 'Supabase' : 'Offline'}</span>
            </div>
            <button
              className="painel-badge-btn"
              title="Testar conexão"
              onClick={async () => {
                const res = await testSupabaseConnection();
                const msgs = [
                  `Env: ${res.env ? 'OK' : 'FALHA'}`,
                  `DB: ${res.db ? 'OK' : 'FALHA'}`,
                  `Storage: ${res.storage ? 'OK' : 'FALHA'}`
                ];
                alert(`Teste de Conexão\n${msgs.join('\n')}`);
              }}
            >
              ✅
            </button>
            <button
              className="painel-badge-btn"
              title={hasPagesNotif ? 'Há novas notificações' : 'Sem novas notificações'}
              onClick={() => {
                setShowNotifBox(!showNotifBox);
                setHasPagesNotif(false);
              }}
            >
              🔔
              {hasPagesNotif && <span className="painel-badge" />}
            </button>

            {showNotifBox && (
              <div
                className="painel-card"
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: 320,
                  zIndex: 1000,
                  padding: 0,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: `1px solid ${palette.border}`,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${palette.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: palette.bgSidebar }}>
                  <span style={{ fontWeight: 600, fontSize: '.9rem' }}>Notificações</span>
                  <button
                    style={{ background: 'none', border: 'none', color: palette.accentLight, fontSize: '.75rem', cursor: 'pointer' }}
                    onClick={() => setNotifications([])}
                  >
                    Limpar tudo
                  </button>
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: palette.textMuted, fontSize: '.85rem' }}>
                      Nenhuma notificação por enquanto.
                    </div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${palette.border}`,
                        cursor: 'pointer',
                        background: n.read ? 'transparent' : 'rgba(108, 99, 255, 0.05)',
                        transition: 'background .2s'
                      }}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        setSelectedNotif(n);
                        setShowNotifBox(false);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '.85rem', color: palette.accentLight }}>{n.title}</span>
                        <span style={{ fontSize: '.7rem', color: palette.textMuted }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '.8rem', color: palette.text, margin: 0, lineHeight: 1.4 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="painel-avatar">
              {currentUser?.photo ? (
                <img src={currentUser.photo} alt={currentUser.name || 'Usuário'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                (currentUser?.name || 'AD').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
              )}
            </div>
          </div>
        </header>

        <main className={`painel-main ${sidebarOpen ? '' : 'full'}`}>
          <div className="painel-page-header">
            <h1>{currentLabel}</h1>
            <p>Gerencie os recursos administrativos.</p>
          </div>
          {renderPage()}
        </main>
      </div>

      {showModal && (
        <div className="pm-backdrop" onClick={() => setShowModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-header">
              <h3>{userMode === 'create' ? 'Novo Usuário' : userMode === 'edit' ? 'Editar Usuário' : 'Usuário'}</h3>
              <button className="pm-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={saveUser}>
              <div className="pm-body">
                <div className="pm-photo-wrap">
                  <div className="pm-photo-preview">
                    {newUser.photo ? <img src={newUser.photo} alt="preview" /> : '👤'}
                  </div>
                  <label className="pm-photo-btn" style={{ pointerEvents: userMode === 'view' ? 'none' : 'auto', opacity: userMode === 'view' ? .6 : 1 }}>
                    Selecionar Foto
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                  </label>
                </div>
                <div className="pm-row">
                  <div className="pm-field">
                    <label>Nome</label>
                    <div className="pm-field-wrap">
                      <span className="pm-icon">👤</span>
                      <input className="pm-input" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required disabled={userMode === 'view'} />
                    </div>
                  </div>
                  <div className="pm-field">
                    <label>E-mail</label>
                    <div className="pm-field-wrap">
                      <span className="pm-icon">✉</span>
                      <input className="pm-input" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required disabled={userMode === 'view'} />
                    </div>
                  </div>
                </div>
                <div className="pm-row">
                  <div className="pm-field">
                    <label>Perfil</label>
                    <select className="pm-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} disabled={userMode === 'view'}>
                      <option value="Viewer">Viewer</option>
                      <option value="Editor">Editor</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                  <div className="pm-field">
                    <label>Status</label>
                    <select className="pm-select" value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })} disabled={userMode === 'view'}>
                      <option value="active">Ativo</option>
                      <option value="pending">Pendente</option>
                      <option value="inactive">Inativo</option>
                      <option value="danger">Risco</option>
                    </select>
                  </div>
                </div>
                <div className="pm-field">
                  <label>Localização (Cidade, Estado ou País)</label>
                  <div className="pm-field-wrap">
                    <span className="pm-icon">📍</span>
                    <input className="pm-input" placeholder="Ex: Goiânia / GO ou Brasil" value={newUser.location} onChange={e => setNewUser({ ...newUser, location: e.target.value })} disabled={userMode === 'view'} />
                  </div>
                </div>
                <div className="pm-field">
                  <label>Senha</label>
                  <div className="pm-field-wrap">
                    <span className="pm-icon">🔒</span>
                    <input className="pm-input" type={showModalPw ? 'text' : 'password'} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required disabled={userMode === 'view'} />
                    <button type="button" className="pm-toggle-pw" onClick={() => setShowModalPw(v => !v)} title={showModalPw ? 'Ocultar senha' : 'Mostrar senha'} disabled={userMode === 'view'}>
                      {showModalPw ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="pm-footer">
                <button type="button" className="pm-btn-cancel" onClick={() => setShowModal(false)}>{userMode === 'view' ? 'Fechar' : 'Cancelar'}</button>
                {userMode !== 'view' && <button type="submit" className="pm-btn-save">Salvar</button>}
              </div>
            </form>
          </div>
        </div>
      )}

      {pageModalOpen && (
        <div className="pm-backdrop" onClick={() => setPageModalOpen(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-header">
              <h3>{pageMode === 'create' ? 'Nova Página' : `Editar ${pageName}`}</h3>
              <button className="pm-close" onClick={() => setPageModalOpen(false)}>✕</button>
            </div>
            <div className="pm-body">
              {pageMode === 'contact' ? (
                <>
                  <div className="pm-field">
                    <label>Título da Página</label>
                    <div className="pm-field-wrap">
                      <span className="pm-icon">✏️</span>
                      <input
                        className="pm-input"
                        placeholder="Ex: Entre em Contato"
                        value={pageData.title}
                        onChange={e => setPageData(d => ({ ...d, title: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="pm-field">
                    <label>Subtítulo</label>
                    <textarea
                      value={pageData.description || ''}
                      onChange={e => setPageData(d => ({ ...d, description: e.target.value }))}
                      placeholder="Texto logo abaixo do título"
                      style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                    />
                  </div>

                  <div className="pm-field">
                    <label>Endereço</label>
                    <textarea
                      value={pageData.address || ''}
                      onChange={e => setPageData(d => ({ ...d, address: e.target.value }))}
                      placeholder="Endereço exibido na página"
                      style={{ width: '100%', height: 70, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                    />
                  </div>

                  <div className="pm-row">
                    <div className="pm-field">
                      <label>Telefone</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">📞</span>
                        <input
                          className="pm-input"
                          value={pageData.phone || ''}
                          onChange={e => setPageData(d => ({ ...d, phone: e.target.value }))}
                          placeholder="(61) 99999-9999"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Email</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">✉</span>
                        <input
                          className="pm-input"
                          type="email"
                          value={pageData.email || ''}
                          onChange={e => setPageData(d => ({ ...d, email: e.target.value }))}
                          placeholder="contato@igreja.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pm-field">
                    <label>Horário dos Cultos</label>
                    <textarea
                      value={pageData.schedule || ''}
                      onChange={e => setPageData(d => ({ ...d, schedule: e.target.value }))}
                      placeholder="Ex: Domingo: 18h | Quinta: 19h30"
                      style={{ width: '100%', height: 70, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                    />
                  </div>
                </>
              ) : pageMode === 'home' ? (
                <>
                  <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.8rem', flexWrap: 'wrap' }}>
                    {['bemvindo', 'programacao', 'atividades'].map(t => (
                      <button
                        key={t}
                        onClick={() => setHomeTab(t)}
                        className="painel-action-btn"
                        style={{
                          borderColor: homeTab === t ? palette.accent : palette.border,
                          color: homeTab === t ? palette.accentLight : palette.textMuted,
                          background: homeTab === t ? palette.accentGlow : 'transparent'
                        }}
                      >
                        {t === 'bemvindo' ? 'Boas‑vindas' : t === 'programacao' ? 'Programação' : 'Atividades'}
                      </button>
                    ))}
                  </div>
                  {homeTab === 'bemvindo' && (
                    <div>
                      <div className="pm-field">
                        <label>Título de Boas‑vindas</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">✏️</span>
                          <input
                            className="pm-input"
                            value={homeData?.welcome?.title || ''}
                            onChange={e => setHomeData(d => ({ ...d, welcome: { ...d.welcome, title: e.target.value } }))}
                          />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Texto 1</label>
                        <textarea
                          value={homeData?.welcome?.text1 || ''}
                          onChange={e => setHomeData(d => ({ ...d, welcome: { ...d.welcome, text1: e.target.value } }))}
                          style={{ width: '100%', height: 100, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                        />
                      </div>
                      <div className="pm-field">
                        <label>Texto 2</label>
                        <textarea
                          value={homeData?.welcome?.text2 || ''}
                          onChange={e => setHomeData(d => ({ ...d, welcome: { ...d.welcome, text2: e.target.value } }))}
                          style={{ width: '100%', height: 100, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                        />
                      </div>
                    </div>
                  )}
                  {homeTab === 'programacao' && (
                    <div>
                      {(homeData?.schedule || []).map((s, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Dia</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">🗓</span>
                              <input
                                className="pm-input"
                                value={s.day || ''}
                                onChange={e => {
                                  const next = [...(homeData.schedule || [])];
                                  next[idx] = { ...next[idx], day: e.target.value };
                                  setHomeData(d => ({ ...d, schedule: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Hora</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">⏰</span>
                              <input
                                className="pm-input"
                                value={s.time || ''}
                                onChange={e => {
                                  const next = [...(homeData.schedule || [])];
                                  next[idx] = { ...next[idx], time: e.target.value };
                                  setHomeData(d => ({ ...d, schedule: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Evento</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">📌</span>
                              <input
                                className="pm-input"
                                value={s.event || ''}
                                onChange={e => {
                                  const next = [...(homeData.schedule || [])];
                                  next[idx] = { ...next[idx], event: e.target.value };
                                  setHomeData(d => ({ ...d, schedule: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button
                              className="btn-deletar"
                              onClick={() => {
                                const next = [...(homeData.schedule || [])];
                                next.splice(idx, 1);
                                setHomeData(d => ({ ...d, schedule: next }));
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="pm-add-btn"
                        onClick={() => setHomeData(d => ({ ...d, schedule: [...(d.schedule || []), { day: '', time: '', event: '' }] }))}
                      >
                        + Adicionar Item
                      </button>
                    </div>
                  )}
                  {homeTab === 'atividades' && (
                    <div>
                      {(homeData?.activities || []).map((a, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Título</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">✏️</span>
                              <input
                                className="pm-input"
                                value={a.title || ''}
                                onChange={e => {
                                  const next = [...(homeData.activities || [])];
                                  next[idx] = { ...next[idx], title: e.target.value };
                                  setHomeData(d => ({ ...d, activities: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Data</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">🗓</span>
                              <input
                                className="pm-input"
                                value={a.date || ''}
                                onChange={e => {
                                  const next = [...(homeData.activities || [])];
                                  next[idx] = { ...next[idx], date: e.target.value };
                                  setHomeData(d => ({ ...d, activities: next }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Descrição</label>
                            <textarea
                              value={a.description || ''}
                              onChange={e => {
                                const next = [...(homeData.activities || [])];
                                next[idx] = { ...next[idx], description: e.target.value };
                                setHomeData(d => ({ ...d, activities: next }));
                              }}
                              style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                            />
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Imagem (URL)</label>
                            <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <span className="pm-icon">🖼</span>
                                <input
                                  className="pm-input"
                                  value={a.image || ''}
                                  onChange={e => {
                                    const next = [...(homeData.activities || [])];
                                    next[idx] = { ...next[idx], image: e.target.value };
                                    setHomeData(d => ({ ...d, activities: next }));
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                className="pm-photo-btn"
                                style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                                onClick={() => handleFileUpload(url => {
                                  const next = [...(homeData.activities || [])];
                                  next[idx] = { ...next[idx], image: url };
                                  setHomeData(d => ({ ...d, activities: next }));
                                })}
                              >
                                Subir Foto
                              </button>
                            </div>
                          </div>
                          {a.image ? <div style={{ marginBottom: '.5rem', gridColumn: '1 / -1' }}><img src={transformImageLink(a.image)} alt="" style={{ width: 120, height: 72, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /></div> : null}
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button
                              className="btn-deletar"
                              onClick={() => {
                                const next = [...(homeData.activities || [])];
                                next.splice(idx, 1);
                                setHomeData(d => ({ ...d, activities: next }));
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="pm-add-btn"
                        onClick={() => setHomeData(d => ({ ...d, activities: [...(d.activities || []), { title: '', date: '', description: '', image: '' }] }))}
                      >
                        + Adicionar Atividade
                      </button>
                    </div>
                  )}
                </>
              ) : pageMode === 'ministry' ? (
                <>
                  <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.8rem', flexWrap: 'wrap' }}>
                    {['geral', 'equipe', 'programacao', 'galeria', 'testemunhos', 'aniversariantes'].map(t => (
                      <button
                        key={t}
                        onClick={() => setMinistryTab(t)}
                        className="painel-action-btn"
                        style={{
                          borderColor: ministryTab === t ? palette.accent : palette.border,
                          color: ministryTab === t ? palette.accentLight : palette.textMuted,
                          background: ministryTab === t ? palette.accentGlow : 'transparent'
                        }}
                      >
                        {t === 'geral' ? 'Geral' : t === 'equipe' ? 'Equipe' : t === 'programacao' ? 'Programação' : t === 'galeria' ? 'Galeria' : t === 'aniversariantes' ? 'Aniversariantes' : 'Testemunhos'}
                      </button>
                    ))}
                  </div>
                  {ministryTab === 'geral' && (
                    <div>
                      <div className="pm-field">
                        <label>Título Principal</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">✏️</span>
                          <input className="pm-input" value={ministryData?.hero?.title || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, title: e.target.value } }))} />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Subtítulo</label>
                        <textarea value={ministryData?.hero?.subtitle || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, subtitle: e.target.value } }))} style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                      </div>
                      <div className="pm-field">
                        <label>Versículo</label>
                        <textarea value={ministryData?.hero?.verse || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, verse: e.target.value } }))} style={{ width: '100%', height: 70, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                      </div>
                      <div className="pm-field">
                        <label>URL de Vídeo</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">▶</span>
                          <input className="pm-input" value={ministryData?.hero?.videoUrl || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, videoUrl: e.target.value } }))} />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Imagem de Fundo</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">🖼</span>
                          <input className="pm-input" value={ministryData?.hero?.image || ''} onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, image: e.target.value } }))} />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Título da Seção</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">📌</span>
                          <input className="pm-input" value={ministryData?.mission?.title || ''} onChange={e => setMinistryData(d => ({ ...d, mission: { ...d.mission, title: e.target.value } }))} />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Texto Descritivo</label>
                        <textarea value={ministryData?.mission?.text || ''} onChange={e => setMinistryData(d => ({ ...d, mission: { ...d.mission, text: e.target.value } }))} style={{ width: '100%', height: 140, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                      </div>
                    </div>
                  )}
                  {ministryTab === 'aniversariantes' && (
                    <div>
                      <div className="pm-field">
                        <label>Título da Seção</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">🎉</span>
                          <input className="pm-input" value={ministryData?.birthdays?.title || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...d.birthdays, title: e.target.value } }))} placeholder="Ex: Aniversariantes do Mês" />
                        </div>
                      </div>
                      <div className="pm-field">
                        <label>Texto Descritivo</label>
                        <textarea value={ministryData?.birthdays?.text || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...d.birthdays, text: e.target.value } }))} style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                      </div>
                      <div className="pm-field">
                        <label>Link do Vídeo (YouTube/Vimeo)</label>
                        <div className="pm-field-wrap">
                          <span className="pm-icon">▶</span>
                          <input className="pm-input" value={ministryData?.birthdays?.videoUrl || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...d.birthdays, videoUrl: e.target.value } }))} />
                        </div>
                      </div>

                      <div style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: 600, fontSize: '.95rem', color: palette.text }}>Lista de Aniversariantes</div>
                      {(ministryData?.birthdays?.people || []).map((p, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', background: palette.surfaceHover, padding: '1rem', borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                          <div className="pm-photo-wrap" style={{ gridColumn: '1 / -1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="pm-photo-preview" style={{ width: 60, height: 60 }}>
                              {p.photo ? <img src={transformImageLink(p.photo)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : '👤'}
                            </div>
                            <label className="pm-action-btn" style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: palette.accentGlow, color: palette.accentLight, borderRadius: '6px' }}>
                              Alterar Foto
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                if (file.size > 1024 * 1024) {
                                  alert('A imagem é muito grande (limite 1MB).\n\nEscolha uma foto menor para evitar que o site pare de salvar.');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const next = [...(ministryData.birthdays.people || [])];
                                  next[idx] = { ...next[idx], photo: ev.target.result };
                                  setMinistryData(d => ({ ...d, birthdays: { ...d.birthdays, people: next } }));
                                };
                                reader.readAsDataURL(file);
                              }} />
                            </label>
                          </div>
                          <div className="pm-field">
                            <label>Nome</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">👤</span>
                              <input
                                className="pm-input"
                                value={p.name || ''}
                                onChange={e => {
                                  const next = [...(ministryData.birthdays.people || [])];
                                  next[idx] = { ...next[idx], name: e.target.value };
                                  setMinistryData(d => ({ ...d, birthdays: { ...d.birthdays, people: next } }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Data (ex: 15/05)</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">📅</span>
                              <input
                                className="pm-input"
                                value={p.date || ''}
                                onChange={e => {
                                  const next = [...(ministryData.birthdays.people || [])];
                                  next[idx] = { ...next[idx], date: e.target.value };
                                  setMinistryData(d => ({ ...d, birthdays: { ...d.birthdays, people: next } }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              className="btn-deletar"
                              onClick={() => {
                                const next = [...(ministryData.birthdays.people || [])];
                                next.splice(idx, 1);
                                setMinistryData(d => ({ ...d, birthdays: { ...d.birthdays, people: next } }));
                              }}
                            >
                              Remover Pessoa
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="pm-add-btn"
                        onClick={() => setMinistryData(d => ({
                          ...d,
                          birthdays: {
                            ...d.birthdays,
                            people: [...(d.birthdays?.people || []), { name: '', date: '', photo: '' }]
                          }
                        }))}
                      >
                        + Adicionar Aniversariante
                      </button>
                    </div>
                  )}
                  {ministryTab === 'equipe' && (
                    <div>
                      {(ministryData?.team || []).map((m, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Nome</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">👤</span>
                              <input className="pm-input" value={m.name || ''} onChange={e => { const next = [...(ministryData.team || [])]; next[idx] = { ...next[idx], name: e.target.value }; setMinistryData(d => ({ ...d, team: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Cargo</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">💼</span>
                              <input className="pm-input" value={m.role || ''} onChange={e => { const next = [...(ministryData.team || [])]; next[idx] = { ...next[idx], role: e.target.value }; setMinistryData(d => ({ ...d, team: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Foto (URL)</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">🖼</span>
                              <input className="pm-input" value={m.photo || ''} onChange={e => { const next = [...(ministryData.team || [])]; next[idx] = { ...next[idx], photo: e.target.value }; setMinistryData(d => ({ ...d, team: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button className="btn-deletar" onClick={() => { const next = [...(ministryData.team || [])]; next.splice(idx, 1); setMinistryData(d => ({ ...d, team: next })); }}>Remover</button>
                          </div>
                        </div>
                      ))}
                      <button className="pm-add-btn" onClick={() => setMinistryData(d => ({ ...d, team: [...(d.team || []), { name: '', role: '', photo: '' }] }))}>+ Adicionar Membro</button>
                    </div>
                  )}
                  {ministryTab === 'programacao' && (
                    <div>
                      {(ministryData?.schedule || []).map((s, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Atividade</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">📌</span>
                              <input className="pm-input" value={s.activity || s.title || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], activity: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Dia</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">🗓</span>
                              <input className="pm-input" value={s.day || s.date || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], day: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Hora</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">⏰</span>
                              <input className="pm-input" value={s.time || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], time: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Local</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">📍</span>
                              <input className="pm-input" value={s.location || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], location: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Descrição</label>
                            <textarea value={s.description || ''} onChange={e => { const next = [...(ministryData.schedule || [])]; next[idx] = { ...next[idx], description: e.target.value }; setMinistryData(d => ({ ...d, schedule: next })); }} style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                          </div>
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button className="btn-deletar" onClick={() => { const next = [...(ministryData.schedule || [])]; next.splice(idx, 1); setMinistryData(d => ({ ...d, schedule: next })); }}>Remover</button>
                          </div>
                        </div>
                      ))}
                      <button className="pm-add-btn" onClick={() => setMinistryData(d => ({ ...d, schedule: [...(d.schedule || []), { activity: '', day: '', time: '', location: '', description: '' }] }))}>+ Adicionar Atividade</button>
                    </div>
                  )}
                  {ministryTab === 'galeria' && (
                    <div>
                      {(ministryData?.gallery || []).map((g, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Imagem (URL)</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">🖼</span>
                              <input className="pm-input" value={g.url || ''} onChange={e => { const next = [...(ministryData.gallery || [])]; next[idx] = { ...next[idx], url: e.target.value }; setMinistryData(d => ({ ...d, gallery: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Legenda</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">✏️</span>
                              <input className="pm-input" value={g.caption || ''} onChange={e => { const next = [...(ministryData.gallery || [])]; next[idx] = { ...next[idx], caption: e.target.value }; setMinistryData(d => ({ ...d, gallery: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button className="btn-deletar" onClick={() => { const next = [...(ministryData.gallery || [])]; next.splice(idx, 1); setMinistryData(d => ({ ...d, gallery: next })); }}>Remover</button>
                          </div>
                        </div>
                      ))}
                      <button className="pm-add-btn" onClick={() => setMinistryData(d => ({ ...d, gallery: [...(d.gallery || []), { url: '', caption: '' }] }))}>+ Adicionar Foto</button>
                    </div>
                  )}
                  {ministryTab === 'testemunhos' && (
                    <div>
                      {(ministryData?.testimonials || []).map((t, idx) => (
                        <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                          <div className="pm-field">
                            <label>Nome</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">👤</span>
                              <input className="pm-input" value={t.name || ''} onChange={e => { const next = [...(ministryData.testimonials || [])]; next[idx] = { ...next[idx], name: e.target.value }; setMinistryData(d => ({ ...d, testimonials: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Idade</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">#</span>
                              <input className="pm-input" value={t.age || ''} onChange={e => { const next = [...(ministryData.testimonials || [])]; next[idx] = { ...next[idx], age: e.target.value }; setMinistryData(d => ({ ...d, testimonials: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Texto</label>
                            <textarea value={t.text || ''} onChange={e => { const next = [...(ministryData.testimonials || [])]; next[idx] = { ...next[idx], text: e.target.value }; setMinistryData(d => ({ ...d, testimonials: next })); }} style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                          </div>
                          <div className="pm-field">
                            <label>Foto (URL)</label>
                            <div className="pm-field-wrap">
                              <span className="pm-icon">🖼</span>
                              <input className="pm-input" value={t.photo || ''} onChange={e => { const next = [...(ministryData.testimonials || [])]; next[idx] = { ...next[idx], photo: e.target.value }; setMinistryData(d => ({ ...d, testimonials: next })); }} />
                            </div>
                          </div>
                          <div className="pm-field">
                            <label style={{ visibility: 'hidden' }}>x</label>
                            <button className="btn-deletar" onClick={() => { const next = [...(ministryData.testimonials || [])]; next.splice(idx, 1); setMinistryData(d => ({ ...d, testimonials: next })); }}>Remover</button>
                          </div>
                        </div>
                      ))}
                      <button className="pm-add-btn" onClick={() => setMinistryData(d => ({ ...d, testimonials: [...(d.testimonials || []), { name: '', age: '', text: '', photo: '' }] }))}>+ Adicionar Testemunho</button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Foto da Página */}
                  <div className="pm-photo-wrap">
                    <div className="pm-photo-preview" style={{ width: 120, height: 120, borderRadius: 12 }}>
                      {pageData.photo ? <img src={transformImageLink(pageData.photo)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : <span style={{ fontSize: '2.5rem' }}>🖼️</span>}
                    </div>
                    <label className="pm-photo-btn">
                      📷 Selecionar Foto
                      <input type="file" accept="image/*" onChange={handlePagePhoto} style={{ display: 'none' }} />
                    </label>
                    {pageData.photo && (
                      <button type="button" onClick={() => setPageData(d => ({ ...d, photo: null }))} style={{ background: 'none', border: 'none', color: palette.danger, cursor: 'pointer', fontSize: '.82rem' }}>✕ Remover foto</button>
                    )}
                  </div>

                  {/* Nome do Arquivo (apenas ao criar) */}
                  {pageMode === 'create' && (
                    <div className="pm-field">
                      <label>Nome do Arquivo</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">📄</span>
                        <input className="pm-input" placeholder="Ex: Sobre" value={pageName} onChange={e => setPageName(e.target.value.replace(/[^A-Za-z0-9_-]/g, ''))} />
                      </div>
                    </div>
                  )}

                  {/* Título */}
                  <div className="pm-field">
                    <label>Título da Página</label>
                    <div className="pm-field-wrap">
                      <span className="pm-icon">✏️</span>
                      <input className="pm-input" placeholder="Ex: Sobre Nós" value={pageData.title} onChange={e => setPageData(d => ({ ...d, title: e.target.value }))} />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="pm-field">
                    <label>Descrição / Conteúdo</label>
                    <textarea
                      value={pageData.description}
                      onChange={e => setPageData(d => ({ ...d, description: e.target.value }))}
                      placeholder="Escreva o conteúdo da página aqui..."
                      style={{ width: '100%', height: 180, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="pm-footer">
              <button type="button" className="pm-btn-cancel" onClick={() => setPageModalOpen(false)}>Cancelar</button>
              <button type="button" className="pm-btn-save" onClick={savePage} disabled={pageSaving}>{pageSaving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {selectedNotif && (
        <div className="pm-backdrop" onClick={() => setSelectedNotif(null)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="pm-header">
              <h3>{selectedNotif.title}</h3>
              <button className="pm-close" onClick={() => setSelectedNotif(null)}>✕</button>
            </div>
            <div className="pm-body" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, color: palette.text }}>{selectedNotif.text}</p>
              <p style={{ fontSize: '.75rem', color: palette.textMuted, marginTop: '1.5rem' }}>Recebido em: {selectedNotif.time}</p>
            </div>
            <div className="pm-footer">
              <button className="pm-btn-save" onClick={() => setSelectedNotif(null)}>Entendi</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
