import { palette } from './theme';

function LogsPage({ logs }) {
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
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(l.created_at || l.date).toLocaleString('pt-BR')}</td>
                  <td><strong>{l.action}</strong></td>
                  <td>{l.user_email || l.user || 'Sistema'}</td>
                  <td><span style={{ fontSize: '.8rem', color: palette.textMuted }}>📍 {l.location || (l.action === 'visitor_access' ? l.user_email : 'Visitante Anônimo')}</span></td>
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

export default LogsPage;