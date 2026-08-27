import { palette } from './theme';

function UsuariosPage({ filteredUsers, search, setSearch, filter, setFilter, openCreateUser, openViewUser, approveUser, openEditUser, deleteUser, currentUser }) {
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
                  <td>{u.since || (u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—')}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ver" onClick={() => openViewUser(u)}>👁 Ver</button>
                    {(u.status === 'pending' || u.role === 'Viewer') && currentUser?.role === 'Administrador' && u.id !== currentUser?.id && (
                      <button className="btn-liberar" onClick={() => approveUser(u)}>✅ Liberar</button>
                    )}
                    <button className="btn-editar" onClick={() => openEditUser(u)}>✏️ Editar</button>
                    <button
                      className="btn-deletar"
                      onClick={() => deleteUser(u.id)}
                      disabled={currentUser?.role !== 'Administrador' || u.id === currentUser?.id || u.id === 'offline-admin' || u.id === 'aelda-admin' || u.id === 'humberto-admin'}
                      style={(currentUser?.role !== 'Administrador' || u.id === currentUser?.id || u.id === 'offline-admin' || u.id === 'aelda-admin' || u.id === 'humberto-admin') ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
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

export default UsuariosPage;