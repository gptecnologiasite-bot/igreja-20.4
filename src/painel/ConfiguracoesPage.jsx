import { palette } from './theme';

function ConfiguracoesPage({ activePage, saveNavConfig, navMain, setNavMain, navSettings, setNavSettings, openConfigEditHome, ministryId, setMinistryId, setMinistryTab, ministryOptions, openConfigEditMinistry }) {
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

export default ConfiguracoesPage;