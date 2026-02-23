import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Plus, Trash2, FileText,
    Image, Users, AlignLeft, Calendar, Layout,
    Globe, Shield, Play, MessageSquare, BookOpen
} from 'lucide-react';
import DatabaseService from '../../services/DatabaseService';
import ImageUploadField from '../components/ImageUploadField';
import './PageEditor.css';

const PageEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('geral');
    const [pageInfo, setPageInfo] = useState(null); // Metadata from admac_pages
    const [pageData, setPageData] = useState(null); // Content data
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Find page metadata
            const allPages = await DatabaseService.getPages();
            const foundPage = allPages.find(p => p.id === id);
            setPageInfo(foundPage);

            // 2. Fetch content data
            if (foundPage?.type === 'system') {
                const data = await DatabaseService.getMinistry(id);
                setPageData(data || {});
            } else {
                // For dynamic pages, content is in the page object itself
                setPageData(foundPage || {});
            }
        } catch (error) {
            console.error("Error loading page data:", error);
        } finally {
            setLoading(false);
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            if (pageInfo?.type === 'system') {
                await DatabaseService.saveMinistry(id, pageData);
            } else {
                // For dynamic pages, update the page info in the list
                await DatabaseService.updatePage(id, pageData);
            }
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (error) {
            console.error("Error saving page data:", error);
            setSaving(false);
        }
    };

    // --- Helpers for data updates ---
    const updateGeral = (section, field, value) => {
        setPageData({
            ...pageData,
            [section]: {
                ...(pageData[section] || {}),
                [field]: value
            }
        });
    };

    const updateNestedArray = (arrayName, index, field, value) => {
        const newArray = [...(pageData[arrayName] || [])];
        newArray[index] = { ...newArray[index], [field]: value };
        setPageData({ ...pageData, [arrayName]: newArray });
    };

    const addItemToArray = (arrayName, emptyTemplate) => {
        const newArray = [...(pageData[arrayName] || []), emptyTemplate];
        setPageData({ ...pageData, [arrayName]: newArray });
    };

    const removeItemFromArray = (arrayName, index) => {
        const newArray = (pageData[arrayName] || []).filter((_, i) => i !== index);
        setPageData({ ...pageData, [arrayName]: newArray });
    };

    if (loading) return <div className="pe-loading">Carregando editor da página...</div>;

    const isSystemPage = pageInfo?.type === 'system';

    const tabs = [
        { id: 'geral', label: 'Geral', icon: Layout },
        { id: 'equipe', label: 'Equipe', icon: Users },
        { id: 'programaçao', label: 'Programação', icon: Calendar },
        { id: 'galeria', label: 'Galeria', icon: Image },
        { id: 'testemunhos', label: 'Testemunhos', icon: MessageSquare },
    ];

    if (id === 'revista') {
        tabs.push({ id: 'paginas', label: 'Páginas da Revista', icon: BookOpen });
    }

    if (!isSystemPage) {
        tabs.push({ id: 'conteudo', label: 'Conteúdo', icon: FileText });
    }

    return (
        <div className="pe-root">
            {/* Header */}
            <div className="pe-header">
                <button className="pe-back" onClick={() => navigate('/painel/content/pages')}>
                    <ArrowLeft size={18} /> Voltar
                </button>
                <div className="pe-title">
                    <Globe size={22} />
                    <span>Editor: {pageInfo?.name || 'Página'}</span>
                </div>
                <button className={`pe-save-btn ${saved ? 'pe-saved' : ''}`} onClick={save} disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Salvando...' : saved ? 'Salvo ✓' : 'Salvar'}
                </button>
            </div>

            {/* Tabs */}
            <div className="pe-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`pe-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="pe-content">

                {/* --- TAB: GERAL --- */}
                {activeTab === 'geral' && (
                    <div className="pe-section">
                        <div className="pe-section-header">
                            <h2>Cabeçalho (Hero)</h2>
                        </div>
                        <div className="pe-card">
                            <div className="pe-fields">
                                <label>Título Principal</label>
                                <input
                                    type="text"
                                    value={pageData?.hero?.title || ''}
                                    onChange={e => updateGeral('hero', 'title', e.target.value)}
                                />
                                <label>Subtítulo</label>
                                <input
                                    type="text"
                                    value={pageData?.hero?.subtitle || ''}
                                    onChange={e => updateGeral('hero', 'subtitle', e.target.value)}
                                />
                                <label>Versículo em Destaque</label>
                                <input
                                    type="text"
                                    value={pageData?.hero?.verse || ''}
                                    onChange={e => updateGeral('hero', 'verse', e.target.value)}
                                />
                                <label>URL de Vídeo (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Link do YouTube (embed)"
                                    value={pageData?.hero?.videoUrl || ''}
                                    onChange={e => updateGeral('hero', 'videoUrl', e.target.value)}
                                />
                                <label>Imagem de Fundo</label>
                                <ImageUploadField
                                    value={pageData?.hero?.image || ''}
                                    onChange={val => updateGeral('hero', 'image', val)}
                                />
                            </div>
                        </div>

                        <div className="pe-section-header" style={{ marginTop: '2rem' }}>
                            <h2>Missão / Sobre</h2>
                        </div>
                        <div className="pe-card">
                            <div className="pe-fields">
                                <label>Título da Seção</label>
                                <input
                                    type="text"
                                    value={pageData?.mission?.title || ''}
                                    onChange={e => updateGeral('mission', 'title', e.target.value)}
                                />
                                <label>Texto Descritivo</label>
                                <textarea
                                    rows={5}
                                    value={pageData?.mission?.text || ''}
                                    onChange={e => updateGeral('mission', 'text', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: EQUIPE --- */}
                {activeTab === 'equipe' && (
                    <div className="pe-section">
                        <div className="pe-section-header">
                            <h2>Membros da Equipe / Líderes</h2>
                            <button className="pe-add-btn" onClick={() => addItemToArray('team', { name: '', role: '', photo: '' })}>
                                <Plus size={16} /> Adicionar Membro
                            </button>
                        </div>
                        {(pageData?.team || []).map((member, i) => (
                            <div key={i} className="pe-card">
                                <div className="pe-card-head">
                                    <span className="pe-card-label">{member.name || `Membro ${i + 1}`}</span>
                                    <button className="pe-remove-btn" onClick={() => removeItemFromArray('team', i)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <div className="pe-team-row">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <img
                                            src={member.photo || 'https://ui-avatars.com/api/?name=?'}
                                            alt="avatar"
                                            className="pe-team-thumb"
                                        />
                                        <ImageUploadField
                                            value={member.photo}
                                            onChange={val => updateNestedArray('team', i, 'photo', val)}
                                        />
                                    </div>
                                    <div className="pe-fields" style={{ flex: 1 }}>
                                        <label>Nome Completo</label>
                                        <input
                                            type="text"
                                            value={member.name}
                                            onChange={e => updateNestedArray('team', i, 'name', e.target.value)}
                                        />
                                        <label>Cargo / Função</label>
                                        <input
                                            type="text"
                                            value={member.role}
                                            onChange={e => updateNestedArray('team', i, 'role', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TAB: PROGRAMAÇÃO --- */}
                {activeTab === 'programaçao' && (
                    <div className="pe-section">
                        <div className="pe-section-header">
                            <h2>Atividades e Horários</h2>
                            <button className="pe-add-btn" onClick={() => addItemToArray('schedule', { activity: '', day: '', time: '', location: '', description: '' })}>
                                <Plus size={16} /> Adicionar Horário
                            </button>
                        </div>
                        {(pageData?.schedule || []).map((item, i) => (
                            <div key={i} className="pe-card">
                                <div className="pe-card-head">
                                    <span className="pe-card-label">{item.activity || `Atividade ${i + 1}`}</span>
                                    <button className="pe-remove-btn" onClick={() => removeItemFromArray('schedule', i)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <div className="pe-fields">
                                    <div className="pe-fields-grid3">
                                        <div>
                                            <label>Atividade</label>
                                            <input
                                                type="text"
                                                value={item.activity}
                                                onChange={e => updateNestedArray('schedule', i, 'activity', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label>Dia / Data</label>
                                            <input
                                                type="text"
                                                value={item.day || item.date || ''}
                                                onChange={e => updateNestedArray('schedule', i, 'day', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label>Horário</label>
                                            <input
                                                type="text"
                                                value={item.time}
                                                onChange={e => updateNestedArray('schedule', i, 'time', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <label>Localização</label>
                                    <input
                                        type="text"
                                        value={item.location}
                                        onChange={e => updateNestedArray('schedule', i, 'location', e.target.value)}
                                    />
                                    <label>Descrição Curta</label>
                                    <textarea
                                        rows={2}
                                        value={item.description}
                                        onChange={e => updateNestedArray('schedule', i, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TAB: GALERIA --- */}
                {activeTab === 'galeria' && (
                    <div className="pe-section">
                        <div className="pe-section-header">
                            <h2>Galeria de Fotos</h2>
                            <button className="pe-add-btn" onClick={() => addItemToArray('gallery', { url: '', caption: '' })}>
                                <Plus size={16} /> Adicionar Foto
                            </button>
                        </div>
                        <div className="pe-gallery-grid">
                            {(pageData?.gallery || []).map((item, i) => (
                                <div key={i} className="pe-card">
                                    <div className="pe-card-head">
                                        <span className="pe-card-label">Foto {i + 1}</span>
                                        <button className="pe-remove-btn" onClick={() => removeItemFromArray('gallery', i)}>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                    <div className="pe-preview-wrap">
                                        <img src={item.url} alt="preview" className="pe-img-preview" onError={e => e.target.src = 'https://placehold.co/400x300?text=Sem+Imagem'} />
                                    </div>
                                    <div className="pe-fields">
                                        <label>Escolher Imagem</label>
                                        <ImageUploadField
                                            value={item.url}
                                            onChange={val => updateNestedArray('gallery', i, 'url', val)}
                                        />
                                        <label>Legenda</label>
                                        <input
                                            type="text"
                                            value={item.caption}
                                            onChange={e => updateNestedArray('gallery', i, 'caption', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: TESTEMUNHOS --- */}
                {activeTab === 'testemunhos' && (
                    <div className="pe-section">
                        <div className="pe-section-header">
                            <h2>Testemunhos de Membros</h2>
                            <button className="pe-add-btn" onClick={() => addItemToArray('testimonials', { name: '', text: '', photo: '', age: '' })}>
                                <Plus size={16} /> Adicionar Testemunho
                            </button>
                        </div>
                        {(pageData?.testimonials || []).map((item, i) => (
                            <div key={i} className="pe-card">
                                <div className="pe-card-head">
                                    <span className="pe-card-label">{item.name || `Testemunho ${i + 1}`}</span>
                                    <button className="pe-remove-btn" onClick={() => removeItemFromArray('testimonials', i)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <div className="pe-fields">
                                    <div className="pe-fields-grid3">
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label>Nome do Autor</label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={e => updateNestedArray('testimonials', i, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label>Idade (opcional)</label>
                                            <input
                                                type="text"
                                                value={item.age || ''}
                                                onChange={e => updateNestedArray('testimonials', i, 'age', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <label>Foto do Autor (URL ou Upload)</label>
                                    <ImageUploadField
                                        value={item.photo}
                                        onChange={val => updateNestedArray('testimonials', i, 'photo', val)}
                                    />
                                    <label>Depoimento</label>
                                    <textarea
                                        rows={3}
                                        value={item.text}
                                        onChange={e => updateNestedArray('testimonials', i, 'text', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TAB: PÁGINAS DA REVISTA --- */}
                {activeTab === 'paginas' && (
                    <div className="pe-section">
                        <div className="pe-section-header">
                            <h2>Editor de Páginas da Revista</h2>
                            <button className="pe-add-btn" onClick={() => addItemToArray('pages', { type: 'article', title: 'Nova Página', body: '', category: '' })}>
                                <Plus size={16} /> Nova Página
                            </button>
                        </div>
                        <div className="pe-alert" style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', fontSize: '0.9rem', color: '#ffd700', border: '1px solid rgba(255,215,0,0.2)' }}>
                            <Shield size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Aqui você gerencia as páginas internas da revista digital.
                        </div>
                        {(pageData?.pages || []).map((item, i) => (
                            <div key={i} className="pe-card">
                                <div className="pe-card-head">
                                    <span className="pe-card-label">Página {i + 1}: {item.type}</span>
                                    <button className="pe-remove-btn" onClick={() => removeItemFromArray('pages', i)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <div className="pe-fields">
                                    <div className="pe-fields-grid3">
                                        <div>
                                            <label>Tipo de Página</label>
                                            <select value={item.type} onChange={e => updateNestedArray('pages', i, 'type', e.target.value)}>
                                                <option value="cover">Capa</option>
                                                <option value="index">Índice / Sumário</option>
                                                <option value="article">Artigo / Matéria</option>
                                                <option value="columnist">Colunista</option>
                                                <option value="devotional">Devocional</option>
                                                <option value="feature">Agenda / Destaque</option>
                                            </select>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label>Título da Página</label>
                                            <input
                                                type="text"
                                                value={item.title || ''}
                                                onChange={e => updateNestedArray('pages', i, 'title', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {item.type === 'cover' && (
                                        <>
                                            <label>Edição / Badge</label>
                                            <input type="text" value={item.edition || ''} onChange={e => updateNestedArray('pages', i, 'edition', e.target.value)} />
                                            <label>Subtítulo Capa</label>
                                            <input type="text" value={item.subtitle || ''} onChange={e => updateNestedArray('pages', i, 'subtitle', e.target.value)} />
                                        </>
                                    )}

                                    {(item.type === 'article' || item.type === 'columnist' || item.type === 'devotional' || item.type === 'feature') && (
                                        <>
                                            <label>Categoria</label>
                                            <input type="text" value={item.category || ''} onChange={e => updateNestedArray('pages', i, 'category', e.target.value)} />
                                        </>
                                    )}

                                    {(item.type === 'article' || item.type === 'cover') && (
                                        <>
                                            <label>Imagem Principal</label>
                                            <ImageUploadField value={item.image} onChange={val => updateNestedArray('pages', i, 'image', val)} />
                                        </>
                                    )}

                                    {(item.type === 'article' || item.type === 'columnist') && (
                                        <>
                                            <label>Corpo do Texto</label>
                                            <textarea rows={6} value={item.body} onChange={e => updateNestedArray('pages', i, 'body', e.target.value)} />
                                        </>
                                    )}

                                    {item.type === 'columnist' && item.author && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <label style={{ color: '#ffd700' }}>Dados do Colunista</label>
                                            <div className="pe-fields" style={{ marginTop: '0.5rem' }}>
                                                <label>Nome</label>
                                                <input type="text" value={item.author.name} onChange={e => {
                                                    const newAuthor = { ...item.author, name: e.target.value };
                                                    updateNestedArray('pages', i, 'author', newAuthor);
                                                }} />
                                                <label>Cargo</label>
                                                <input type="text" value={item.author.role} onChange={e => {
                                                    const newAuthor = { ...item.author, role: e.target.value };
                                                    updateNestedArray('pages', i, 'author', newAuthor);
                                                }} />
                                                <label>Foto do Autor</label>
                                                <ImageUploadField value={item.author.image} onChange={val => {
                                                    const newAuthor = { ...item.author, image: val };
                                                    updateNestedArray('pages', i, 'author', newAuthor);
                                                }} />
                                                <label>Bio Curta</label>
                                                <textarea rows={3} value={item.author.bio} onChange={e => {
                                                    const newAuthor = { ...item.author, bio: e.target.value };
                                                    updateNestedArray('pages', i, 'author', newAuthor);
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TAB: CONTEÚDO (Dynamic Pages) --- */}
                {activeTab === 'conteudo' && (
                    <div className="pe-section">
                        <div className="pe-section-header">
                            <h2>Conteúdo da Página</h2>
                        </div>
                        <div className="pe-content-editor">
                            <div className="pe-fields">
                                <label>Texto / HTML da Página</label>
                                <textarea
                                    className="pe-textarea-large"
                                    value={pageData?.content || ''}
                                    onChange={e => setPageData({ ...pageData, content: e.target.value })}
                                    placeholder="Digite o conteúdo da sua página aqui..."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageEditor;
