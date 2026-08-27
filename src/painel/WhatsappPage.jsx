import { palette } from './theme';

function WhatsappPage({ siteMessages, waNumber, setWaNumber, waText, setWaText, loadSiteMessages, messagesLoading }) {
  const waContacts = (siteMessages || []).filter(m => m.phone && String(m.phone).replace(/\D/g, '').length >= 10);
  const openWa = (phone, name, text) => {
    const digits = String(phone).replace(/\D/g, '');
    const full = digits.length <= 11 ? '55' + digits : digits;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(text)}`, '_blank');
  };
  return (
    <div>
      <div className="painel-card" style={{ marginBottom: '1.2rem' }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '1rem' }}>💬 Enviar WhatsApp para qualquer número</h3>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          <input
            className="painel-input"
            style={{ maxWidth: 200 }}
            placeholder="(61) 99999-9999"
            value={waNumber}
            onChange={e => setWaNumber(e.target.value)}
          />
          <input
            className="painel-input"
            style={{ flex: 1, minWidth: 220 }}
            placeholder="Mensagem..."
            value={waText}
            onChange={e => setWaText(e.target.value)}
          />
          <button
            className="painel-action-btn"
            style={{ borderColor: '#22d3a5', color: '#22d3a5' }}
            onClick={() => {
              const digits = waNumber.replace(/\D/g, '');
              if (digits.length < 10) { alert('Digite um número válido com DDD.'); return; }
              openWa(waNumber, '', waText);
            }}
          >🚀 Abrir Conversa</button>
        </div>
      </div>

      <div className="painel-card">
        <div className="painel-table-bar">
          <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>💬 Contatos com WhatsApp ({waContacts.length})</h3>
          <button className="painel-action-btn" onClick={loadSiteMessages}>🔄 Atualizar</button>
        </div>
        {messagesLoading ? (
          <div style={{ color: palette.textMuted, padding: '1rem' }}>Carregando contatos...</div>
        ) : waContacts.length === 0 ? (
          <p style={{ color: palette.textMuted, fontSize: '.85rem', padding: '1rem' }}>
            Nenhum contato com telefone ainda. Quando alguém deixar mensagem no site com telefone (WhatsApp), aparece aqui para você responder.
          </p>
        ) : (
          <div className="painel-table-wrap">
            <table className="painel-table">
              <thead>
                <tr>
                  <th>Contato</th>
                  <th>Telefone</th>
                  <th>Mensagem que enviou</th>
                  <th>Data</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {waContacts.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.name || 'Anônimo'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{m.phone}</td>
                    <td style={{ maxWidth: 300, fontSize: '.8rem', lineHeight: 1.4 }}>{m.message}</td>
                    <td style={{ fontSize: '.75rem', whiteSpace: 'nowrap' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="painel-action-btn"
                        style={{ borderColor: '#22d3a5', color: '#22d3a5', whiteSpace: 'nowrap' }}
                        onClick={() => openWa(m.phone, m.name, `Olá ${m.name || ''}! Recebemos sua mensagem no site da ADMAC:\n\n"${m.message || ''}"\n\nNossa resposta:\n`)}
                      >🚀 Responder</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhatsappPage;