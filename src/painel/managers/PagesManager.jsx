import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Search, Edit2, Trash2, Save, X } from 'lucide-react';
import DatabaseService from '../../services/DatabaseService';
import './PagesManager.css';

const statusOptions = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' }
];

const PagesManager = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', slug: '', status: 'online', type: 'dynamic', content: '' });
  const [createForm, setCreateForm] = useState({ title: '', slug: '', status: 'online', content: '' });

  useEffect(() => {
    (async () => {
      const data = await DatabaseService.getPages();
      setPages(Array.isArray(data) ? data : []);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return pages;
    const s = search.toLowerCase();
    return pages.filter(p =>
      ((p.title || p.name || '').toLowerCase().includes(s)) ||
      ((p.slug || (p.path ? p.path.replace(/^\//, '') : '') || '').toLowerCase().includes(s)) ||
      ((p.status || '').toLowerCase().includes(s))
    );
  }, [pages, search]);

  const startEdit = (page) => {
    setEditingId(page.id);
    setEditForm({
      title: page.title || page.name || '',
      slug: page.slug || (page.path ? page.path.replace(/^\//, '') : ''),
      status: page.status || 'online',
      type: page.type || 'dynamic',
      content: page.content || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', slug: '', status: 'online', type: 'dynamic', content: '' });
  };

  const saveEdit = async () => {
    const current = pages.find(p => p.id === editingId);
    // Para páginas do sistema, permite alterar apenas o status
    const updates = current?.type === 'system'
      ? { status: editForm.status, updatedAt: new Date().toISOString() }
      : { ...editForm, updatedAt: new Date().toISOString() };
    await DatabaseService.updatePage(editingId, updates);
    const updated = pages.map(p => (p.id === editingId ? { ...p, ...updates } : p));
    setPages(updated);
    cancelEdit();
  };

  const deletePage = async (page) => {
    if (page.type === 'system') {
      alert('Páginas do sistema não podem ser excluídas.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir esta página?')) return;
    await DatabaseService.deletePage(page.id);
    setPages(pages.filter(p => p.id !== page.id));
  };

  const createPage = async (e) => {
    e.preventDefault();
    if (!createForm.title || !createForm.slug) {
      alert('Título e Slug são obrigatórios.');
      return;
    }
    const newPage = {
      title: createForm.title,
      slug: createForm.slug,
      status: createForm.status || 'online',
      content: createForm.content || '',
      path: `/${createForm.slug}`,
      type: 'dynamic'
    };
    await DatabaseService.addPage(newPage);
    const data = await DatabaseService.getPages();
    setPages(Array.isArray(data) ? data : []);
    setCreateForm({ title: '', slug: '', status: 'online', content: '' });
  };

  return (
    <div className="pages-manager">
      <div className="pages-header">
        <button className="btn-back" onClick={() => navigate('/painel/content')}>
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1><FileText size={24} /> Gerenciar Páginas</h1>
      </div>

      <div className="pages-toolbar">
        <div className="search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por título, slug ou status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="pages-grid">
        <div className="pages-list">
          <table className="pages-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Tipo</th>
                <th>Criada</th>
                <th>Atualizada</th>
                <th style={{ width: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">Nenhuma página encontrada</td>
                </tr>
              ) : filtered.map((page) => (
                <tr key={page.id}>
                  {editingId === page.id ? (
                    <>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          readOnly={(page.type || 'dynamic') === 'system'}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.slug}
                          onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                          readOnly={(page.type || 'dynamic') === 'system'}
                        />
                      </td>
                      <td>
                        <select
                          className="edit-select"
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          disabled={(page.type || 'dynamic') === 'system'}
                        >
                          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                      <td>{editForm.type}</td>
                      <td>{page.createdAt ? new Date(page.createdAt).toLocaleString() : '-'}</td>
                      <td>{page.updatedAt ? new Date(page.updatedAt).toLocaleString() : '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-save-small" title="Salvar" onClick={saveEdit}>
                            <Save size={16} />
                          </button>
                          <button className="btn-cancel-small" title="Cancelar" onClick={cancelEdit}>
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{page.title || page.name || '-'}</td>
                      <td>/{page.slug || (page.path ? page.path.replace(/^\//, '') : '') || '-'}</td>
                      <td>
                        <span className={`status-badge ${page.status || 'online'}`}>
                          {page.status === 'offline' ? 'Offline' : 'Online'}
                        </span>
                      </td>
                      <td>{page.type || 'dynamic'}</td>
                      <td>{page.createdAt ? new Date(page.createdAt).toLocaleDateString() : '-'}</td>
                      <td>{page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            title="Editar"
                            onClick={() => navigate(`/painel/content/pages/${page.id}`)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-delete" title="Excluir" onClick={() => deletePage(page)} disabled={(page.type || 'dynamic') === 'system'}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pages-create">
          <div className="card">
            <div className="card-title"><Plus size={18} /> Nova Página</div>
            <form onSubmit={createPage} className="create-form">
              <label>Título</label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="Ex.: Sobre Nós"
                required
              />
              <label>Slug</label>
              <input
                type="text"
                value={createForm.slug}
                onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase() })}
                placeholder="ex.: sobre-nos"
                required
              />
              <label>Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
              >
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <label>Conteúdo (opcional)</label>
              <textarea
                rows="4"
                value={createForm.content}
                onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                placeholder="Descrição ou conteúdo inicial..."
              />
              <button type="submit" className="btn-create">
                <Plus size={16} />
                Adicionar Página
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesManager;
