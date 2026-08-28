export const palette = {
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

export const globalCSS = `
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
  .painel-main{flex:1;min-width:0;margin-left:240px;margin-top:60px;padding:1.6rem;transition:margin-left .3s ease;min-height:calc(100vh - 60px)}
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
  .btn-liberar{background:#00c853;border:none;color:#fff;border-radius:6px;padding:5px 14px;font-size:.78rem;font-weight:600;cursor:pointer;transition:background .2s}
  .btn-liberar:hover{background:#00b248}
  .painel-table-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:.7rem;flex-wrap:wrap}
  .painel-search-wrap{position:relative}
  .painel-search-wrap span{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:.9rem;color:${palette.textMuted}}
  .painel-search{background:${palette.bg};border:1px solid ${palette.border};border-radius:8px;padding:.52rem 1rem .52rem 2.2rem;color:${palette.text};font-size:.85rem;outline:none;width:200px}
  .painel-filter-select{background:${palette.bg};border:1px solid ${palette.border};border-radius:8px;padding:.52rem .8rem;color:${palette.text};font-size:.85rem;outline:none}
  .painel-logout-btn{display:flex;align-items:center;gap:8px;width:100%;padding:.65rem .75rem;background:none;border:1px solid rgba(244,63,94,.2);border-radius:10px;color:${palette.danger};font-size:.87rem;font-weight:500}
  .painel-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99}
  @media (max-width:1200px){.painel-sidebar{width:200px}.painel-topbar{left:200px}.painel-main{margin-left:200px}}
  @media (max-width:992px){
    .painel-sidebar{transform:translateX(-240px);width:260px;box-shadow:10px 0 30px rgba(0,0,0,.5)}
    .painel-sidebar.open{transform:translateX(0)}
    .painel-topbar{left:0!important;padding:0 1rem}
    .painel-main{margin-left:0!important;padding:1rem}
    .painel-overlay.visible{display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:98}
    .painel-stats-grid{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
    .painel-table-bar{flex-direction:column;align-items:stretch;gap:1rem}
    .painel-search{width:100%}
    .pm-modal{width:95%;margin:auto;max-height:85vh}
    .pm-row{grid-template-columns:1fr}
    .painel-page-header h1{font-size:1.3rem}
  }
  @media (max-width:480px){
    .painel-stats-grid{grid-template-columns:1fr}
    .painel-topbar{height:55px}
    .painel-main{margin-top:55px;padding:.8rem}
    .painel-card{padding:1rem}
  }
  @media (max-width:320px){
    .painel-topbar{height:50px;padding:0 .6rem}
    .painel-main{margin-top:50px;padding:.6rem}
    .painel-page-header h1{font-size:1.15rem}
    .painel-page-header p{font-size:.8rem}
    .painel-card{padding:.8rem}
    .painel-stat-card{padding:1rem}
    .painel-stat-value{font-size:1.4rem}
    .painel-table th,.painel-table td{padding:.55rem .6rem}
    .painel-login-card{padding:1.2rem}
    .painel-avatar{width:30px;height:30px;font-size:.75rem}
    .painel-breadcrumb{font-size:.75rem}
    .painel-search{font-size:.8rem}
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
  @media (min-width:1920px){
    html{font-size:18px}
    .painel-layout *:focus-visible{outline:3px solid ${palette.accent};outline-offset:2px;border-radius:6px}
    .painel-sidebar{width:280px}
    .painel-sidebar.collapsed{transform:translateX(-280px)}
    .painel-topbar{left:280px}
    .painel-main{margin-left:280px}
    .painel-nav-item{padding:.8rem .9rem;font-size:.95rem}
    .painel-btn-primary{padding:1rem;font-size:1rem}
    .painel-input{padding:.85rem 1rem .85rem 2.4rem;font-size:1rem}
    .painel-table{font-size:.95rem}
    .painel-stat-value{font-size:2rem}
    .painel-page-header h1{font-size:1.7rem}
    .painel-card{padding:1.4rem}
    .painel-search{width:240px}
  }
`;