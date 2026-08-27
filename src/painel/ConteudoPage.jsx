import React from 'react';
import { supabase, hasSupabaseConfigured } from '../lib/supabase';
import { INITIAL_HOME_DATA, INITIAL_MINISTRIES_DATA, INITIAL_PASTORS_CONTACTS } from '../lib/constants';
import { transformImageLink } from '../lib/dbUtils';
import { palette } from './theme';
import { handleFileUpload } from './fileUpload';
import HomeAnivEditor from './HomeAnivEditor';

export default function ConteudoPage({ ministryId, setMinistryId, ministryTab, setMinistryTab, ministryOptions, ministryData, setMinistryData, setHomeData, ministryLoading, saveMinistry, homeVideos, setHomeVideos, currentUser }) {
  const hasSupabase = hasSupabaseConfigured;
  return (
        <div>
          <div className="painel-card" style={{ marginBottom: '1.2rem' }}>
            <div className="painel-table-bar">
              <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>Editor de Conteúdo</h3>
              <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select className="pm-select" value={ministryId} onChange={e => {
                  setMinistryId(e.target.value);
                  setMinistryTab('geral');
                }}>
                  {ministryOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <button
                  className="painel-action-btn"
                  onClick={() => {
                    const label = ministryOptions.find(o => o.id === ministryId)?.label || ministryId;
                    if (window.confirm(`Deseja resetar todos os dados de "${label}" para o padrão original?`)) {
                      const defaultData = ministryId === 'home' ? INITIAL_HOME_DATA : INITIAL_MINISTRIES_DATA[ministryId];
                      if (defaultData) {
                        setMinistryData(defaultData);
                        if (ministryId === 'home') setHomeData(defaultData);
                      }
                    }
                  }}
                  style={{ borderColor: palette.danger, color: palette.danger }}
                >
                  Resetar Padrão
                </button>
                <button className="pm-add-btn" onClick={saveMinistry}>Salvar</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.8rem', flexWrap: 'wrap' }}>
              {(ministryId === 'home'
                ? ['geral', 'sliders', 'pastores', 'videos', 'mensagens', 'ministérios', 'programacao', 'atividades', 'cta', 'aniversariantes']
                : ministryId === 'midia'
                  ? ['geral', 'equipe', 'videos', 'mensagens', 'programacao', 'galeria', 'bastidores', 'noticias', 'aniversariantes']
                : (ministryId === 'intercessao' || ministryId === 'social' || ministryId === 'retiro')
                  ? ['geral', 'equipe', 'programacao', 'galeria']
                : ministryId === 'missoes'
                  ? ['geral', 'videos', 'estatisticas', 'missionarios', 'projetos', 'equipe', 'galeria']
                  : ministryId === 'revista'
                    ? ['geral', 'paginas']
                    : ['geral', 'equipe', 'programacao', 'galeria', 'aniversariantes']
              ).map(t => (
                <button
                  key={t}
                  onClick={() => setMinistryTab(t)}
                  className="painel-action-btn"
                  style={{
                    borderColor: ministryTab === t ? palette.accent : palette.border,
                    color: ministryTab === t ? palette.accentLight : palette.textMuted,
                    background: ministryTab === t ? palette.accentGlow : 'transparent'
                  }}
                >
                  {t === 'geral' ? 'Geral'
                    : t === 'sliders' ? 'Sliders'
                      : t === 'pastores' ? 'Pastores'
                        : t === 'mensagens' ? 'Mensagens'
                          : t === 'ministérios' ? 'Ministérios'
                            : t === 'equipe' ? 'Equipe'
                              : t === 'programacao' ? 'Programação'
                                : t === 'atividades' ? 'Atividades'
                                  : t === 'cta' ? 'CTA'
                                    : t === 'galeria' ? 'Galeria'
                                      : t === 'aniversariantes' ? 'Aniversariantes'
                                        : t === 'bastidores' ? 'Bastidores'
                                          : t === 'noticias' ? 'Notícias'
                                            : t === 'videos' ? 'Vídeos'
                                              : t === 'estatisticas' ? 'Estatísticas'
                                                : t === 'missionarios' ? 'Missionários'
                                                  : t === 'projetos' ? 'Projetos'

                                                      : t === 'paginas' ? 'Páginas'
                                                        : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {ministryLoading && (
              <div style={{ color: palette.textMuted }}>Carregando...</div>
            )}
            {!ministryLoading && ministryData && (
              <div className="pm-body" style={{ padding: 0 }}>
                {ministryId === 'pastors_contacts' && (
                  <div style={{ padding: '1.2rem' }}>
                    <div className="painel-page-header">
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>Gerenciar Contatos dos Pastores</h4>
                      <p style={{ fontSize: '0.8rem', color: palette.textMuted }}>Estes contatos aparecerão no menu suspenso do botão "Entre em Contato" na Home.</p>
                    </div>
                    
                    {(Array.isArray(ministryData) ? ministryData : INITIAL_PASTORS_CONTACTS).map((p, idx) => (
                      <div key={idx} style={{ marginBottom: '1.5rem', padding: '1.2rem', background: palette.surfaceHover, borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="pm-field">
                            <label>Nome do Pastor/Contato</label>
                            <input className="pm-input" value={p.name || ''} onChange={e => {
                              const next = [...(Array.isArray(ministryData) ? ministryData : INITIAL_PASTORS_CONTACTS)];
                              next[idx] = { ...next[idx], name: e.target.value };
                              setMinistryData(next);
                            }} />
                          </div>
                          <div className="pm-field">
                            <label>Cargo / Função</label>
                            <input className="pm-input" value={p.role || ''} onChange={e => {
                              const next = [...(Array.isArray(ministryData) ? ministryData : INITIAL_PASTORS_CONTACTS)];
                              next[idx] = { ...next[idx], role: e.target.value };
                              setMinistryData(next);
                            }} />
                          </div>
                          <div className="pm-field">
                            <label>WhatsApp (Somente números)</label>
                            <input className="pm-input" placeholder="Ex: 5561999999999" value={p.phone || ''} onChange={e => {
                              const next = [...(Array.isArray(ministryData) ? ministryData : INITIAL_PASTORS_CONTACTS)];
                              next[idx] = { ...next[idx], phone: e.target.value.replace(/\D/g, '') };
                              setMinistryData(next);
                            }} />
                          </div>
                          <div className="pm-field">
                             <label>Foto (Opcional)</label>
                             <div style={{ display: 'flex', gap: '8px' }}>
                               <input className="pm-input" value={p.photo || ''} onChange={e => {
                                 const next = [...(Array.isArray(ministryData) ? ministryData : INITIAL_PASTORS_CONTACTS)];
                                 next[idx] = { ...next[idx], photo: e.target.value };
                                 setMinistryData(next);
                               }} />
                               <button className="pm-photo-btn" onClick={() => handleFileUpload(url => {
                                 const next = [...(Array.isArray(ministryData) ? ministryData : INITIAL_PASTORS_CONTACTS)];
                                 next[idx] = { ...next[idx], photo: url };
                                 setMinistryData(next);
                               }, hasSupabase, supabase)}>Subir</button>
                             </div>
                          </div>
                        </div>
                        <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button className="btn-deletar" onClick={() => {
                            const next = [...(Array.isArray(ministryData) ? ministryData : INITIAL_PASTORS_CONTACTS)];
                            next.splice(idx, 1);
                            setMinistryData(next);
                          }}>Excluir Contato</button>
                        </div>
                      </div>
                    ))}
                    <button className="pm-add-btn" onClick={() => setMinistryData([...(Array.isArray(ministryData) ? ministryData : INITIAL_PASTORS_CONTACTS), { name: '', role: '', phone: '', photo: '' }])}>
                      + Adicionar Novo Pastor
                    </button>
                  </div>
                )}

                {ministryTab === 'geral' && ministryId !== 'pastors_contacts' && (
                  <div style={{ padding: '1.2rem' }}>
                    {ministryId === 'home' ? (
                      <>
                        <div className="pm-field">
                          <label>Título de Boas‑vindas</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={ministryData?.welcome?.title || ''}
                              onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, title: e.target.value } }))}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Texto 1</label>
                          <textarea
                            value={ministryData?.welcome?.text1 || ''}
                            onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, text1: e.target.value } }))}
                            style={{ width: '100%', height: 100, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Texto 2</label>
                          <textarea
                            value={ministryData?.welcome?.text2 || ''}
                            onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, text2: e.target.value } }))}
                            style={{ width: '100%', height: 100, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field" style={{ marginTop: '1.5rem', borderTop: `1px solid ${palette.border}`, paddingTop: '1.5rem' }}>
                          <label>Vídeo Recomendado (URL do YouTube)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">▶</span>
                            <input
                              className="pm-input"
                              placeholder="Ex: https://www.youtube.com/watch?v=HsNdzvG5SkM"
                              value={ministryData?.extraVideoUrl || ''}
                              onChange={e => setMinistryData(d => ({ ...d, extraVideoUrl: e.target.value }))}
                            />
                          </div>
                          <small style={{ color: palette.textMuted, fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                            O link aparecerá logo abaixo da seção central do site como vídeo integrado. Deixe em branco caso queira usar o padrão.
                          </small>
                        </div>

                        <div className="pm-field" style={{ marginTop: '1rem' }}>
                          <label>Link do App Bíblia (Google Play / App Store)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📱</span>
                            <input
                              className="pm-input"
                              placeholder="Ex: https://play.google.com/..."
                              value={ministryData?.appsBibliaLink || ''}
                              onChange={e => setMinistryData(d => ({ ...d, appsBibliaLink: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="pm-field" style={{ marginTop: '1rem' }}>
                          <label>Link do App Harpa Cristã (Google Play / App Store)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📱</span>
                            <input
                              className="pm-input"
                              placeholder="Ex: https://play.google.com/..."
                              value={ministryData?.appsHarpaLink || ''}
                              onChange={e => setMinistryData(d => ({ ...d, appsHarpaLink: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="pm-field" style={{ marginTop: '1rem' }}>
                          <label>Imagem do App (Aparecerá ao lado dos links)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                placeholder="URL da imagem ou faça o upload"
                                value={ministryData?.appsImage || ''}
                                onChange={e => setMinistryData(d => ({ ...d, appsImage: e.target.value }))}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(url => {
                                setMinistryData(d => ({ ...d, appsImage: url }));
                              }, hasSupabase, supabase)}
                            >
                              Subir Foto
                            </button>
                          </div>
                          {ministryData?.appsImage && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <img src={transformImageLink(ministryData.appsImage)} alt="Preview" style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} />
                            </div>
                          )}
                        </div>
                        <div className="pm-field">
                          <label>Texto do Botão (Home)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🏷️</span>
                            <input
                              className="pm-input"
                              value={ministryData?.welcome?.buttonText || ''}
                              onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, buttonText: e.target.value } }))}
                              placeholder="Ex: Entre em Contato"
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Link do Botão (Home)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🔗</span>
                            <input
                              className="pm-input"
                              value={ministryData?.welcome?.buttonLink || ''}
                              onChange={e => setMinistryData(d => ({ ...d, welcome: { ...d.welcome, buttonLink: e.target.value } }))}
                              placeholder="Ex: /contato"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="pm-field">
                          <label>Título Principal</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={ministryData?.hero?.title || ''}
                              onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, title: e.target.value } }))}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Subtítulo</label>
                          <textarea
                            value={ministryData?.hero?.subtitle || ''}
                            onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, subtitle: e.target.value } }))}
                            style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Versículo em Destaque (opcional)</label>
                          <textarea
                            value={ministryData?.hero?.verse || ''}
                            onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, verse: e.target.value } }))}
                            style={{ width: '100%', height: 70, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>URL de Vídeo - Conheça o Trabalho (opcional)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">▶</span>
                            <input
                              className="pm-input"
                              value={ministryData?.hero?.videoUrl || ''}
                              onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, videoUrl: e.target.value } }))}
                              placeholder="Link do YouTube"
                            />
                          </div>
                        </div>
                        {ministryId === 'missoes' && ministryData?.hero?.videoUrl && (
                          <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${palette.border}`, background: palette.bg }}>
                            <iframe
                              width="100%"
                              height="240"
                              src={ministryData.hero.videoUrl.includes('embed') ? ministryData.hero.videoUrl : `https://www.youtube.com/embed/${ministryData.hero.videoUrl.split('v=')[1]?.split('&')[0] || ministryData.hero.videoUrl.split('/').pop()}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                        <div className="pm-field">
                          <label>Imagem de Fundo</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={ministryData?.hero?.image || ''}
                                onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, image: e.target.value } }))}
                                placeholder="URL da imagem"
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(url => {
                                setMinistryData(d => ({ ...d, hero: { ...d.hero, image: url } }));
                              }, hasSupabase, supabase)}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {ministryId === 'intercessao' && (
                          <div className="pm-field" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(37, 211, 102, 0.08)', borderRadius: '12px', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
                            <label style={{ color: '#25D366', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              <span>📱</span> LINK DO CONVITE DO WHATSAPP (GRUPO)
                            </label>
                            <div className="pm-field-wrap" style={{ marginTop: '0.5rem' }}>
                              <span className="pm-icon">🔗</span>
                              <input
                                className="pm-input"
                                style={{ borderColor: 'rgba(37, 211, 102, 0.4)' }}
                                placeholder="https://chat.whatsapp.com/..."
                                value={ministryData?.whatsappUrl || ''}
                                onChange={e => setMinistryData(d => ({ ...d, whatsappUrl: e.target.value }))}
                              />
                            </div>
                            <p style={{ color: palette.textMuted, fontSize: '0.78rem', marginTop: '8px', lineHeight: '1.4' }}>
                              <strong>IMPORTANTE:</strong> Ao colar o link aqui, a seção de fotos dos líderes na página será <strong>substituída</strong> pelo botão de convite ao grupo.
                            </p>
                          </div>
                        )}
                        <div className="pm-field">
                          <label>Título da Seção</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📌</span>
                            <input
                              className="pm-input"
                              value={ministryData?.mission?.title || ''}
                              onChange={e => setMinistryData(d => ({ ...d, mission: { ...d.mission, title: e.target.value } }))}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {ministryTab === 'sliders' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.carousel || []).map((s, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={s.image || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  const next = [...(ministryData.carousel || [])];
                                  next[idx] = { ...next[idx], image: val };
                                  setMinistryData(d => ({ ...d, carousel: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(url => {
                                const next = [...(ministryData.carousel || [])];
                                next[idx] = { ...next[idx], image: url };
                                setMinistryData(d => ({ ...d, carousel: next }));
                              }, hasSupabase, supabase)}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {s.image ? <img src={transformImageLink(s.image)} alt="" style={{ width: 100, height: 60, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /> : null}
                        <div className="pm-field">
                          <label>Título</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={s.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.carousel || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, carousel: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Subtítulo</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📝</span>
                            <input
                              className="pm-input"
                              value={s.subtitle || ''}
                              onChange={e => {
                                const next = [...(ministryData.carousel || [])];
                                next[idx] = { ...next[idx], subtitle: e.target.value };
                                setMinistryData(d => ({ ...d, carousel: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.carousel || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, carousel: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, carousel: [...(d.carousel || []), { image: '', title: '', subtitle: '' }] }))}
                    >
                      + Adicionar Slider
                    </button>
                  </div>
                )}
                {ministryTab === 'pastores' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.pastors || []).map((p, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Nome</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">👤</span>
                            <input
                              className="pm-input"
                              value={p.name || ''}
                              onChange={e => {
                                const next = [...(ministryData.pastors || [])];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setMinistryData(d => ({ ...d, pastors: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Cargo/Título</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">💼</span>
                            <input
                              className="pm-input"
                              value={p.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.pastors || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, pastors: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={p.image || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  const next = [...(ministryData.pastors || [])];
                                  next[idx] = { ...next[idx], image: val };
                                  setMinistryData(d => ({ ...d, pastors: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(url => {
                                const next = [...(ministryData.pastors || [])];
                                next[idx] = { ...next[idx], image: url };
                                setMinistryData(d => ({ ...d, pastors: next }));
                              }, hasSupabase, supabase)}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {p.image ? <img src={transformImageLink(p.image)} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /> : null}
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Versículo/Mensagem</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📖</span>
                            <input
                              className="pm-input"
                              value={p.verse || ''}
                              onChange={e => {
                                const next = [...(ministryData.pastors || [])];
                                next[idx] = { ...next[idx], verse: e.target.value };
                                setMinistryData(d => ({ ...d, pastors: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.pastors || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, pastors: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, pastors: [...(d.pastors || []), { name: '', title: '', image: '', verse: '' }] }))}
                    >
                      + Adicionar Pastor
                    </button>
                  </div>
                )}
                {ministryTab === 'ministérios' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.ministries || []).map((m, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Título</label>
                          <input
                            className="pm-input"
                            value={m.title || ''}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Link</label>
                          <input
                            className="pm-input"
                            value={m.link || ''}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], link: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Ícone (Emoji)</label>
                          <input
                            className="pm-input"
                            value={m.icon || ''}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], icon: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Cor (Hex)</label>
                          <input
                            className="pm-input"
                            type="color"
                            value={m.color || '#6c63ff'}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], color: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                            style={{ height: 40, padding: 2 }}
                          />
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Descrição Curta</label>
                          <input
                            className="pm-input"
                            value={m.description || ''}
                            onChange={e => {
                              const next = [...(ministryData.ministries || [])];
                              next[idx] = { ...next[idx], description: e.target.value };
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          />
                        </div>
                        <div className="pm-field">
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.ministries || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, ministries: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, ministries: [...(d.ministries || []), { title: '', description: '', link: '', icon: '⛪', color: '#6c63ff' }] }))}
                    >
                      + Adicionar Ministério à Home
                    </button>
                  </div>
                )}
                {ministryTab === 'mensagens' && (
                  <div style={{ padding: '1.2rem' }}>
                    {ministryId === 'midia' ? (
                      <>
                        <div className="pm-field">
                          <label>Título da Live / Vídeo</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={ministryData?.live?.title || ''}
                              onChange={e => setMinistryData(d => ({ ...d, live: { ...(d.live || {}), title: e.target.value } }))}
                              placeholder="Ex: Culto Ao Vivo"
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>URL do YouTube (Embed)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">▶</span>
                              <input
                                className="pm-input"
                                value={ministryData?.live?.url || ''}
                                onChange={e => {
                                  let val = (e.target.value || '').trim();
                                  val = val.replace(/^['"`]+|['"`]+$/g, '');
                                  const m = val.match(/src=["'`](.+?)["'`]/i);
                                  if (m && m[1]) val = m[1];
                                  if (!val.includes('/embed/')) {
                                    if (val.includes('watch?v=')) {
                                      const vidId = (val.match(/[?&]v=([a-zA-Z0-9_-]+)/) || [])[1];
                                      if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                    } else if (val.includes('youtu.be/')) {
                                      const vidId = (val.match(/youtu\.be\/([a-zA-Z0-9_-]+)/) || [])[1];
                                      if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                    } else if (val.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/)) {
                                      const vidId = (val.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/) || [])[1];
                                      if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                    } else if (val.includes('youtube.com/live')) {
                                      const vidId = (val.match(/[?&]v=([a-zA-Z0-9_-]+)/) || [])[1];
                                      if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                    }
                                  }
                                  setMinistryData(d => ({ ...d, live: { ...(d.live || {}), url: val } }));
                                }}
                                placeholder="Ex: https://www.youtube.com/embed/..."
                              />
                            </div>
                            {ministryData?.live?.url && (
                              <button
                                type="button"
                                onClick={() => setMinistryData(d => ({ ...d, live: { ...(d.live || {}), url: '' } }))}
                                title="Limpar URL"
                                style={{ background: 'rgba(244,63,94,.15)', border: '1px solid rgba(244,63,94,.3)', color: '#f43f5e', borderRadius: 8, padding: '0 12px', fontSize: '1rem', cursor: 'pointer', whiteSpace: 'nowrap', height: 38 }}
                              >
                                × Limpar
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: '.75rem', color: palette.textMuted, marginTop: 4 }}>
                            Cole qualquer link do YouTube: watch?v=, youtu.be/, youtube.com/live/ ou embed/
                          </div>
                        </div>
                        {ministryData?.live?.url && !ministryData.live.url.includes('UCxxxxxxxxxxxx') && !ministryData.live.url.includes('live_stream?channel') && (
                          <div style={{ marginTop: '1rem', borderRadius: 10, overflow: 'hidden', border: `1px solid ${palette.border}` }}>
                            <iframe
                              src={ministryData.live.url}
                              title={ministryData?.live?.title || 'Preview'}
                              width="100%"
                              height="250"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="pm-field">
                          <label>URL do Spotify (Embed)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🎧</span>
                            <input
                              className="pm-input"
                              value={ministryData?.spotifyUrl || ''}
                              onChange={e => setMinistryData(d => ({ ...d, spotifyUrl: e.target.value }))}
                              placeholder="Ex: https://open.spotify.com/embed/episode/..."
                            />
                          </div>
                        </div>
                        {ministryData?.spotifyUrl && (
                          <iframe
                            data-testid="embed-iframe"
                            style={{ borderRadius: "12px" }}
                            src={ministryData.spotifyUrl}
                            width="100%"
                            height="352"
                            frameBorder="0"
                            allowFullScreen=""
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                          ></iframe>
                        )}
                      </>
                    )}
                  </div>
                )}
                {ministryTab === 'equipe' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.team || []).map((m, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Nome</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">👤</span>
                            <input
                              className="pm-input"
                              value={m.name || ''}
                              onChange={e => {
                                const next = [...(ministryData.team || [])];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setMinistryData(d => ({ ...d, team: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Cargo</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">💼</span>
                            <input
                              className="pm-input"
                              value={m.role || ''}
                              onChange={e => {
                                const next = [...(ministryData.team || [])];
                                next[idx] = { ...next[idx], role: e.target.value };
                                setMinistryData(d => ({ ...d, team: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Foto (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={m.photo || ''}
                                onChange={e => {
                                  const val = transformImageLink(e.target.value);
                                  const next = [...(ministryData.team || [])];
                                  next[idx] = { ...next[idx], photo: val };
                                  setMinistryData(d => ({ ...d, team: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(url => {
                                const next = [...(ministryData.team || [])];
                                next[idx] = { ...next[idx], photo: url };
                                setMinistryData(d => ({ ...d, team: next }));
                              }, hasSupabase, supabase)}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {m.photo ? <img src={transformImageLink(m.photo)} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /> : null}
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.team || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, team: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, team: [...(d.team || []), { name: '', role: '', photo: '' }] }))}
                    >
                      + Adicionar Membro
                    </button>
                  </div>
                )}
                {ministryTab === 'aniversariantes' && (
                  <div style={{ padding: '1.2rem' }}>
                    {ministryId === 'home' ? (() => {
                      const MINISTRY_OPTIONS = [
                        { value: 'home', label: 'Página Principal' },
                        { value: 'kids', label: 'Kids' },
                        { value: 'louvor', label: 'Louvor' },
                        { value: 'jovens', label: 'Jovens' },
                        { value: 'mulheres', label: 'Mulheres' },
                        { value: 'homens', label: 'Homens' },
                        { value: 'lares', label: 'Lares' },
                        { value: 'retiro', label: 'Retiro' },
                        { value: 'social', label: 'Ação Social' },
                        { value: 'ebd', label: 'EBD' },
                        { value: 'midia', label: 'Mídia' },
                        { value: 'missoes', label: 'Missões' },
                        { value: 'intercessao', label: 'Intercessão' },
                        { value: 'revista', label: 'Revista' },
                        { value: 'sobre', label: 'Sobre' },
                        { value: 'contact', label: 'Contato' },
                      ];
                      return (
                        <HomeAnivEditor
                          palette={palette}
                          ministryOptions={MINISTRY_OPTIONS}
                          handleFileUpload={handleFileUpload}
                          hasSupabase={hasSupabase}
                          supabase={supabase}
                          currentUser={currentUser}
                        />
                      );
                    })() : (
                      <>
                        <div className="pm-field">
                          <label>Título da Seção</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🎉</span>
                            <input className="pm-input" value={ministryData?.birthdays?.title || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), title: e.target.value } }))} placeholder="Ex: Aniversariantes do Mês" />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Texto Descritivo</label>
                          <textarea value={ministryData?.birthdays?.text || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), text: e.target.value } }))} style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                        </div>
                        <div className="pm-field">
                          <label>Link do Vídeo (YouTube)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">▶</span>
                              <input className="pm-input" placeholder="https://www.youtube.com/watch?v=..." value={ministryData?.birthdays?.videoUrl || ''} onChange={e => setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), videoUrl: e.target.value } }))} />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(url => {
                                setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), videoUrl: url } }));
                              }, hasSupabase, supabase)}
                            >
                              Subir Capa
                            </button>
                          </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', marginBottom: '0.8rem', fontWeight: 600, fontSize: '.9rem', color: palette.text }}>👥 Lista de Aniversariantes</div>
                        {(ministryData?.birthdays?.people || []).map((p, idx) => (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem', padding: '1rem', background: palette.surfaceHover, borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                              <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${palette.accent}`, flexShrink: 0, background: palette.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                {p.photo ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                              </div>
                              <label style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: palette.accentGlow, color: palette.accentLight, borderRadius: '6px', border: `1px solid ${palette.accent}` }}>
                                Trocar Foto
                                <button
                                  type="button"
                                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                  onClick={() => handleFileUpload(url => {
                                    const next = [...(ministryData?.birthdays?.people || [])];
                                    next[idx] = { ...next[idx], photo: url };
                                    setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                  }, hasSupabase, supabase)}
                                />
                              </label>
                            </div>
                            <div className="pm-field">
                              <label>Nome</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">👤</span>
                                <input className="pm-input" value={p.name || ''} onChange={e => {
                                  const next = [...(ministryData?.birthdays?.people || [])];
                                  next[idx] = { ...next[idx], name: e.target.value };
                                  setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                }} />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Data (ex: 15/05)</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">📅</span>
                                <input className="pm-input" placeholder="DD/MM" value={p.date || ''} onChange={e => {
                                  const next = [...(ministryData?.birthdays?.people || [])];
                                  next[idx] = { ...next[idx], date: e.target.value };
                                  setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                }} />
                              </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                className="btn-deletar"
                                onClick={() => {
                                  if (currentUser?.role === 'Viewer') {
                                    alert('Visualizadores não podem excluir dados.');
                                    return;
                                  }
                                  const next = [...(ministryData?.birthdays?.people || [])];
                                  next.splice(idx, 1);
                                  setMinistryData(d => ({ ...d, birthdays: { ...(d.birthdays || {}), people: next } }));
                                }}
                                disabled={currentUser?.role === 'Viewer'}
                                style={currentUser?.role === 'Viewer' ? { opacity: .5, cursor: 'not-allowed' } : {}}
                              >Excluir</button>
                            </div>
                          </div>
                        ))}
                        <button className="pm-add-btn" onClick={() => setMinistryData(d => ({
                          ...d,
                          birthdays: { ...(d.birthdays || {}), people: [...(d.birthdays?.people || []), { name: '', date: '', photo: '' }] }
                        }))}>
                          + Adicionar Aniversariante
                        </button>
                      </>
                    )}
                  </div>
                )}
                {ministryTab === 'programacao' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.schedule || []).map((s, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        {ministryId === 'home' ? (
                          <>
                            <div className="pm-field">
                              <label>Dia</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">🗓</span>
                                <input
                                  className="pm-input"
                                  value={s.day || ''}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    next[idx] = { ...next[idx], day: e.target.value };
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Hora</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">⏰</span>
                                <input
                                  className="pm-input"
                                  value={s.time || ''}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    next[idx] = { ...next[idx], time: e.target.value };
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                            <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                              <label>Evento</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">📌</span>
                                <input
                                  className="pm-input"
                                  value={s.event || ''}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    next[idx] = { ...next[idx], event: e.target.value };
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="pm-field">
                              <label>{ministryId === 'ebd' ? 'Classe' : 'Atividade'}</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">📌</span>
                                <input
                                  className="pm-input"
                                  value={ministryId === 'ebd' ? (s.class || s.title || '') : (s.activity || s.title || '')}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    if (ministryId === 'ebd') {
                                      next[idx] = { ...next[idx], class: e.target.value };
                                    } else {
                                      next[idx] = { ...next[idx], activity: e.target.value };
                                    }
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>{ministryId === 'ebd' ? 'Professor(a)' : 'Dia'}</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">{ministryId === 'ebd' ? '👤' : '🗓'}</span>
                                <input
                                  className="pm-input"
                                  value={ministryId === 'ebd' ? (s.teacher || '') : (s.day || s.date || '')}
                                  onChange={e => {
                                    const next = [...(ministryData.schedule || [])];
                                    if (ministryId === 'ebd') {
                                      next[idx] = { ...next[idx], teacher: e.target.value };
                                    } else {
                                      next[idx] = { ...next[idx], day: e.target.value };
                                    }
                                    setMinistryData(d => ({ ...d, schedule: next }));
                                  }}
                                />
                              </div>
                            </div>
                            {ministryId === 'ebd' ? (
                              <>
                                <div className="pm-field">
                                  <label>Sala</label>
                                  <div className="pm-field-wrap">
                                    <span className="pm-icon">🚪</span>
                                    <input
                                      className="pm-input"
                                      value={s.room || s.location || ''}
                                      onChange={e => {
                                        const next = [...(ministryData.schedule || [])];
                                        next[idx] = { ...next[idx], room: e.target.value };
                                        setMinistryData(d => ({ ...d, schedule: next }));
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                                  <label>Link do Material / Revista (PDF)</label>
                                  <div className="pm-field-wrap">
                                    <span className="pm-icon">🔗</span>
                                    <input
                                      className="pm-input"
                                      value={s.materialLink || ''}
                                      onChange={e => {
                                        const next = [...(ministryData.schedule || [])];
                                        next[idx] = { ...next[idx], materialLink: e.target.value };
                                        setMinistryData(d => ({ ...d, schedule: next }));
                                      }}
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <p style={{ fontSize: '0.75rem', color: palette.textMuted, marginTop: '0.4rem' }}>
                                    Deixe em branco para usar o gerenciamento automático. Formato para o QR Code de download da revista.
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="pm-field">
                                  <label>Hora</label>
                                  <div className="pm-field-wrap">
                                    <span className="pm-icon">⏰</span>
                                    <input
                                      className="pm-input"
                                      value={s.time || ''}
                                      onChange={e => {
                                        const next = [...(ministryData.schedule || [])];
                                        next[idx] = { ...next[idx], time: e.target.value };
                                        setMinistryData(d => ({ ...d, schedule: next }));
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="pm-field">
                                  <label>Local</label>
                                  <div className="pm-field-wrap">
                                    <span className="pm-icon">📍</span>
                                    <input
                                      className="pm-input"
                                      value={s.location || ''}
                                      onChange={e => {
                                        const next = [...(ministryData.schedule || [])];
                                        next[idx] = { ...next[idx], location: e.target.value };
                                        setMinistryData(d => ({ ...d, schedule: next }));
                                      }}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                              <label>Descrição</label>
                              <textarea
                                value={s.description || ''}
                                onChange={e => {
                                  const next = [...(ministryData.schedule || [])];
                                  next[idx] = { ...next[idx], description: e.target.value };
                                  setMinistryData(d => ({ ...d, schedule: next }));
                                }}
                                style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                              />
                            </div>
                          </>
                        )}
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.schedule || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, schedule: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({
                        ...d,
                        schedule: [...(d.schedule || []), (ministryId === 'home' ? { day: '', time: '', event: '' } : { activity: '', day: '', time: '', location: '', description: '' })]
                      }))}
                    >
                      + Adicionar Item
                    </button>
                  </div>
                )}
                {ministryTab === 'videos' && (
                  <div style={{ padding: '1.2rem' }}>
                    {ministryId === 'missoes' ? (
                      <>
                        <div className="pm-field">
                          <label>URL do Vídeo - Conheça o Trabalho (YouTube)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">▶</span>
                            <input
                              className="pm-input"
                              value={ministryData?.hero?.videoUrl || ''}
                              onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, videoUrl: e.target.value } }))}
                              placeholder="https://www.youtube.com/watch?v=..."
                            />
                          </div>
                          <p style={{ fontSize: '0.75rem', color: palette.textMuted, marginTop: '0.4rem' }}>
                            Dica: Você pode colar o link normal do YouTube. O sistema converte automaticamente.
                          </p>
                        </div>
                        {ministryData?.hero?.videoUrl && (
                          <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${palette.border}`, background: palette.bg }}>
                            <iframe
                              width="100%"
                              height="240"
                              src={ministryData.hero.videoUrl.includes('embed') ? ministryData.hero.videoUrl : `https://www.youtube.com/embed/${ministryData.hero.videoUrl.split('v=')[1]?.split('&')[0] || ministryData.hero.videoUrl.split('/').pop()}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </>
                    ) : ministryId === 'missoes' ? (
                      <>
                        <div className="pm-field">
                          <label>URL do Vídeo (YouTube)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">▶</span>
                            <input 
                              className="pm-input" 
                              placeholder="https://www.youtube.com/watch?v=..." 
                              value={ministryData?.hero?.videoUrl || ''} 
                              onChange={e => setMinistryData(d => ({ ...d, hero: { ...d.hero, videoUrl: e.target.value } }))} 
                            />
                          </div>
                        </div>
                        {ministryData?.hero?.videoUrl && (
                          <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${palette.border}`, background: palette.bg }}>
                            <iframe
                              width="100%"
                              height="240"
                              src={ministryData.hero.videoUrl.includes('embed') ? ministryData.hero.videoUrl : `https://www.youtube.com/embed/${ministryData.hero.videoUrl.split('v=')[1]?.split('&')[0] || ministryData.hero.videoUrl.split('/').pop()}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div style={{ marginBottom: '1.2rem', color: palette.textMuted, fontSize: '.85rem' }}>
                          Adicione vídeos do YouTube para exibição na galeria {ministryId === 'home' ? 'da página inicial' : 'deste ministério'}.
                        </div>
                        {((ministryId === 'home' ? homeVideos : ministryData?.videos) || []).map((v, idx) => (
                          <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${palette.border}` }}>
                            <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                              <label>Título do Vídeo</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">✏️</span>
                                <input
                                  className="pm-input"
                                  value={v.title || ''}
                                  onChange={e => {
                                    if (ministryId === 'home') {
                                      const next = [...(homeVideos || [])];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      setHomeVideos(next);
                                    } else {
                                      const next = [...(ministryData.videos || [])];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      setMinistryData(d => ({ ...d, videos: next }));
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>URL do YouTube (Embed)</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">▶</span>
                                <input
                                  className="pm-input"
                                  value={v.url || ''}
                                  onChange={e => {
                                    let val = (e.target.value || '').trim();
                                    if (!val.includes('/embed/')) {
                                      const wMatch = val.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                                      const yMatch = val.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                                      const lMatch = val.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
                                      const vidId = (wMatch || yMatch || lMatch || [])[1];
                                      if (vidId) val = `https://www.youtube.com/embed/${vidId}`;
                                    }

                                    if (ministryId === 'home') {
                                      const next = [...(homeVideos || [])];
                                      next[idx] = { ...next[idx], url: val };
                                      setHomeVideos(next);
                                    } else {
                                      const next = [...(ministryData.videos || [])];
                                      next[idx] = { ...next[idx], url: val };
                                      setMinistryData(d => ({ ...d, videos: next }));
                                    }
                                  }}
                                  placeholder="https://www.youtube.com/embed/..."
                                />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Data/Texto Auxiliar</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">📅</span>
                                <input
                                  className="pm-input"
                                  value={v.date || ''}
                                  onChange={e => {
                                    if (ministryId === 'home') {
                                      const next = [...(homeVideos || [])];
                                      next[idx] = { ...next[idx], date: e.target.value };
                                      setHomeVideos(next);
                                    } else {
                                      const next = [...(ministryData.videos || [])];
                                      next[idx] = { ...next[idx], date: e.target.value };
                                      setMinistryData(d => ({ ...d, videos: next }));
                                    }
                                  }}
                                  placeholder="Ex: 2 horas atrás"
                                />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Visualizações (Simulado)</label>
                              <div className="pm-field-wrap">
                                <span className="pm-icon">👁</span>
                                <input
                                  className="pm-input"
                                  value={v.views || ''}
                                  onChange={e => {
                                    if (ministryId === 'home') {
                                      const next = [...(homeVideos || [])];
                                      next[idx] = { ...next[idx], views: e.target.value };
                                      setHomeVideos(next);
                                    } else {
                                      const next = [...(ministryData.videos || [])];
                                      next[idx] = { ...next[idx], views: e.target.value };
                                      setMinistryData(d => ({ ...d, videos: next }));
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                className="btn-deletar"
                                onClick={() => {
                                  if (ministryId === 'home') {
                                    const next = [...(homeVideos || [])];
                                    next.splice(idx, 1);
                                    setHomeVideos(next);
                                  } else {
                                    const next = [...(ministryData.videos || [])];
                                    next.splice(idx, 1);
                                    setMinistryData(d => ({ ...d, videos: next }));
                                  }
                                }}
                              >
                                Remover Vídeo
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          className="pm-add-btn"
                          onClick={() => {
                            const newVid = { title: '', url: '', date: 'Recente', views: '0' };
                            if (ministryId === 'home') {
                              setHomeVideos(v => [...(v || []), newVid]);
                            } else {
                              setMinistryData(d => ({ ...d, videos: [...(d.videos || []), newVid] }));
                            }
                          }}
                        >
                          + Adicionar Novo Vídeo
                        </button>
                      </>
                    )}
                  </div>
                )}
                {ministryTab === 'atividades' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.activities || []).map((a, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Título</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={a.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.activities || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, activities: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Data</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🗓</span>
                            <input
                              className="pm-input"
                              value={a.date || ''}
                              onChange={e => {
                                const next = [...(ministryData.activities || [])];
                                next[idx] = { ...next[idx], date: e.target.value };
                                setMinistryData(d => ({ ...d, activities: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Descrição</label>
                          <textarea
                            value={a.description || ''}
                            onChange={e => {
                              const next = [...(ministryData.activities || [])];
                              next[idx] = { ...next[idx], description: e.target.value };
                              setMinistryData(d => ({ ...d, activities: next }));
                            }}
                            style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={a.image || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  const next = [...(ministryData.activities || [])];
                                  next[idx] = { ...next[idx], image: val };
                                  setMinistryData(d => ({ ...d, activities: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(url => {
                                const next = [...(ministryData.activities || [])];
                                next[idx] = { ...next[idx], image: url };
                                setMinistryData(d => ({ ...d, activities: next }));
                              }, hasSupabase, supabase)}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {a.image ? <div style={{ marginBottom: '.5rem' }}><img src={transformImageLink(a.image)} alt="" style={{ width: 100, height: 60, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /></div> : null}
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.activities || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, activities: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, activities: [...(d.activities || []), { title: '', date: '', description: '', image: '' }] }))}
                    >
                      + Adicionar Atividade
                    </button>
                  </div>
                )}
                {ministryTab === 'cta' && (
                  <div style={{ padding: '1.2rem' }}>
                    <div className="pm-field">
                      <label>Título do CTA</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">✏️</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.title || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, title: e.target.value } }))}
                          placeholder="Ex: Faça Parte da Nossa Família"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Subtítulo do CTA</label>
                      <textarea
                        value={ministryData?.cta?.subtitle || ''}
                        onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, subtitle: e.target.value } }))}
                        placeholder="Ex: Venha nos visitar e experimente o amor de Deus em nossa comunidade"
                        style={{ width: '100%', height: 90, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                      />
                    </div>
                    <div className="pm-field">
                      <label>Texto do Botão Primário</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🏷️</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.primaryBtn || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, primaryBtn: e.target.value } }))}
                          placeholder="Ex: Quero Visitar"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Link do Botão Primário</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🔗</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.primaryLink || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, primaryLink: e.target.value } }))}
                          placeholder="Ex: /contato"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Texto do Botão Secundário</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🏷️</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.secondaryBtn || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, secondaryBtn: e.target.value } }))}
                          placeholder="Ex: Ligar Agora"
                        />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label>Link do Botão Secundário</label>
                      <div className="pm-field-wrap">
                        <span className="pm-icon">🔗</span>
                        <input
                          className="pm-input"
                          value={ministryData?.cta?.secondaryLink || ''}
                          onChange={e => setMinistryData(d => ({ ...d, cta: { ...d.cta, secondaryLink: e.target.value } }))}
                          placeholder="Ex: tel:+5561999999999"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {ministryTab === 'galeria' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.gallery || []).map((g, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span className="pm-icon">🖼</span>
                              <input
                                className="pm-input"
                                value={g.url || ''}
                                onChange={e => {
                                  const val = transformImageLink(e.target.value);
                                  const next = [...(ministryData.gallery || [])];
                                  next[idx] = { ...next[idx], url: val };
                                  setMinistryData(d => ({ ...d, gallery: next }));
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="pm-photo-btn"
                              style={{ whiteSpace: 'nowrap', padding: '0 12px', height: '38px', marginTop: '0' }}
                              onClick={() => handleFileUpload(url => {
                                const next = [...(ministryData.gallery || [])];
                                next[idx] = { ...next[idx], url: url };
                                setMinistryData(d => ({ ...d, gallery: next }));
                              }, hasSupabase, supabase)}
                            >
                              Subir Foto
                            </button>
                          </div>
                        </div>
                        {g.url ? <img src={transformImageLink(g.url)} alt="" style={{ width: 100, height: 60, borderRadius: 8, objectFit: 'cover', border: `1px solid ${palette.border}` }} /> : null}
                        <div className="pm-field">
                          <label>Legenda</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={g.caption || ''}
                              onChange={e => {
                                const next = [...(ministryData.gallery || [])];
                                next[idx] = { ...next[idx], caption: e.target.value };
                                setMinistryData(d => ({ ...d, gallery: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.gallery || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, gallery: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, gallery: [...(d.gallery || []), { url: '', caption: '' }] }))}
                    >
                      + Adicionar Foto
                    </button>
                  </div>
                )}
                {ministryTab === 'estatisticas' && (
                  <div style={{ padding: '1.2rem' }}>
                    <p style={{ color: palette.textMuted, fontSize: '.85rem', marginBottom: '1rem' }}>
                      Defina os números de impacto para as quatro caixas de destaque da página de Missões.
                    </p>
                    {(ministryData?.stats || []).map((s, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                        <div className="pm-field">
                          <label>Ícone (Lucide)</label>
                          <select 
                            className="pm-input" 
                            value={s.icon || 'Globe'} 
                            onChange={e => {
                              const next = [...(ministryData.stats || [])];
                              next[idx] = { ...next[idx], icon: e.target.value };
                              setMinistryData(d => ({ ...d, stats: next }));
                            }}
                            style={{ background: palette.bg, color: palette.text }}
                          >
                            <option value="Globe">Globo</option>
                            <option value="Users">Pessoas</option>
                            <option value="Heart">Coração</option>
                            <option value="Award">Troféu</option>
                            <option value="Target">Alvo</option>
                            <option value="TrendingUp">Gráfico</option>
                            <option value="Droplets">Água/Gota</option>
                            <option value="Book">Livro</option>
                          </select>
                        </div>
                        <div className="pm-field">
                          <label>Número/Valor</label>
                          <input 
                            className="pm-input" 
                            value={s.number || ''} 
                            onChange={e => {
                              const next = [...(ministryData.stats || [])];
                              next[idx] = { ...next[idx], number: e.target.value };
                              setMinistryData(d => ({ ...d, stats: next }));
                            }} 
                            placeholder="Ex: 500+" 
                          />
                        </div>
                        <div className="pm-field">
                          <label>Rótulo</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              className="pm-input" 
                              value={s.label || ''} 
                              onChange={e => {
                                const next = [...(ministryData.stats || [])];
                                next[idx] = { ...next[idx], label: e.target.value };
                                setMinistryData(d => ({ ...d, stats: next }));
                              }} 
                              placeholder="Ex: Vidas Impactadas" 
                            />
                            <button 
                              type="button" 
                              className="btn-deletar" 
                              style={{ padding: '0.4rem' }}
                              onClick={() => {
                                const next = [...(ministryData.stats || [])];
                                next.splice(idx, 1);
                                setMinistryData(d => ({ ...d, stats: next }));
                              }}
                            >✕</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button 
                      className="pm-add-btn" 
                      onClick={() => setMinistryData(d => ({ ...d, stats: [...(d.stats || []), { icon: 'Globe', number: '', label: '' }] }))}
                    >
                      + Adicionar Estatística
                    </button>
                  </div>
                )}
                {ministryTab === 'missionarios' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.missionaries || []).map((m, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', background: palette.surfaceHover, padding: '1rem', borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="pm-field">
                            <label>Nome do Missionário(a) / Família</label>
                            <input className="pm-input" value={m.name || ''} onChange={e => {
                              const next = [...(ministryData.missionaries || [])];
                              next[idx] = { ...next[idx], name: e.target.value };
                              setMinistryData(d => ({ ...d, missionaries: next }));
                            }} />
                          </div>
                          <div className="pm-field">
                            <label>País / Atuação</label>
                            <input className="pm-input" value={m.country || ''} onChange={e => {
                              const next = [...(ministryData.missionaries || [])];
                              next[idx] = { ...next[idx], country: e.target.value };
                              setMinistryData(d => ({ ...d, missionaries: next }));
                            }} />
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Breve Descrição do Trabalho</label>
                            <textarea 
                              className="pm-input" 
                              style={{ height: '70px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} 
                              value={m.description || ''} 
                              onChange={e => {
                                const next = [...(ministryData.missionaries || [])];
                                next[idx] = { ...next[idx], description: e.target.value };
                                setMinistryData(d => ({ ...d, missionaries: next }));
                              }} 
                            />
                          </div>
                          <div className="pm-field">
                            <label>Foto (URL)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input className="pm-input" value={m.photo || ''} onChange={e => {
                                const next = [...(ministryData.missionaries || [])];
                                next[idx] = { ...next[idx], photo: e.target.value };
                                setMinistryData(d => ({ ...d, missionaries: next }));
                              }} />
                              <button type="button" className="pm-photo-btn" onClick={() => handleFileUpload(url => {
                                const next = [...(ministryData.missionaries || [])];
                                next[idx] = { ...next[idx], photo: url };
                                setMinistryData(d => ({ ...d, missionaries: next }));
                              }, hasSupabase, supabase)}>Up</button>
                            </div>
                          </div>
                          <div className="pm-field">
                            <label>Anos no Campo</label>
                            <input type="number" className="pm-input" value={m.yearsOnField || ''} onChange={e => {
                              const next = [...(ministryData.missionaries || [])];
                              next[idx] = { ...next[idx], yearsOnField: parseInt(e.target.value) || 0 };
                              setMinistryData(d => ({ ...d, missionaries: next }));
                            }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                          {m.photo ? <img src={transformImageLink(m.photo)} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} /> : <span>Sem foto</span>}
                          <button 
                            type="button" 
                            className="btn-deletar" 
                            onClick={() => {
                              const next = [...(ministryData.missionaries || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, missionaries: next }));
                            }}
                          >Excluir Missionário</button>
                        </div>
                      </div>
                    ))}
                    <button 
                      className="pm-add-btn" 
                      onClick={() => setMinistryData(d => ({ ...d, missionaries: [...(d.missionaries || []), { name: '', country: '', description: '', photo: '', yearsOnField: 0 }] }))}
                    >
                      + Adicionar Missionário
                    </button>
                  </div>
                )}
                {ministryTab === 'projetos' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.projects || []).map((p, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', background: palette.surfaceHover, padding: '1rem', borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                          <div className="pm-field">
                            <label>Ícone</label>
                            <select 
                              className="pm-input" 
                              value={p.icon || 'Target'} 
                              onChange={e => {
                                const next = [...(ministryData.projects || [])];
                                next[idx] = { ...next[idx], icon: e.target.value };
                                setMinistryData(d => ({ ...d, projects: next }));
                              }}
                              style={{ background: palette.bg, color: palette.text }}
                            >
                              <option value="Target">Alvo</option>
                              <option value="Water">Água</option>
                              <option value="Book">Livro/Educação</option>
                              <option value="Heart">Coração/Social</option>
                              <option value="Globe">Global</option>
                            </select>
                          </div>
                          <div className="pm-field">
                            <label>Título do Projeto</label>
                            <input className="pm-input" value={p.title || ''} onChange={e => {
                              const next = [...(ministryData.projects || [])];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setMinistryData(d => ({ ...d, projects: next }));
                            }} />
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Descrição do Impacto / Objetivos</label>
                            <textarea 
                              className="pm-input" 
                              style={{ height: '70px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} 
                              value={p.description || ''} 
                              onChange={e => {
                                const next = [...(ministryData.projects || [])];
                                next[idx] = { ...next[idx], description: e.target.value };
                                setMinistryData(d => ({ ...d, projects: next }));
                              }} 
                            />
                          </div>
                          <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Resumo de Impacto (Ex: 5 poços construídos)</label>
                            <input className="pm-input" value={p.impact || ''} onChange={e => {
                              const next = [...(ministryData.projects || [])];
                              next[idx] = { ...next[idx], impact: e.target.value };
                              setMinistryData(d => ({ ...d, projects: next }));
                            }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                          <button 
                            type="button" 
                            className="btn-deletar" 
                            onClick={() => {
                              const next = [...(ministryData.projects || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, projects: next }));
                            }}
                          >Remover Projeto</button>
                        </div>
                      </div>
                    ))}
                    <button 
                      className="pm-add-btn" 
                      onClick={() => setMinistryData(d => ({ ...d, projects: [...(d.projects || []), { icon: 'Target', title: '', description: '', impact: '' }] }))}
                    >
                      + Adicionar Projeto
                    </button>
                  </div>
                )}

                {ministryTab === 'bastidores' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.backstage || []).map((b, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Título</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">✏️</span>
                            <input
                              className="pm-input"
                              value={b.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.backstage || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, backstage: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Texto descritivo</label>
                          <textarea
                            value={b.text || ''}
                            onChange={e => {
                              const next = [...(ministryData.backstage || [])];
                              next[idx] = { ...next[idx], text: e.target.value };
                              setMinistryData(d => ({ ...d, backstage: next }));
                            }}
                            style={{ width: '100%', height: 80, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🖼</span>
                            <input
                              className="pm-input"
                              value={b.image || ''}
                              onChange={e => {
                                const next = [...(ministryData.backstage || [])];
                                next[idx] = { ...next[idx], image: e.target.value };
                                setMinistryData(d => ({ ...d, backstage: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Layout</label>
                          <select
                            className="pm-input"
                            value={b.layout || 'left'}
                            onChange={e => {
                              const next = [...(ministryData.backstage || [])];
                              next[idx] = { ...next[idx], layout: e.target.value };
                              setMinistryData(d => ({ ...d, backstage: next }));
                            }}
                            style={{ background: palette.bg, color: palette.text, border: `1px solid ${palette.border}` }}
                          >
                            <option value="left">Imagem Esquerda</option>
                            <option value="right">Imagem Direita</option>
                          </select>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.backstage || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, backstage: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, backstage: [...(d.backstage || []), { title: '', text: '', image: '', layout: 'left' }] }))}
                    >
                      + Adicionar Item Bastidores
                    </button>
                  </div>
                )}
                {ministryTab === 'noticias' && (
                  <div style={{ padding: '1.2rem' }}>
                    {(ministryData?.news || []).map((n, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '.8rem' }}>
                        <div className="pm-field">
                          <label>Título da Notícia</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📰</span>
                            <input
                              className="pm-input"
                              value={n.title || ''}
                              onChange={e => {
                                const next = [...(ministryData.news || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setMinistryData(d => ({ ...d, news: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label>Data</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">📅</span>
                            <input
                              className="pm-input"
                              value={n.date || ''}
                              onChange={e => {
                                const next = [...(ministryData.news || [])];
                                next[idx] = { ...next[idx], date: e.target.value };
                                setMinistryData(d => ({ ...d, news: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Resumo</label>
                          <textarea
                            value={n.summary || ''}
                            onChange={e => {
                              const next = [...(ministryData.news || [])];
                              next[idx] = { ...next[idx], summary: e.target.value };
                              setMinistryData(d => ({ ...d, news: next }));
                            }}
                            style={{ width: '100%', height: 60, background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, fontSize: '.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
                          />
                        </div>
                        <div className="pm-field">
                          <label>Imagem (URL)</label>
                          <div className="pm-field-wrap">
                            <span className="pm-icon">🖼</span>
                            <input
                              className="pm-input"
                              value={n.image || ''}
                              onChange={e => {
                                const next = [...(ministryData.news || [])];
                                next[idx] = { ...next[idx], image: e.target.value };
                                setMinistryData(d => ({ ...d, news: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="pm-field">
                          <label style={{ visibility: 'hidden' }}>x</label>
                          <button
                            className="btn-deletar"
                            onClick={() => {
                              const next = [...(ministryData.news || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, news: next }));
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      className="pm-add-btn"
                      onClick={() => setMinistryData(d => ({ ...d, news: [...(d.news || []), { title: '', summary: '', image: '', date: '' }] }))}
                    >
                      + Adicionar Notícia
                    </button>
                  </div>
                )}
                {ministryTab === 'paginas' && (
                  <div style={{ padding: '0.2rem' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: palette.text }}>Páginas da Revista</h4>
                      <button 
                        type="button"
                        className="pm-add-btn" 
                        style={{ margin: 0 }}
                        onClick={() => {
                          const newPage = { id: Date.now(), type: 'article', category: 'Nova Categoria', title: 'Novo Artigo', body: 'Conteúdo aqui...' };
                          setMinistryData(d => ({ ...d, pages: [...(d.pages || []), newPage] }));
                        }}
                      >
                        + Adicionar Página
                      </button>
                    </div>
                    
                    {(ministryData?.pages || []).map((page, idx) => (
                      <div key={idx} className="pm-row" style={{ marginBottom: '1.5rem', background: palette.surfaceHover, padding: '1rem', borderRadius: '12px', border: `1px solid ${palette.border}` }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: `1px solid ${palette.border}`, paddingBottom: '0.5rem' }}>
                          <div className="pm-field" style={{ flex: 1 }}>
                            <label>Tipo de Página</label>
                            <select 
                              className="pm-input" 
                              value={page.type || 'article'} 
                              onChange={e => {
                                const next = [...(ministryData.pages || [])];
                                next[idx] = { ...next[idx], type: e.target.value };
                                if (e.target.value === 'index' && !next[idx].items) next[idx].items = [];
                                if (e.target.value === 'devotional' && !next[idx].items) next[idx].items = [];
                                if (e.target.value === 'feature' && !next[idx].events) next[idx].events = [];
                                if (e.target.value === 'columnist' && !next[idx].author) next[idx].author = { name: '', role: '', image: '', bio: '' };
                                setMinistryData(d => ({ ...d, pages: next }));
                              }}
                              style={{ background: palette.bg, color: palette.text }}
                            >
                              <option value="cover">Capa</option>
                              <option value="index">Índice</option>
                              <option value="article">Artigo</option>
                              <option value="columnist">Colunista</option>
                              <option value="devotional">Devocional</option>
                              <option value="feature">Destaque/Agenda</option>
                            </select>
                          </div>
                          <button 
                            type="button"
                            className="btn-deletar" 
                            style={{ alignSelf: 'center' }}
                            onClick={() => {
                              const next = [...(ministryData.pages || [])];
                              next.splice(idx, 1);
                              setMinistryData(d => ({ ...d, pages: next }));
                            }}
                          >
                            Excluir
                          </button>
                        </div>

                        {/* Fields based on type */}
                        {page.type === 'cover' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
                            <div className="pm-field">
                              <label>Edição</label>
                              <input className="pm-input" value={page.edition || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], edition: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                            </div>
                            <div className="pm-field">
                              <label>Título da Capa</label>
                              <input className="pm-input" value={page.title || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], title: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                            </div>
                            <div className="pm-field">
                              <label>Subtítulo</label>
                              <input className="pm-input" value={page.subtitle || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], subtitle: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                            </div>
                            <div className="pm-field">
                              <label>Imagem de Fundo</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input className="pm-input" value={page.image || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], image: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                                <button type="button" className="pm-photo-btn" onClick={() => handleFileUpload(url => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], image: url }; setMinistryData(d => ({...d, pages: next})); }, hasSupabase, supabase)}>Upload</button>
                              </div>
                            </div>
                          </div>
                        )}

                        {(page.type === 'article' || page.type === 'columnist' || page.type === 'devotional' || page.type === 'feature') && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', width: '100%' }}>
                            <div className="pm-field">
                              <label>Categoria</label>
                              <input className="pm-input" value={page.category || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], category: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                            </div>
                            <div className="pm-field">
                              <label>Título</label>
                              <input className="pm-input" value={page.title || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], title: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                            </div>
                          </div>
                        )}

                        {page.type === 'article' && (
                          <div style={{ width: '100%' }}>
                            <div className="pm-field">
                              <label>Imagem do Artigo</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input className="pm-input" value={page.image || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], image: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} />
                                <button type="button" className="pm-photo-btn" onClick={() => handleFileUpload(url => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], image: url }; setMinistryData(d => ({...d, pages: next})); }, hasSupabase, supabase)}>Upload</button>
                              </div>
                            </div>
                            <div className="pm-field" style={{ gridColumn: '1 / -1' }}>
                              <label>Conteúdo (use \n para parágrafos)</label>
                              <textarea 
                                className="pm-input" 
                                style={{ height: '150px', whiteSpace: 'pre-wrap', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} 
                                value={page.body || ''} 
                                onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], body: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} 
                              />
                            </div>
                          </div>
                        )}

                        {page.type === 'columnist' && (
                          <div style={{ width: '100%' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem', border: `1px solid ${palette.border}`, padding: '0.8rem', borderRadius: '8px' }}>
                              <div className="pm-field" style={{ gridColumn: '1 / -1' }}><label style={{ fontWeight: 600 }}>Dados do Autor</label></div>
                              <div className="pm-field">
                                <label>Nome do Autor</label>
                                <input className="pm-input" value={page.author?.name || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, name: e.target.value } }; setMinistryData(d => ({...d, pages: next})); }} />
                              </div>
                              <div className="pm-field">
                                <label>Cargo/Papel</label>
                                <input className="pm-input" value={page.author?.role || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, role: e.target.value } }; setMinistryData(d => ({...d, pages: next})); }} />
                              </div>
                              <div className="pm-field">
                                <label>Foto do Autor</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input className="pm-input" value={page.author?.image || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, image: e.target.value } }; setMinistryData(d => ({...d, pages: next})); }} />
                                  <button type="button" className="pm-photo-btn" onClick={() => handleFileUpload(url => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, image: url } }; setMinistryData(d => ({...d, pages: next})); }, hasSupabase, supabase)}>Up</button>
                                </div>
                              </div>
                              <div className="pm-field">
                                <label>Biografia Curta</label>
                                <input className="pm-input" value={page.author?.bio || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], author: { ...next[idx].author, bio: e.target.value } }; setMinistryData(d => ({...d, pages: next})); }} />
                              </div>
                            </div>
                            <div className="pm-field">
                              <label>Conteúdo (use &lt;quote&gt;...&lt;/quote&gt; para citações)</label>
                              <textarea 
                                className="pm-input" 
                                style={{ height: '150px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} 
                                value={page.body || ''} 
                                onChange={e => { const next = [...(ministryData.pages)]; next[idx] = { ...next[idx], body: e.target.value }; setMinistryData(d => ({...d, pages: next})); }} 
                              />
                            </div>
                          </div>
                        )}

                        {page.type === 'index' && (
                          <div style={{ width: '100%' }}>
                            <label>Itens do Índice</label>
                            {(page.items || []).map((item, iIdx) => (
                              <div key={iIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 2 }}>
                                  <label style={{ fontSize: '0.75rem' }}>Rótulo</label>
                                  <input className="pm-input" value={item.label || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[iIdx].label = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: '0.75rem' }}>Página</label>
                                  <input type="number" className="pm-input" value={item.page || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[iIdx].page = parseInt(e.target.value); setMinistryData(d => ({...d, pages: next})); }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: '0.75rem' }}>Ícone</label>
                                  <select className="pm-input" style={{ background: palette.bg, color: palette.text }} value={item.icon || 'BookOpen'} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[iIdx].icon = e.target.value; setMinistryData(d => ({...d, pages: next})); }}>
                                    <option value="BookOpen">Livro</option>
                                    <option value="PenTool">Caneta</option>
                                    <option value="Sun">Sol</option>
                                    <option value="Calendar">Calendário</option>
                                    <option value="Heart">Coração</option>
                                    <option value="Star">Estrela</option>
                                    <option value="Users">Pessoas</option>
                                  </select>
                                </div>
                                <button type="button" className="btn-deletar" style={{ padding: '0.4rem', marginBottom: '4px' }} onClick={() => { const next = [...(ministryData.pages)]; next[idx].items.splice(iIdx, 1); setMinistryData(d => ({...d, pages: next})); }}>✕</button>
                              </div>
                            ))}
                            <button type="button" className="pm-add-btn" onClick={() => { const next = [...(ministryData.pages)]; next[idx].items = [...(next[idx].items || []), { label: '', page: 1, icon: 'BookOpen' }]; setMinistryData(d => ({...d, pages: next})); }}>+ Adicionar Item</button>
                          </div>
                        )}

                        {page.type === 'devotional' && (
                          <div style={{ width: '100%' }}>
                            <label>Devocionais Diários</label>
                            {(page.items || []).map((item, dIdx) => (
                              <div key={dIdx} style={{ marginBottom: '1rem', border: `1px solid ${palette.border}`, padding: '0.8rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                  <input placeholder="Data (Ex: 01 DEZ)" className="pm-input" value={item.date || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[dIdx].date = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                  <input placeholder="Título" className="pm-input" value={item.title || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[dIdx].title = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                </div>
                                <textarea placeholder="Texto reflexivo" className="pm-input" style={{ height: '80px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} value={item.text || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].items[dIdx].text = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                <button type="button" className="btn-deletar" style={{ marginTop: '0.5rem' }} onClick={() => { const next = [...(ministryData.pages)]; next[idx].items.splice(dIdx, 1); setMinistryData(d => ({...d, pages: next})); }}>Remover Devocional</button>
                              </div>
                            ))}
                            <button type="button" className="pm-add-btn" onClick={() => { const next = [...(ministryData.pages)]; next[idx].items = [...(next[idx].items || []), { date: '', title: '', text: '' }]; setMinistryData(d => ({...d, pages: next})); }}>+ Adicionar Devocional</button>
                          </div>
                        )}

                        {page.type === 'feature' && (
                          <div style={{ width: '100%' }}>
                            <div className="pm-field">
                              <label>Destaque (Caixa Amarela)</label>
                              <textarea className="pm-input" style={{ height: '60px', background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 10, padding: 12, outline: 'none', resize: 'vertical' }} value={page.highlight || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].highlight = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                            </div>
                            <label>Eventos / Agenda</label>
                            {(page.events || []).map((event, eIdx) => (
                              <div key={eIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input placeholder="Data (07/12)" className="pm-input" style={{ flex: 1 }} value={event.date || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].events[eIdx].date = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                <input placeholder="Evento" className="pm-input" style={{ flex: 3 }} value={event.title || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].events[eIdx].title = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                <input placeholder="Hora" className="pm-input" style={{ flex: 1 }} value={event.time || ''} onChange={e => { const next = [...(ministryData.pages)]; next[idx].events[eIdx].time = e.target.value; setMinistryData(d => ({...d, pages: next})); }} />
                                <button type="button" className="btn-deletar" onClick={() => { const next = [...(ministryData.pages)]; next[idx].events.splice(eIdx, 1); setMinistryData(d => ({...d, pages: next})); }}>✕</button>
                              </div>
                            ))}
                            <button type="button" className="pm-add-btn" onClick={() => { const next = [...(ministryData.pages)]; next[idx].events = [...(next[idx].events || []), { date: '', title: '', time: '' }]; setMinistryData(d => ({...d, pages: next})); }}>+ Adicionar Evento</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
  );
}
