import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    FileText,
    ArrowLeft,
    ChevronRight,
    Youtube,
    MessageCircle,
    Home
} from 'lucide-react';
import DatabaseService from '../services/DatabaseService';
import './ContentManager.css';

const ContentManager = () => {
    const navigate = useNavigate();
    const [ministriesCount, setMinistriesCount] = useState(0);

    useEffect(() => {
        // Load ministries count
        const loadCounts = async () => {
            const ministries = await DatabaseService.getMinistriesList();
            setMinistriesCount(ministries.length);
        };
        loadCounts();
    }, []);

    const contentTypes = [
        {
            title: 'Editor da Página Home',
            description: 'Gerencie o carrossel, pastores, horários e atividades da página inicial',
            icon: Home,
            path: '/painel/content/pages/home',
            color: '#4A90E2',
            count: 1
        },
        {
            title: 'Ministérios',
            description: 'Gerenciar ministérios exibidos na página inicial',
            icon: Users,
            path: '/painel/content/ministries',
            color: '#ff6b9d',
            count: ministriesCount
        },
        {
            title: 'Vídeos do YouTube',
            description: 'Gerenciar vídeos de cultos e pregações',
            icon: Youtube,
            path: '/painel/content/videos',
            color: '#ff0000',
            count: JSON.parse(localStorage.getItem('admac_videos') || '[]').length
        },
        {
            title: 'Links WhatsApp',
            description: 'Configurar números de WhatsApp por página',
            icon: MessageCircle,
            path: '/painel/content/whatsapp',
            color: '#25d366',
            count: Object.keys(JSON.parse(localStorage.getItem('admac_whatsapp_links') || '{}')).filter(key => JSON.parse(localStorage.getItem('admac_whatsapp_links') || '{}')[key]?.active).length
        },
        {
            title: 'Páginas Dinâmicas',
            description: 'Criar e editar páginas extras do site',
            icon: FileText,
            path: '/painel/content/pages',
            color: '#50c878',
            count: JSON.parse(localStorage.getItem('admac_pages') || '[]').length
        }
    ];

    return (
        <div className="content-manager">
            <div className="content-header">
                <button className="btn-back" onClick={() => navigate('/painel/dashboard')}>
                    <ArrowLeft size={20} />
                    Voltar ao Dashboard
                </button>
                <h1>Gerenciamento de Conteúdo</h1>
                <p className="subtitle">Gerencie todo o conteúdo do site ADMAC</p>
            </div>

            <div className="content-grid">
                {contentTypes.map((type, index) => {
                    const IconComponent = type.icon;
                    return (
                        <Link
                            key={index}
                            to={type.path}
                            className="content-card"
                            style={{ borderColor: type.color }}
                        >
                            <div className="card-icon" style={{ backgroundColor: type.color }}>
                                <IconComponent size={32} />
                            </div>
                            <div className="card-content">
                                <h3>{type.title}</h3>
                                <p>{type.description}</p>
                                <div className="card-footer">
                                    <span className="item-count">{type.count} {type.count === 1 ? 'item' : 'itens'}</span>
                                    <ChevronRight size={20} className="arrow-icon" style={{ color: type.color }} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default ContentManager;
