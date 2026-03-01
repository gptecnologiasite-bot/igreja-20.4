// ================================================================
// ProtectedRoute.jsx — Guarda de rota para área administrativa
// Verifica se o usuário está autenticado antes de renderizar
// o conteúdo filho. Se não estiver autenticado, redireciona
// automaticamente para a página de login.
// ================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Lê o estado de autenticação do localStorage
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  // Redireciona para /login se o usuário não estiver autenticado
  if (!isAuthenticated || isAuthenticated !== 'true') {
    return <Navigate to="/login" replace />;
  }

  // Renderiza os filhos se o usuário estiver autenticado
  return children;
};

export default ProtectedRoute;
