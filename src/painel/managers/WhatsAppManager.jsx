import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Save, Phone, Check, X } from 'lucide-react';
import './WhatsAppManager.css';

const WhatsAppManager = () => {
    const navigate = useNavigate();
    const [whatsappLinks, setWhatsappLinks] = useState({});
    const [editingPage, setEditingPage] = useState(null);

    // Available pages for WhatsApp configuration
    const pages = [
        { id: 'home', name: 'Página Inicial', defaultMessage: 'Olá! Gostaria de mais informações sobre a ADMAC' },
        { id: 'kids', name: 'Ministério Kids', defaultMessage: 'Olá! Gostaria de informações sobre o Ministério Kids' },
        { id: 'jovens', name: 'Ministério de Jovens', defaultMessage: 'Olá! Gostaria de informações sobre o Ministério de Jovens' },
        { id: 'louvor', name: 'Ministério de Louvor', defaultMessage: 'Olá! Gostaria de informações sobre o Ministério de Louvor' },
        { id: 'mulheres', name: 'Ministério de Mulheres', defaultMessage: 'Olá! Gostaria de informações sobre o Ministério de Mulheres' },
        { id: 'homens', name: 'Ministério de Homens', defaultMessage: 'Olá! Gostaria de informações sobre o Ministério de Homens' },
        { id: 'lares', name: 'Ministério de Lares', defaultMessage: 'Olá! Gostaria de informações sobre o Ministério de Lares' },
        { id: 'retiro', name: 'Retiros Espirituais', defaultMessage: 'Olá! Gostaria de informações sobre os Retiros' },
        { id: 'social', name: 'Ação Social', defaultMessage: 'Olá! Gostaria de informações sobre a Ação Social' },
        { id: 'ebd', name: 'Escola Bíblica Dominical', defaultMessage: 'Olá! Gostaria de informações sobre a EBD' },
        { id: 'contato', name: 'Página de Contato', defaultMessage: 'Olá! Gostaria de entrar em contato com a ADMAC' }
    ];

    // Load WhatsApp links from localStorage
    useEffect(() => {
        const savedLinks = localStorage.getItem('admac_whatsapp_links');
        if (savedLinks) {
            setWhatsappLinks(JSON.parse(savedLinks));
        } else {
            // Initialize with default structure
            const defaultLinks = {};
            pages.forEach(page => {
                defaultLinks[page.id] = {
                    number: '',
                    message: page.defaultMessage,
                    active: false
                };
            });
            setWhatsappLinks(defaultLinks);
        }
    }, []);

    // Save WhatsApp links to localStorage
    const saveLinks = (updatedLinks) => {
        localStorage.setItem('admac_whatsapp_links', JSON.stringify(updatedLinks));
        setWhatsappLinks(updatedLinks);
    };

    // Handle input changes
    const handleChange = (pageId, field, value) => {
        const updatedLinks = {
            ...whatsappLinks,
            [pageId]: {
                ...whatsappLinks[pageId],
                [field]: value
            }
        };
        setWhatsappLinks(updatedLinks);
    };

    // Save specific page configuration
    const handleSave = (pageId) => {
        saveLinks(whatsappLinks);
        setEditingPage(null);
        alert('Configuração salva com sucesso!');
    };

    // Format phone number for WhatsApp link
    const formatWhatsAppNumber = (number) => {
        return number.replace(/\D/g, '');
    };

    // Generate WhatsApp link
    const generateWhatsAppLink = (number, message) => {
        const formattedNumber = formatWhatsAppNumber(number);
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
    };

    // Validate phone number
    const isValidPhoneNumber = (number) => {
        const cleaned = formatWhatsAppNumber(number);
        return cleaned.length >= 10 && cleaned.length <= 15;
    };

    return (
        <div className="whatsapp-manager-container">
            <div className="whatsapp-manager-header">
                <button className="back-button" onClick={() => navigate('/painel/content')}>
                    <ArrowLeft size={20} />
                    Voltar
                </button>
                <h1>Gerenciar Links do WhatsApp</h1>
            </div>

            <div className="whatsapp-manager-content">
                <div className="info-card">
                    <MessageCircle size={24} />
                    <div>
                        <h3>Configure números diferentes para cada página</h3>
                        <p>Cada página do site pode ter seu próprio número de WhatsApp e mensagem personalizada.</p>
                    </div>
                </div>

                <div className="pages-list">
                    {pages.map(page => {
                        const config = whatsappLinks[page.id] || { number: '', message: page.defaultMessage, active: false };
                        const isEditing = editingPage === page.id;

                        return (
                            <div key={page.id} className="page-config-card">
                                <div className="page-header">
                                    <h3>{page.name}</h3>
                                    <div className="page-status">
                                        <span className={`status-badge ${config.active ? 'active' : 'inactive'}`}>
                                            {config.active ? '✓ Ativo' : '✗ Inativo'}
                                        </span>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="config-form">
                                        <div className="form-group">
                                            <label htmlFor={`number-${page.id}`}>
                                                <Phone size={18} />
                                                Número do WhatsApp
                                            </label>
                                            <input
                                                type="tel"
                                                id={`number-${page.id}`}
                                                value={config.number}
                                                onChange={(e) => handleChange(page.id, 'number', e.target.value)}
                                                placeholder="5561999999999"
                                            />
                                            <small>Formato: código do país + DDD + número (ex: 5561999999999)</small>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor={`message-${page.id}`}>
                                                <MessageCircle size={18} />
                                                Mensagem Padrão
                                            </label>
                                            <textarea
                                                id={`message-${page.id}`}
                                                value={config.message}
                                                onChange={(e) => handleChange(page.id, 'message', e.target.value)}
                                                rows="3"
                                            ></textarea>
                                        </div>

                                        <div className="form-group">
                                            <label className="toggle-label">
                                                <input
                                                    type="checkbox"
                                                    checked={config.active}
                                                    onChange={(e) => handleChange(page.id, 'active', e.target.checked)}
                                                />
                                                <span>Ativar WhatsApp nesta página</span>
                                            </label>
                                        </div>

                                        {config.number && isValidPhoneNumber(config.number) && (
                                            <div className="preview-link">
                                                <strong>Preview do Link:</strong>
                                                <a
                                                    href={generateWhatsAppLink(config.number, config.message)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="whatsapp-preview-link"
                                                >
                                                    {generateWhatsAppLink(config.number, config.message)}
                                                </a>
                                            </div>
                                        )}

                                        <div className="form-actions">
                                            <button
                                                className="btn-save"
                                                onClick={() => handleSave(page.id)}
                                                disabled={config.number && !isValidPhoneNumber(config.number)}
                                            >
                                                <Save size={18} />
                                                Salvar Configuração
                                            </button>
                                            <button
                                                className="btn-cancel"
                                                onClick={() => setEditingPage(null)}
                                            >
                                                <X size={18} />
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="config-summary">
                                        {config.number ? (
                                            <>
                                                <div className="summary-item">
                                                    <Phone size={16} />
                                                    <span>{config.number}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <MessageCircle size={16} />
                                                    <span>{config.message}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="no-config">Nenhum número configurado</p>
                                        )}
                                        <button
                                            className="btn-edit"
                                            onClick={() => setEditingPage(page.id)}
                                        >
                                            Editar Configuração
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppManager;
