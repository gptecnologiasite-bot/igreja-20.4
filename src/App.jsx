// ================================================================
// App.jsx — Componente raiz da aplicação ADMAC
// Configura o roteador, aplica o tema ao documento e registra
// cada navegação de página no serviço de analytics.
// ================================================================

import React from "react";
import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import { routes } from "./routes";
import "./css/App.css";
import AnalyticsService from "./services/AnalyticsService";

// AppContent precisa ser um componente separado de App porque
// `useRoutes` e `useLocation` precisam estar dentro do contexto do Router
const AppContent = () => {
  // Estado de tema — padrão escuro
  const [theme] = React.useState("dark");
  // Gera o conteúdo da rota atual utilizando a configuração de rotas
  const content = useRoutes(routes);
  const location = useLocation();

  // Aplica o atributo `data-theme` ao elemento <html> sempre que o tema mudar
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Registra cada navegação de página no analytics (baseado na pathname)
  React.useEffect(() => {
    AnalyticsService.recordPageView(location.pathname || "/");
  }, [location.pathname]);

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
