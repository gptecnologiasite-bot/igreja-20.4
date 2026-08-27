import { palette } from './theme';

function RelatoriosPage({ buildAccessReportHTML }) {
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

export default RelatoriosPage;