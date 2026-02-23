import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Plus, Trash2, Home,
    Image, Users, AlignLeft, Calendar, Activity
} from 'lucide-react';
import DatabaseService from '../../services/DatabaseService';
import ImageUploadField from '../components/ImageUploadField';
import './HomeEditor.css';

const TABS = [
    { id: 'carousel', label: 'Carrossel', icon: Image },
    { id: 'pastors', label: 'Pastores', icon: Users },
    { id: 'welcome', label: 'Boas-vindas', icon: AlignLeft },
    { id: 'schedule', label: 'Programação', icon: Calendar },
    { id: 'activities', label: 'Atividades', icon: Activity },
];

const emptyCarouselSlide = () => ({ image: '', title: '', subtitle: '' });
const emptyPastor = () => ({ name: '', title: '', verse: '', image: '' });
const emptyScheduleItem = () => ({ day: '', time: '', event: '' });
const emptyActivity = () => ({ title: '', date: '', description: '', image: '' });

const HomeEditor = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('carousel');
    const [data, setData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        DatabaseService.getHomeData().then(setData);
    }, []);

    const save = async () => {
        setSaving(true);
        await DatabaseService.saveHomeData(data);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    // ── Carousel helpers ────────────────────────────
    const updateSlide = (i, field, val) => {
        const carousel = [...data.carousel];
        carousel[i] = { ...carousel[i], [field]: val };
        setData({ ...data, carousel });
    };
    const addSlide = () => setData({ ...data, carousel: [...data.carousel, emptyCarouselSlide()] });
    const removeSlide = (i) => setData({ ...data, carousel: data.carousel.filter((_, idx) => idx !== i) });

    // ── Pastor helpers ───────────────────────────────
    const updatePastor = (i, field, val) => {
        const pastors = [...(data.pastors || [])];
        pastors[i] = { ...pastors[i], [field]: val };
        setData({ ...data, pastors });
    };
    const addPastor = () => setData({ ...data, pastors: [...(data.pastors || []), emptyPastor()] });
    const removePastor = (i) => setData({ ...data, pastors: (data.pastors || []).filter((_, idx) => idx !== i) });

    // ── Welcome helpers ──────────────────────────────
    const updateWelcome = (field, val) => setData({ ...data, welcome: { ...data.welcome, [field]: val } });

    // ── Schedule helpers ─────────────────────────────
    const updateSchedule = (i, field, val) => {
        const schedule = [...data.schedule];
        schedule[i] = { ...schedule[i], [field]: val };
        setData({ ...data, schedule });
    };
    const addSchedule = () => setData({ ...data, schedule: [...data.schedule, emptyScheduleItem()] });
    const removeSchedule = (i) => setData({ ...data, schedule: data.schedule.filter((_, idx) => idx !== i) });

    // ── Activities helpers ───────────────────────────
    const updateActivity = (i, field, val) => {
        const activities = [...data.activities];
        activities[i] = { ...activities[i], [field]: val };
        setData({ ...data, activities });
    };
    const addActivity = () => setData({ ...data, activities: [...data.activities, emptyActivity()] });
    const removeActivity = (i) => setData({ ...data, activities: data.activities.filter((_, idx) => idx !== i) });

    if (!data) return <div className="he-loading">Carregando dados da Home...</div>;

    return (
        <div className="he-root">
            {/* Header */}
            <div className="he-header">
                <button className="he-back" onClick={() => navigate('/painel/content/pages')}>
                    <ArrowLeft size={18} /> Voltar
                </button>
                <div className="he-title">
                    <Home size={22} />
                    <span>Editor da Página Home</span>
                </div>
                <button className={`he-save-btn ${saved ? 'he-saved' : ''}`} onClick={save} disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Salvando...' : saved ? 'Salvo ✓' : 'Salvar'}
                </button>
            </div>

            {/* Tabs */}
            <div className="he-tabs">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`he-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="he-content">

                {/* ── CARROSSEL ── */}
                {activeTab === 'carousel' && (
                    <div className="he-section">
                        <div className="he-section-header">
                            <h2>Slides do Carrossel</h2>
                            <button className="he-add-btn" onClick={addSlide}><Plus size={16} /> Adicionar Slide</button>
                        </div>
                        {data?.carousel?.map((slide, i) => (
                            <div key={i} className="he-card">
                                <div className="he-card-head">
                                    <span className="he-card-label">Slide {i + 1}</span>
                                    <button className="he-remove-btn" onClick={() => removeSlide(i)} disabled={data.carousel.length <= 1}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                {slide.image && (
                                    <div className="he-preview-wrap">
                                        <img src={slide.image} alt="preview" className="he-img-preview" onError={e => e.target.style.display = 'none'} />
                                    </div>
                                )}
                                <div className="he-fields">
                                    <label>Imagem do Slide</label>
                                    <ImageUploadField
                                        value={slide.image}
                                        onChange={val => updateSlide(i, 'image', val)}
                                    />
                                    <label>Título</label>
                                    <input type="text" value={slide.title} placeholder="Ex.: Culto de Louvor" onChange={e => updateSlide(i, 'title', e.target.value)} />
                                    <label>Subtítulo</label>
                                    <input type="text" value={slide.subtitle} placeholder="Ex.: Venha adorar Deus conosco" onChange={e => updateSlide(i, 'subtitle', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── PASTORES ── */}
                {activeTab === 'pastors' && (
                    <div className="he-section">
                        <div className="he-section-header">
                            <h2>Pastores / Líderes</h2>
                            <button className="he-add-btn" onClick={addPastor}><Plus size={16} /> Adicionar</button>
                        </div>
                        {(data.pastors || []).map((pastor, i) => (
                            <div key={i} className="he-card">
                                <div className="he-card-head">
                                    <span className="he-card-label">{pastor.name || `Pastor ${i + 1}`}</span>
                                    <button className="he-remove-btn" onClick={() => removePastor(i)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <div className="he-pastor-row">
                                    {pastor.image && (
                                        <img src={pastor.image} alt="foto" className="he-pastor-thumb" onError={e => e.target.style.display = 'none'} />
                                    )}
                                    <div className="he-fields he-fields-flex">
                                        <label>Nome</label>
                                        <input type="text" value={pastor.name} placeholder="Ex.: Pastor Roberto Silva" onChange={e => updatePastor(i, 'name', e.target.value)} />
                                        <label>Cargo / Título</label>
                                        <input type="text" value={pastor.title} placeholder="Ex.: Pastor Presidente" onChange={e => updatePastor(i, 'title', e.target.value)} />
                                        <label>Versículo</label>
                                        <input type="text" value={pastor.verse} placeholder='Ex.: "João 3:16..."' onChange={e => updatePastor(i, 'verse', e.target.value)} />
                                        <label>Foto do Pastor</label>
                                        <ImageUploadField
                                            value={pastor.image}
                                            onChange={val => updatePastor(i, 'image', val)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── BOAS-VINDAS ── */}
                {activeTab === 'welcome' && (
                    <div className="he-section">
                        <div className="he-section-header">
                            <h2>Seção de Boas-vindas</h2>
                        </div>
                        <div className="he-card">
                            <div className="he-fields">
                                <label>Título</label>
                                <input type="text" value={data.welcome?.title || ''} placeholder="Ex.: Bem-vindo à ADMAC" onChange={e => updateWelcome('title', e.target.value)} />
                                <label>Parágrafo 1</label>
                                <textarea rows={4} value={data.welcome?.text1 || ''} placeholder="Texto de boas-vindas..." onChange={e => updateWelcome('text1', e.target.value)} />
                                <label>Parágrafo 2</label>
                                <textarea rows={4} value={data.welcome?.text2 || ''} placeholder="Continuação do texto..." onChange={e => updateWelcome('text2', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── PROGRAMAÇÃO ── */}
                {activeTab === 'schedule' && (
                    <div className="he-section">
                        <div className="he-section-header">
                            <h2>Programação Semanal</h2>
                            <button className="he-add-btn" onClick={addSchedule}><Plus size={16} /> Adicionar</button>
                        </div>
                        {data?.schedule?.map((item, i) => (
                            <div key={i} className="he-card he-card-inline">
                                <div className="he-card-head">
                                    <span className="he-card-label">{item.day || `Item ${i + 1}`} — {item.event}</span>
                                    <button className="he-remove-btn" onClick={() => removeSchedule(i)} disabled={data.schedule.length <= 1}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <div className="he-fields he-fields-grid3">
                                    <div>
                                        <label>Dia</label>
                                        <input type="text" value={item.day} placeholder="Ex.: Domingo" onChange={e => updateSchedule(i, 'day', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Horário</label>
                                        <input type="text" value={item.time} placeholder="Ex.: 18h" onChange={e => updateSchedule(i, 'time', e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Evento</label>
                                        <input type="text" value={item.event} placeholder="Ex.: Culto de Celebração" onChange={e => updateSchedule(i, 'event', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── ATIVIDADES ── */}
                {activeTab === 'activities' && (
                    <div className="he-section">
                        <div className="he-section-header">
                            <h2>Atividades em Destaque</h2>
                            <button className="he-add-btn" onClick={addActivity}><Plus size={16} /> Adicionar</button>
                        </div>
                        {data?.activities?.map((act, i) => (
                            <div key={i} className="he-card">
                                <div className="he-card-head">
                                    <span className="he-card-label">{act.title || `Atividade ${i + 1}`}</span>
                                    <button className="he-remove-btn" onClick={() => removeActivity(i)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                {act.image && (
                                    <div className="he-preview-wrap">
                                        <img src={act.image} alt="preview" className="he-img-preview" onError={e => e.target.style.display = 'none'} />
                                    </div>
                                )}
                                <div className="he-fields">
                                    <label>Título</label>
                                    <input type="text" value={act.title} placeholder="Ex.: Sopa Solidária" onChange={e => updateActivity(i, 'title', e.target.value)} />
                                    <label>Data / Periodicidade</label>
                                    <input type="text" value={act.date} placeholder="Ex.: Toda Quarta-feira" onChange={e => updateActivity(i, 'date', e.target.value)} />
                                    <label>Descrição</label>
                                    <textarea rows={2} value={act.description} placeholder="Breve descrição..." onChange={e => updateActivity(i, 'description', e.target.value)} />
                                    <label>Imagem da Atividade</label>
                                    <ImageUploadField
                                        value={act.image}
                                        onChange={val => updateActivity(i, 'image', val)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeEditor;
