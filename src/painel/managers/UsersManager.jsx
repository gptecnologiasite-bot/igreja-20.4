import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Edit2, Trash2, Save, X, Search, UserPlus } from 'lucide-react';
import ImageUploadField from '../components/ImageUploadField';
import './UsersManager.css';

const UsersManager = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', userType: '' });

    const userTypes = [
        { value: 'admin', label: 'Administrador' },
        { value: 'pastor', label: 'Pastor' },
        { value: 'lider', label: 'Líder de Ministério' },
        { value: 'secretario', label: 'Secretário' },
        { value: 'tesoureiro', label: 'Tesoureiro' },
        { value: 'membro', label: 'Membro' }
    ];

    // Load users from localStorage
    useEffect(() => {
        loadUsers();
    }, []);

    // Filter users based on search
    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(user =>
                (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (getUserTypeLabel(user.userType)?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const loadUsers = () => {
        const savedUsers = localStorage.getItem('admac_users');
        if (savedUsers) {
            setUsers(JSON.parse(savedUsers));
        }
    };

    const saveUsers = (updatedUsers) => {
        localStorage.setItem('admac_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
    };

    const getUserTypeLabel = (type) => {
        const userType = userTypes.find(ut => ut.value === type);
        return userType ? userType.label : type;
    };

    const handleEdit = (user) => {
        setEditingUser(user.email);
        setEditForm({
            name: user.name,
            email: user.email,
            userType: user.userType,
            photo: user.photo || ''
        });
    };

    const handleSaveEdit = () => {
        const updatedUsers = users.map(user =>
            user.email === editingUser
                ? { ...user, name: editForm.name, email: editForm.email, userType: editForm.userType, photo: editForm.photo }
                : user
        );
        saveUsers(updatedUsers);

        // Update current user if editing themselves
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.email === editingUser) {
            localStorage.setItem('user', JSON.stringify({
                ...currentUser,
                name: editForm.name,
                email: editForm.email,
                userType: editForm.userType,
                photo: editForm.photo
            }));
            // Trigger storage event to update other tabs/components
            window.dispatchEvent(new Event('storage'));
        }

        setEditingUser(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditForm({ name: '', email: '', userType: '', photo: '' });
    };

    const handleDelete = (userEmail) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        if (userEmail === 'admin@admac.com') {
            alert('O usuário administrador principal não pode ser excluído!');
            return;
        }

        if (currentUser.email === userEmail) {
            alert('Você não pode excluir seu próprio usuário!');
            return;
        }

        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            const updatedUsers = users.filter(user => user.email !== userEmail);
            saveUsers(updatedUsers);
            alert('Usuário excluído com sucesso!');
        }
    };

    const getUserStats = () => {
        const stats = {};
        userTypes.forEach(type => {
            stats[type.value] = users.filter(u => u.userType === type.value).length;
        });
        return stats;
    };

    const stats = getUserStats();

    return (
        <div className="users-manager-container">
            <div className="users-manager-header">
                <button className="back-button" onClick={() => navigate('/painel/dashboard')}>
                    <ArrowLeft size={20} />
                    Voltar
                </button>
                <div className="header-title">
                    <h1>Gerenciar Usuários</h1>
                    <p>Controle de acesso e membros da equipe</p>
                </div>
            </div>

            <div className="users-manager-content">
                {/* Search and Stats Section */}
                <div className="actions-bar">
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou cargo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="stats-pills">
                        <div className="stat-pill total">
                            <span>{users.length}</span> Total
                        </div>
                        {userTypes.map(type => (
                            stats[type.value] > 0 && (
                                <div key={type.value} className={`stat-pill ${type.value}`}>
                                    <span>{stats[type.value]}</span> {type.label}
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* Users Grid */}
                <div className="users-grid">
                    {filteredUsers.length === 0 ? (
                        <div className="no-users-box">
                            <Users size={48} />
                            <p>{searchTerm ? 'Nenhum usuário encontrado para sua busca.' : 'Nenhum usuário cadastrado ainda.'}</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.email} className="user-card">
                                <div className="user-card-header">
                                    <span className={`role-tag ${user.userType}`}>
                                        {getUserTypeLabel(user.userType)}
                                    </span>
                                    <div className="card-actions">
                                        <button onClick={() => handleEdit(user)} title="Editar"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(user.email)} title="Excluir" className="delete"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="user-card-body">
                                    <div className="user-avatar-large">
                                        {user.photo ? (
                                            <img src={user.photo} alt={user.name} />
                                        ) : (
                                            <div className="avatar-placeholder">{user.name?.charAt(0)}</div>
                                        )}
                                    </div>
                                    <h3 className="user-name">{user.name}</h3>
                                    <p className="user-email">{user.email}</p>
                                </div>
                                <div className="user-card-footer">
                                    <span className="join-date">Desde {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'sempre'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="user-modal-overlay">
                    <div className="user-modal">
                        <div className="modal-header">
                            <h2>Editar Usuário</h2>
                            <button className="close-btn" onClick={handleCancelEdit}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="photo-edit-section">
                                <div className="user-avatar-preview">
                                    {editForm.photo ? (
                                        <img src={editForm.photo} alt="Preview" />
                                    ) : (
                                        <div className="avatar-placeholder">{editForm.name?.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="photo-input-group">
                                    <label>Foto de Perfil</label>
                                    <ImageUploadField
                                        value={editForm.photo}
                                        onChange={val => setEditForm({ ...editForm, photo: val })}
                                        placeholder="Suba uma foto ou cole o link"
                                    />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nome Completo</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        disabled
                                    />
                                </div>
                                <div className="form-group full">
                                    <label>Cargo / Tipo de Usuário</label>
                                    <select
                                        value={editForm.userType}
                                        onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                                    >
                                        {userTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleCancelEdit}>Cancelar</button>
                            <button className="btn-save" onClick={handleSaveEdit}>
                                <Save size={18} />
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManager;
