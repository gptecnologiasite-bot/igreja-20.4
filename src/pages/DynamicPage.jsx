import React from 'react';
import { Calendar, User, Tag } from 'lucide-react';

const DynamicPage = ({ page }) => {
  if (!page) return null;

  const { name, content, imagem_destaque, categoria, autor, data_publicacao } = page;

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Featured Image Banner */}
      {imagem_destaque && (
        <div 
          className="page-banner" 
          style={{ 
            width: '100%', 
            height: '400px', 
            backgroundImage: `url(${imagem_destaque})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            position: 'relative',
            marginBottom: '2rem'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))'
          }}></div>
          <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', padding: '2rem' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              color: '#fff', 
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              margin: 0
            }}>
              {name}
            </h1>
          </div>
        </div>
      )}

      <div className="container" style={{ padding: imagem_destaque ? '0 2rem' : '2rem' }}>
        
        {/* Title if no image */}
        {!imagem_destaque && (
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1.5rem', 
            color: 'var(--primary-color, #ffd700)',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem'
          }}>
            {name}
          </h1>
        )}

        {/* Metadata Row */}
        <div className="page-meta" style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          marginBottom: '2rem', 
          color: '#888',
          fontSize: '0.9rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '1rem'
        }}>
          {categoria && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={16} color="var(--primary-color)" />
              <span>{categoria}</span>
            </div>
          )}
          {autor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="var(--primary-color)" />
              <span>{autor}</span>
            </div>
          )}
          {data_publicacao && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--primary-color)" />
              <span>{new Date(data_publicacao).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div 
          className="page-content" 
          style={{ 
            fontSize: '1.1rem', 
            lineHeight: '1.8', 
            color: 'var(--text-color, #e0e0e0)',
            whiteSpace: 'pre-wrap' 
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;
