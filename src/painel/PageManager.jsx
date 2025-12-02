import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, RefreshCw, Globe, FileText } from 'lucide-react';
import DatabaseService from '../services/DatabaseService';

const PageManager = () => {
  const [pages, setPages] = useState([]);
  const [newPageName, setNewPageName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const pagesData = await DatabaseService.getPages();
      setPages(pagesData);
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPage = async () => {
    if (!newPageName.trim()) {
      alert('Por favor, insira um nome para a página.');
      return;
    }

    const newPage = {
      name: newPageName,
      path: `/${newPageName.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'dynamic',
      status: 'offline'
    };

    const success = await DatabaseService.addPage(newPage);
    if (success) {
      await loadPages();
      setNewPageName('');
      alert('Página adicionada com sucesso!');
    } else {
      alert('Erro ao adicionar página.');
    }
  };

  const toggleStatus = async (id) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      const newStatus = page.status === 'online' ? 'offline' : 'online';
      const success = await DatabaseService.updatePage(id, { status: newStatus });
      if (success) {
        await loadPages();
      }
    }
  };

  const deletePage = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta página?')) return;
    
    const success = await DatabaseService.deletePage(id);
    if (success) {
      await loadPages();
      alert('Página deletada com sucesso!');
    } else {
      alert('Erro ao deletar página.');
    }
  };

  return (
    <div className="dashboard-modern">
      <div className="page-header">
        <div>
          <h1>Gerenciar Páginas</h1>
          <p>Gerencie todas as páginas do site</p>
        </div>
        <button onClick={loadPages} className="btn btn-secondary" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Atualizar
        </button>
      </div>

      <div className="form-container">
        <div className="editor-card">
          <div className="editor-card-header">
            <h2>Adicionar Nova Página</h2>
          </div>
          <div className="form-group">
            <label>Nome da Página</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Ex: Sobre Nós"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPage()}
                style={{ flex: 1 }}
              />
              <button onClick={addPage} className="btn btn-primary">
                <Plus size={20} />
                Adicionar Página
              </button>
            </div>
            <small>O caminho será gerado automaticamente baseado no nome</small>
          </div>
        </div>

        <div className="editor-card">
          <div className="editor-card-header">
            <h2>Páginas Existentes</h2>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Carregando páginas...</p>
            </div>
          ) : pages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FileText size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Nenhuma página encontrada</p>
            </div>
          ) : (
            <div className="modern-table">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Caminho</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map(page => (
                    <tr key={page.id}>
                      <td>
                        <div className="table-cell-content">
                          <Globe size={18} style={{ color: 'var(--primary-color)' }} />
                          <strong>{page.name}</strong>
                        </div>
                      </td>
                      <td>
                        <code style={{ 
                          background: 'var(--bg-darker)', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.875rem'
                        }}>
                          {page.path}
                        </code>
                      </td>
                      <td>
                        <span className={`status-badge ${page.type === 'system' ? 'info' : 'success'}`}>
                          {page.type === 'system' ? 'Sistema' : 'Dinâmica'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${page.status === 'online' ? 'online' : 'offline'}`}>
                          {page.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => toggleStatus(page.id)} 
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem' }}
                            title={page.status === 'online' ? 'Desativar' : 'Ativar'}
                          >
                            {page.status === 'online' ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <Link 
                            to={`/painel/paginas/editar/${page.id}`} 
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem', textDecoration: 'none' }}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </Link>
                          {page.type === 'dynamic' && (
                            <button 
                              onClick={() => deletePage(page.id)} 
                              className="btn btn-danger"
                              style={{ padding: '0.5rem' }}
                              title="Deletar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageManager;
