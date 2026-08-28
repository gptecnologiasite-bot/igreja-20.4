import { palette } from './theme';
import { transformImageLink } from '../lib/dbUtils';

const MOCK_ACTIVITIES = [
  { type: 'success', text: 'Novo membro cadastrado', detail: 'Ana Paula Silva (Goiânia / GO)', time: '2 min atrás' },
  { type: 'info', text: 'Novo acesso detectado', detail: 'Visitante de São Paulo / SP', time: '45 min atrás' },
  { type: 'success', text: 'Publicação aprovada', detail: 'Revista Kids', time: '2 horas atrás' },
  { type: 'danger', text: 'Tentativa de login inválida', detail: 'IP: 189.20.xx.xx (Brasília / DF)', time: '3 horas atrás' }
];

const RANDOM_CITIES = ['SP', 'RJ', 'GO', 'DF', 'PR'];
const randomCity = () => RANDOM_CITIES[Math.floor(Math.random() * RANDOM_CITIES.length)];

function DashboardPage({ dynamicStats, pendingUsers, currentUser, approveUser, setActivePage, visitorLocations, pages, openEditPage, deletePage, bars }) {
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

      {pendingUsers.length > 0 && currentUser?.role === 'Administrador' && (
        <div className="painel-card" style={{ border: `1px solid ${palette.success}`, marginBottom: '1.2rem', background: `${palette.success}05` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 600, color: palette.success }}>🚨 Aprovações Pendentes ({pendingUsers.length})</h3>
            <button className="painel-action-btn" style={{ borderColor: palette.success, color: palette.success }} onClick={() => setActivePage('usuarios')}>Gerenciar Todos</button>
          </div>
          <div className="painel-table-wrap">
            <table className="painel-table">
              <thead>
                <tr>
                  <th style={{ color: palette.textMuted }}>Usuário</th>
                  <th style={{ color: palette.textMuted }}>E-mail</th>
                  <th style={{ textAlign: 'right', color: palette.textMuted }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ fontSize: '.8rem', color: palette.textMuted }}>{u.email}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-liberar" onClick={() => approveUser(u)} style={{ background: palette.success, borderColor: palette.success }}>
                        <span style={{ border: '2px solid #fff', borderRadius: 2, padding: '0 2px', marginRight: 6, fontSize: '.6rem', verticalAlign: 'middle', fontWeight: 900, color: '#fff' }}>✓</span>
                        Liberar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
        <div className="painel-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>📍 Visitas por Localidade</h3>
            <button className="painel-action-btn" onClick={() => setActivePage('logs')}>Ver Logs</button>
          </div>
          {(visitorLocations || []).length === 0 ? (
            <p style={{ color: palette.textMuted, fontSize: '.85rem' }}>Nenhum acesso registrado ainda. Assim que alguém visitar o site, a cidade/estado/país aparece aqui.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
              {visitorLocations.map((l, i) => {
                const max = visitorLocations[0].count || 1;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                    <span style={{ fontSize: '.8rem', width: '45%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.location}>📍 {l.location}</span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(8, (l.count / max) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#22d3a5,#38bdf8)', borderRadius: 4 }} />
                    </div>
                    <strong style={{ fontSize: '.8rem', minWidth: 28, textAlign: 'right' }}>{l.count}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                        <div className="user-avatar-sm" style={{ width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,.15)', color: palette.accent, fontWeight: 700, fontSize: '.85rem', overflow: 'hidden' }}>
                          {p.photo ? <img src={transformImageLink(p.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} /> : (p.name || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <span style={{ fontSize: '.68rem', color: palette.textMuted }}>📍 Última visita de: {randomCity()}</span>
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

export default DashboardPage;