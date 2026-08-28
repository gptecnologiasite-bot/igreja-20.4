import { useState, useEffect } from 'react';
import { palette } from './theme';
import { supabase, hasSupabaseConfigured } from '../lib/supabase';
import { broadcastUpdate } from '../hooks/usePageUpdate';
import { handleFileUpload } from './fileUpload';
import BellSettingsCard from './BellSettingsCard';

function ConfigsPage({ headerData, setHeaderData, footerData, setFooterData }) {
  const hasSupabase = hasSupabaseConfigured;
  const [automationConfig, setAutomationConfig] = useState({ enabled: false, youtubeChannel: '', driveFolder: '' });

  useEffect(() => {
    const loadAutomationConfig = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('data').eq('key', 'automation_config').single();
        if (data?.data) {
          const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          setAutomationConfig(c => ({ ...c, ...parsed }));
        } else {
          try {
            const cached = localStorage.getItem('admac_site_settings:automation_config');
            if (cached) {
              setAutomationConfig(c => ({ ...c, ...JSON.parse(cached) }));
            }
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.error('Error fetching automation config:', err);
      }
    };
    loadAutomationConfig();
  }, []);

  return (
    <div>
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
                <label 
                  style={{ display: 'inline-block', padding: '6px 12px', background: palette.surfaceHover, border: `1px solid ${palette.border}`, borderRadius: 6, fontSize: '.8rem', cursor: 'pointer', color: palette.textMuted }}
                  onClick={() => handleFileUpload(url => setHeaderData(d => ({ ...d, logo: { ...d.logo, icon: url } })), hasSupabase, supabase)}
                >
                  📁 Enviar Arquivo
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
          <label>Link Direto do WhatsApp (Ex: https://wa.me/...)</label>
          <div className="pm-field-wrap">
            <span className="pm-icon">💬</span>
            <input
              className="pm-input"
              value={footerData?.social?.whatsapp || ''}
              onChange={e => setFooterData(d => ({ ...d, social: { ...d.social, whatsapp: e.target.value } }))}
              placeholder="https://wa.me/5561993241084"
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

      <BellSettingsCard />

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
        <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: '1.2rem' }}>Automação de Conteúdo</h3>
        <div style={{ marginBottom: '1.2rem' }}>
          <button
            onClick={() => setAutomationConfig(c => ({ ...c, enabled: !c.enabled }))}
            style={{
              width: '100%',
              padding: '.7rem',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '.9rem',
              color: '#fff',
              background: automationConfig.enabled ? palette.success : palette.danger,
              boxShadow: automationConfig.enabled ? '0 4px 16px rgba(34,211,165,.25)' : '0 4px 16px rgba(244,63,94,.25)'
            }}
          >
            {automationConfig.enabled ? '✅ Automação LIGADA' : '⛔ Automação DESLIGADA'}
          </button>
        </div>
        <div className="pm-field" style={{ marginBottom: '1rem' }}>
          <label>Link do Canal do YouTube</label>
          <div className="pm-field-wrap">
            <span className="pm-icon">📺</span>
            <input
              className="pm-input"
              value={automationConfig.youtubeChannel || ''}
              onChange={e => setAutomationConfig(c => ({ ...c, youtubeChannel: e.target.value }))}
              placeholder="https://www.youtube.com/@suaigreja"
            />
          </div>
        </div>
        <div className="pm-field" style={{ marginBottom: '1rem' }}>
          <label>Link da Pasta do Google Drive</label>
          <div className="pm-field-wrap">
            <span className="pm-icon">📁</span>
            <input
              className="pm-input"
              value={automationConfig.driveFolder || ''}
              onChange={e => setAutomationConfig(c => ({ ...c, driveFolder: e.target.value }))}
              placeholder="https://drive.google.com/drive/folders/XXXX"
            />
          </div>
        </div>
        <p style={{ fontSize: '.85rem', color: palette.textMuted, marginTop: '8px', marginBottom: '1rem' }}>
          A pasta do Drive deve estar compartilhada como 'Qualquer pessoa com o link'. Use o RaiDrive para organizar os arquivos. Quando ligada, o site busca vídeos do canal e imagens/vídeos/textos da pasta automaticamente.
        </p>
        <button
          className="pm-btn-save"
          style={{ width: '100%' }}
          onClick={async () => {
            try {
              const payload = { ...automationConfig, lastSyncAt: new Date().toISOString() };
              const { error } = await supabase.from('site_settings').upsert({ key: 'automation_config', data: payload });
              if (error || !hasSupabase) {
                try {
                  localStorage.setItem('admac_site_settings:automation_config', JSON.stringify(payload));
                } catch { /* ignore */ }
              }
              broadcastUpdate('automation_config');
              alert(error || !hasSupabase ? "Automação salva no navegador (offline)." : "Automação salva com sucesso!");
            } catch (err) {
              console.error('Error saving automation config:', err);
              alert("Erro ao salvar automação.");
            }
          }}
        >
          Salvar Automação
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
            if (window.confirm('ATENÇÃO: Deseja apagar TODO o banco de dados local do navegador? Isso forçará o painel a recarregar todos os dados do Supabase na próxima vez.')) {
              localStorage.clear();
              sessionStorage.clear();
              window.location.replace('/painel');
            }
          }}
        >
          🗑️ Limpar Cache Local
        </button>
      </div>
    </div>
  );
}

export default ConfigsPage;