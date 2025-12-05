import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import DatabaseService from '../../services/DatabaseService';
import './MinistriesManager.css';

const MinistriesManager = () => {
    const [ministries, setMinistries] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        icon: '',
        color: '#ffd700'
    });

    // Load ministries from DatabaseService on mount
    useEffect(() => {
        loadMinistries();
    }, []);

    const loadMinistries = async () => {
        const list = await DatabaseService.getMinistriesList();
        setMinistries(list);
    };

    const handleAdd = () => {
        setFormData({ title: '', description: '', link: '', icon: '', color: '#ffd700' });
        setEditingIndex(null);
        setIsModalOpen(true);
    };

    const handleEdit = (index) => {
        setFormData(ministries[index]);
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const handleDelete = async (index) => {
        if (confirm('Tem certeza que deseja excluir este ministério?')) {
            await DatabaseService.deleteMinistryFromList(index);
            await loadMinistries();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingIndex !== null) {
            // Edit existing
            await DatabaseService.updateMinistryInList(editingIndex, formData);
        } else {
            // Add new
            await DatabaseService.addMinistryToList(formData);
        }

        await loadMinistries();
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="ministries-manager">
            <div className="manager-header">
                <h2>Gerenciar Ministérios</h2>
                <button className="btn-add" onClick={handleAdd}>
                    <Plus size={20} />
                    Adicionar Ministério
                </button>
            </div>

            <div className="table-container">
                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Ícone</th>
                            <th>Título</th>
                            <th>Descrição</th>
                            <th>Link</th>
                            <th>Cor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ministries.map((ministry, index) => (
                            <tr key={index}>
                                <td>
                                    <span className="ministry-icon" style={{ backgroundColor: ministry.color }}>
                                        {ministry.icon}
                                    </span>
                                </td>
                                <td>{ministry.title}</td>
                                <td>{ministry.description}</td>
                                <td><code>{ministry.link}</code></td>
                                <td>
                                    <div className="color-preview" style={{ backgroundColor: ministry.color }}>
                                        {ministry.color}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-edit" onClick={() => handleEdit(index)} title="Editar">
                                            <Edit size={16} />
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(index)} title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingIndex !== null ? 'Editar Ministério' : 'Adicionar Ministério'}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Título</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ex: Kids"
                                />
                            </div>

                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    placeholder="Breve descrição do ministério"
                                />
                            </div>

                            <div className="form-group">
                                <label>Link (rota)</label>
                                <input
                                    type="text"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="/kids"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ícone (emoji)</label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="👶"
                                        maxLength="2"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Cor</label>
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save">
                                    <Save size={18} />
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinistriesManager;
