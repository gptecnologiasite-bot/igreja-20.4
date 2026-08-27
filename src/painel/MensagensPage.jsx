import { palette } from './theme';
import { supabase } from '../lib/supabase';

function MensagensPage({ loadSiteMessages, messagesLoading, siteMessages, currentUser }) {
  return (
    <div className="painel-card">
      <div className="painel-table-bar">
        <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Mensagens Recebidas</h3>
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
                  <td style={{ maxWidth: 300, fontSize: '.8rem', lineHeight: 1.4 }}>
                    {m.message}
                    {m.photo_url && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <a href={m.photo_url} target="_blank" rel="noreferrer" style={{ color: palette.accent, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>📷</span> Ver Foto Anexa
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        className="painel-action-btn"
                        style={{ padding: '4px 8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                        href={`mailto:${m.email || ''}?subject=${encodeURIComponent('Resposta - ADMAC')}&body=${encodeURIComponent(`Olá ${m.name || ''}!\n\nRecebemos sua mensagem enviada pelo site:\n\n"${m.message || ''}"\n\nNossa resposta:\n\n\nAtenciosamente,\nADMAC - Assembleia de Deus Ministério Atos e Conquistas`)}`}
                      >📧 E-mail</a>
                      {m.phone && (() => {
                        const digits = String(m.phone).replace(/\D/g, '');
                        const full = digits.length <= 11 ? '55' + digits : digits;
                        return (
                          <a
                            className="painel-action-btn"
                            style={{ padding: '4px 8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                            href={`https://wa.me/${full}?text=${encodeURIComponent(`Olá ${m.name || ''}! Recebemos sua mensagem no site da ADMAC. 🙏`)}`}
                            target="_blank" rel="noreferrer"
                          >💬 WhatsApp</a>
                        );
                      })()}
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

export default MensagensPage;