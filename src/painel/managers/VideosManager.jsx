import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Youtube, Save, X } from 'lucide-react';
import DatabaseService from '../../services/DatabaseService';
import './VideosManager.css';

const VideosManager = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        youtubeUrl: '',
        description: '',
        category: 'cultos',
        order: 0,
        active: true
    });

    const categories = [
        { value: 'cultos', label: 'Cultos Online' },
        { value: 'pregacoes', label: 'Pregações' },
        { value: 'eventos', label: 'Eventos Especiais' },
        { value: 'louvor', label: 'Louvor e Adoração' },
        { value: 'testemunhos', label: 'Testemunhos' },
        { value: 'outros', label: 'Outros' }
    ];

    // Load videos from DatabaseService
    useEffect(() => {
        DatabaseService.getVideos().then(setVideos);
    }, []);

    // Save videos to DatabaseService
    const saveVideos = async (updatedVideos) => {
        await DatabaseService.saveVideos(updatedVideos);
        setVideos(updatedVideos);
    };

    // Extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission (Add or Edit)
    const handleSubmit = (e) => {
        e.preventDefault();

        const videoId = extractYouTubeId(formData.youtubeUrl);
        if (!videoId) {
            alert('URL do YouTube inválida. Use um link como: https://www.youtube.com/watch?v=VIDEO_ID');
            return;
        }

        if (editingId !== null) {
            // Edit existing video
            const updatedVideos = videos.map(video =>
                video.id === editingId
                    ? { ...formData, id: editingId, videoId, updatedAt: new Date().toISOString() }
                    : video
            );
            saveVideos(updatedVideos);
        } else {
            // Add new video
            const newVideo = {
                id: Date.now(),
                ...formData,
                videoId,
                createdAt: new Date().toISOString()
            };
            saveVideos([...videos, newVideo]);
        }

        // Reset form
        setFormData({ title: '', youtubeUrl: '', description: '', category: 'cultos', order: 0, active: true });
        setIsEditing(false);
        setEditingId(null);
    };

    // Handle edit button click
    const handleEdit = (video) => {
        setFormData({
            title: video.title,
            youtubeUrl: video.youtubeUrl,
            description: video.description || '',
            category: video.category,
            order: video.order,
            active: video.active !== undefined ? video.active : true
        });
        setEditingId(video.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle delete
    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este vídeo?')) {
            const updatedVideos = videos.filter(video => video.id !== id);
            saveVideos(updatedVideos);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setFormData({ title: '', youtubeUrl: '', description: '', category: 'cultos', order: 0, active: true });
        setIsEditing(false);
        setEditingId(null);
    };

    // Get YouTube embed URL
    const getEmbedUrl = (url) => {
        const videoId = extractYouTubeId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    // Group videos by category
    const videosByCategory = videos.reduce((acc, video) => {
        if (!acc[video.category]) {
            acc[video.category] = [];
        }
        acc[video.category].push(video);
        return acc;
    }, {});

    return (
        <div className="videos-manager-container">
            <div className="videos-manager-header">
                <button className="back-button" onClick={() => navigate('/painel/content')}>
                    <ArrowLeft size={20} />
                    Voltar
                </button>
                <h1>Gerenciar Vídeos do YouTube</h1>
            </div>

            <div className="videos-manager-content">
                {/* Add/Edit Form */}
                <div className="video-form-card">
                    <h2>
                        {isEditing ? (
                            <>
                                <Edit2 size={24} />
                                Editar Vídeo
                            </>
                        ) : (
                            <>
                                <Plus size={24} />
                                Adicionar Novo Vídeo
                            </>
                        )}
                    </h2>

                    <form onSubmit={handleSubmit} className="video-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="title">Título do Vídeo *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ex: Culto de Domingo - 03/12/2023"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Categoria *</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="youtubeUrl">URL do YouTube *</label>
                            <input
                                type="url"
                                id="youtubeUrl"
                                name="youtubeUrl"
                                value={formData.youtubeUrl}
                                onChange={handleChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                            />
                            <small>Cole o link completo do vídeo do YouTube</small>
                        </div>

                        {formData.youtubeUrl && getEmbedUrl(formData.youtubeUrl) && (
                            <div className="video-preview">
                                <label>Preview:</label>
                                <div className="video-embed">
                                    <iframe
                                        src={getEmbedUrl(formData.youtubeUrl)}
                                        title="YouTube video preview"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="description">Descrição (Opcional)</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Breve descrição do vídeo..."
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="order">Ordem de Exibição</label>
                                <input
                                    type="number"
                                    id="order"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleChange}
                                    min="0"
                                />
                                <small>Menor número aparece primeiro</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="active">Status do Vídeo</label>
                                <div className="toggle-container">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            id="active"
                                            name="active"
                                            checked={formData.active}
                                            onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                    <span className={`toggle-label ${formData.active ? 'active' : 'inactive'}`}>
                                        {formData.active ? '✓ Ativo (Visível no site)' : '✗ Inativo (Oculto)'}
                                    </span>
                                </div>
                                <small>{formData.active ? 'Este vídeo será exibido no site' : 'Este vídeo não será exibido no site'}</small>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                <Save size={20} />
                                {isEditing ? 'Salvar Alterações' : 'Adicionar Vídeo'}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn-cancel" onClick={handleCancel}>
                                    <X size={20} />
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Videos List */}
                <div className="videos-list-section">
                    <h2>
                        <Youtube size={24} />
                        Vídeos Cadastrados ({videos.length})
                    </h2>

                    {videos.length === 0 ? (
                        <div className="empty-state">
                            <Youtube size={64} />
                            <p>Nenhum vídeo cadastrado ainda.</p>
                            <p>Adicione seu primeiro vídeo usando o formulário acima!</p>
                        </div>
                    ) : (
                        <div className="videos-by-category">
                            {categories.map(cat => {
                                const categoryVideos = videosByCategory[cat.value] || [];
                                if (categoryVideos.length === 0) return null;

                                return (
                                    <div key={cat.value} className="category-section">
                                        <h3>{cat.label} ({categoryVideos.length})</h3>
                                        <div className="videos-grid">
                                            {categoryVideos
                                                .sort((a, b) => a.order - b.order)
                                                .map(video => (
                                                    <div key={video.id} className="video-card">
                                                        <div className="video-thumbnail">
                                                            <iframe
                                                                src={`https://www.youtube.com/embed/${video.videoId}`}
                                                                title={video.title}
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                        <div className="video-info">
                                                            <h4>{video.title}</h4>
                                                            {video.description && <p>{video.description}</p>}
                                                            <div className="video-meta">
                                                                <span className="video-order">Ordem: {video.order}</span>
                                                                <span className={`video-status ${video.active !== false ? 'status-active' : 'status-inactive'}`}>
                                                                    {video.active !== false ? '✓ Ativo' : '✗ Inativo'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="video-actions">
                                                            <button
                                                                className="btn-edit"
                                                                onClick={() => handleEdit(video)}
                                                                title="Editar"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() => handleDelete(video.id)}
                                                                title="Excluir"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideosManager;
