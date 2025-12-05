import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    Image,
    Activity,
    UserCircle,
    FileText,
    ArrowLeft,
    ChevronRight,
    Youtube,
    MessageCircle
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
            title: 'Programação',
            description: 'Editar programação semanal de cultos e eventos',
            icon: Calendar,
            path: '/painel/content/schedule',
            color: '#4A90E2',
            count: 7 // Default schedule items
        },
        {
            title: 'Carousel',
            description: 'Gerenciar slides do carousel principal',
            icon: Image,
            path: '/painel/content/carousel',
            color: '#9b59b6',
            count: 3
        },
        {
            title: 'Atividades',
            description: 'Gerenciar atividades em destaque',
            icon: Activity,
            path: '/painel/content/activities',
            color: '#27ae60',
            count: 4
        },
        {
            title: 'Info do Pastor',
            description: 'Editar informações do pastor',
            icon: UserCircle,
            path: '/painel/content/pastor',
            color: '#d4af37',
            count: 1
        },
        {
            title: 'Texto de Boas-Vindas',
            description: 'Editar texto da seção de boas-vindas',
            icon: FileText,
            path: '/painel/content/welcome',
            color: '#e74c3c',
            count: 1
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
