import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import DatabaseService from '../services/DatabaseService';

const PageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(() => DatabaseService.getPageById(id));

  useEffect(() => {
    if (!page) {
      alert('Página não encontrada!');
      navigate('/painel/paginas');
    }
  }, [page, navigate]);

  const handleSave = () => {
    if (DatabaseService.updatePage(id, page)) {
      alert('Página salva com sucesso!');
      navigate('/painel/paginas');
    } else {
      alert('Erro ao salvar página.');
    }
  };

  if (!page) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="page-editor">
      <div className="editor-header">
        <button onClick={() => navigate('/painel/paginas')} className="btn-back">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h2>Editar Página: {page.name}</h2>
        <button onClick={handleSave} className="btn-primary">
          <Save size={20} />
          Salvar Alterações
        </button>
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label>Nome da Página</label>
          <input
            type="text"
            value={page.name}
            onChange={(e) => setPage({ ...page, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Caminho (URL)</label>
          <input
            type="text"
            value={page.path}
            onChange={(e) => setPage({ ...page, path: e.target.value })}
            disabled={page.type === 'system'}
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={page.status}
            onChange={(e) => setPage({ ...page, status: e.target.value })}
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="form-group">
          <label>Conteúdo</label>
          <textarea
            value={page.content || ''}
            onChange={(e) => setPage({ ...page, content: e.target.value })}
            rows={15}
            placeholder="Digite o conteúdo da página..."
            disabled={page.type === 'system'}
          />
          {page.type === 'system' && (
            <p className="help-text">⚠️ Páginas do sistema não podem ter o conteúdo editado aqui.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
