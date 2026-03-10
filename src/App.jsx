// ================================================================
// App.jsx — Componente raiz da aplicação ADMAC
// Configura o roteador, aplica o tema ao documento e registra
// cada navegação de página no serviço de analytics.
// ================================================================

import React from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { routes } from "./routes/index";
import "./css/App.css";
import { useVisitorTracker } from "./hooks/useVisitorTracker";

// AppContent precisa ser um componente separado de App porque
// `useRoutes` e `useLocation` precisam estar dentro do contexto do Router
const AppContent = () => {
  // Estado de tema — padrão escuro
  const [theme] = React.useState("dark");
  // Gera o conteúdo da rota atual utilizando a configuração de rotas
  const content = useRoutes(routes);

  // Aplica o atributo `data-theme` ao elemento <html> sempre que o tema mudar
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Ativa o rastreador de visitantes
  useVisitorTracker();

  // Reservado para analytics de navegação

  return (
    <div className="app">
      {content}
    </div>
  );
};

// Componente principal que envolve tudo no BrowserRouter
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
