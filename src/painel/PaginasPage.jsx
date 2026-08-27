import { palette } from './theme';
import { transformImageLink } from '../lib/dbUtils';

function PaginasPage({ pagesLoading, pages, openCreatePage, openEditPage, togglePageStatus, deletePage, currentUser }) {
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

export default PaginasPage;