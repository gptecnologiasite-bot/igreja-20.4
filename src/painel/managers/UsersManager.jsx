import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Edit2, Trash2, Save, X, Search, UserPlus } from 'lucide-react';
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
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                getUserTypeLabel(user.userType).toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const loadUsers = () => {
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            setUsers(JSON.parse(savedUsers));
        }
    };

    const saveUsers = (updatedUsers) => {
        localStorage.setItem('users', JSON.stringify(updatedUsers));
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
            userType: user.userType
        });
    };

    const handleSaveEdit = () => {
        const updatedUsers = users.map(user =>
            user.email === editingUser
                ? { ...user, name: editForm.name, email: editForm.email, userType: editForm.userType }
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
                userType: editForm.userType
            }));
        }

        setEditingUser(null);
        alert('Usuário atualizado com sucesso!');
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditForm({ name: '', email: '', userType: '' });
    };

    const handleDelete = (userEmail) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

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
                <h1>Gerenciar Usuários</h1>
            </div>

            <div className="users-manager-content">
                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card total">
                        <Users size={32} />
                        <div>
                            <h3>{users.length}</h3>
                            <p>Total de Usuários</p>
                        </div>
                    </div>
                    {userTypes.map(type => (
                        stats[type.value] > 0 && (
                            <div key={type.value} className="stat-card">
                                <div className="stat-number">{stats[type.value]}</div>
                                <div className="stat-label">{type.label}</div>
                            </div>
                        )
                    ))}
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou tipo de usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Users Table */}
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Tipo de Usuário</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="no-users">
                                        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.email}>
                                        {editingUser === user.email ? (
                                            <>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="edit-input"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        className="edit-input"
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        value={editForm.userType}
                                                        onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                                                        className="edit-select"
                                                    >
                                                        {userTypes.map(type => (
                                                            <option key={type.value} value={type.value}>
                                                                {type.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-save-small"
                                                            onClick={handleSaveEdit}
                                                            title="Salvar"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button
                                                            className="btn-cancel-small"
                                                            onClick={handleCancelEdit}
                                                            title="Cancelar"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`user-type-badge ${user.userType}`}>
                                                        {getUserTypeLabel(user.userType)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-edit-small"
                                                            onClick={() => handleEdit(user)}
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            className="btn-delete-small"
                                                            onClick={() => handleDelete(user.email)}
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Info Card */}
                <div className="info-card-bottom">
                    <UserPlus size={20} />
                    <p>Novos usuários podem se cadastrar através da página de registro.</p>
                </div>
            </div>
        </div>
    );
};

export default UsersManager;
