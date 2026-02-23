import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Globe, Layout,
    Instagram, Youtube, Facebook, Phone,
    Music, Mail, MapPin, Clock, Heart,
    Compass, Type, Trash2
} from 'lucide-react';
import ImageUploadField from '../components/ImageUploadField';
import DatabaseService from '../../services/DatabaseService';
import './GlobalSettingsEditor.css';

const TABS = [
    { id: 'header', label: 'Cabeçalho', icon: Layout },
    { id: 'footer', label: 'Rodapé', icon: Compass },
    { id: 'social', label: 'Redes Sociais', icon: Globe },
];

const GlobalSettingsEditor = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('header');
    const [headerData, setHeaderData] = useState(null);
    const [footerData, setFooterData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const h = await DatabaseService.getHeaderData();
            const f = await DatabaseService.getFooterData();
            setHeaderData(h);
            setFooterData(f);
        };
        loadData();
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await DatabaseService.saveHeaderData(headerData);
            await DatabaseService.saveFooterData(footerData);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    // --- Header Helpers ---
    const updateHeaderLogo = (field, val) => {
        setHeaderData({ ...headerData, logo: { ...headerData?.logo, [field]: val } });
    };

    const updateHeaderMenu = (index, field, val) => {
        const menu = [...(headerData?.menu || [])];
        menu[index] = { ...menu[index], [field]: val };
        setHeaderData({ ...headerData, menu });
    };

    // --- Footer Helpers ---
    const updateFooterLogo = (field, val) => {
        setFooterData({ ...footerData, logo: { ...footerData?.logo, [field]: val } });
    };

    const updateFooterSection = (field, val) => {
        setFooterData({ ...footerData, [field]: val });
    };

    const updateFooterContact = (field, val) => {
        setFooterData({ ...footerData, contact: { ...footerData?.contact, [field]: val } });
    };

    const updateSocial = (section, field, val) => {
        if (section === 'header') {
            setHeaderData({ ...headerData, social: { ...headerData?.social, [field]: val } });
        } else {
            setFooterData({ ...footerData, social: { ...footerData?.social, [field]: val } });
        }
    };

    if (!headerData || !footerData) return <div className="gse-loading">Carregando configurações...</div>;

    return (
        <div className="gse-root">
            {/* Header */}
            <div className="gse-header">
                <button className="gse-back" onClick={() => navigate('/painel/dashboard')}>
                    <ArrowLeft size={18} /> Voltar
                </button>
                <div className="gse-title-wrap">
                    <Globe size={22} />
                    <span>Configurações Globais</span>
                </div>
                <button className={`gse-save-btn ${saved ? 'gse-saved' : ''}`} onClick={save} disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Salvando...' : saved ? 'Salvo ✓' : 'Salvar Alterações'}
                </button>
            </div>

            {/* Tabs */}
            <div className="gse-tabs">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`gse-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="gse-content">

                {/* --- HEADER EDITOR --- */}
                {activeTab === 'header' && (
                    <div className="gse-section">
                        <div className="gse-card">
                            <h3><Type size={18} /> Identidade Visual</h3>
                            <div className="gse-fields">
                                <label>Nome da Igreja (Logo)</label>
                                <input
                                    type="text"
                                    value={headerData?.logo?.text || ''}
                                    onChange={(e) => updateHeaderLogo('text', e.target.value)}
                                />
                                <label>Ícone / Símbolo (Favicon)</label>
                                <ImageUploadField
                                    value={headerData?.logo?.icon || ''}
                                    onChange={val => updateHeaderLogo('icon', val)}
                                    placeholder="Suba uma imagem ou use um símbolo ex: ✝"
                                />
                            </div>
                        </div>

                        <div className="gse-card">
                            <h3><Layout size={18} /> Menu de Navegação</h3>
                            <p className="gse-hint">Edite os nomes dos links do cabeçalho principal.</p>
                            <div className="gse-menu-grid">
                                {headerData?.menu?.map((item, idx) => (
                                    <div key={idx} className="gse-menu-item">
                                        <label>{item.path}</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateHeaderMenu(idx, 'name', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FOOTER EDITOR --- */}
                {activeTab === 'footer' && (
                    <div className="gse-section">
                        <div className="gse-card">
                            <h3><Compass size={18} /> Sobre a Igreja</h3>
                            <div className="gse-fields">
                                <label>Slogan / Tagline</label>
                                <input
                                    type="text"
                                    value={footerData?.logo?.tagline || ''}
                                    onChange={(e) => updateFooterLogo('tagline', e.target.value)}
                                />
                                <label>Descrição Curta</label>
                                <textarea
                                    rows={3}
                                    value={footerData?.description || ''}
                                    onChange={(e) => updateFooterSection('description', e.target.value)}
                                />
                                <label>Versículo em Destaque</label>
                                <input
                                    type="text"
                                    value={footerData?.verse || ''}
                                    onChange={(e) => updateFooterSection('verse', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="gse-card">
                            <h3><Phone size={18} /> Informações de Contato</h3>
                            <div className="gse-fields-grid">
                                <div>
                                    <label><MapPin size={14} /> Endereço</label>
                                    <input
                                        type="text"
                                        value={footerData?.contact?.address || ''}
                                        onChange={(e) => updateFooterContact('address', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label><Phone size={14} /> Telefone</label>
                                    <input
                                        type="text"
                                        value={footerData?.contact?.phone || ''}
                                        onChange={(e) => updateFooterContact('phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label><Mail size={14} /> E-mail</label>
                                    <input
                                        type="text"
                                        value={footerData?.contact?.email || ''}
                                        onChange={(e) => updateFooterContact('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label><Clock size={14} /> Horário de Cultos</label>
                                    <input
                                        type="text"
                                        value={footerData?.contact?.cultos || ''}
                                        onChange={(e) => updateFooterContact('cultos', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SOCIAL EDITOR --- */}
                {activeTab === 'social' && (
                    <div className="gse-section">
                        <div className="gse-card">
                            <h3><Instagram size={18} /> Links Sociais</h3>
                            <p className="gse-hint">Configure os links para as redes sociais da igreja.</p>
                            <div className="gse-fields-grid">
                                <div>
                                    <label><Instagram size={14} /> Instagram</label>
                                    <input
                                        type="text"
                                        value={footerData?.social?.instagram || ''}
                                        onChange={(e) => updateSocial('footer', 'instagram', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label><Youtube size={14} /> Youtube</label>
                                    <input
                                        type="text"
                                        value={footerData?.social?.youtube || ''}
                                        onChange={(e) => updateSocial('footer', 'youtube', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label><Facebook size={14} /> Facebook</label>
                                    <input
                                        type="text"
                                        value={footerData?.social?.facebook || ''}
                                        onChange={(e) => updateSocial('footer', 'facebook', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label><Heart size={14} /> Spotify / Podcast</label>
                                    <input
                                        type="text"
                                        value={footerData?.social?.spotify || ''}
                                        onChange={(e) => updateSocial('footer', 'spotify', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalSettingsEditor;
