import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Revista from "./pages/RevistaAdmac";
import Ministry from "./pages/Ministry";
import Contact from "./pages/Contact";
import EDB from "./pages/EDB";
import Kids from "./pages/Kids";
import Social from "./pages/Social";
import Louvor from "./pages/Louvor";
import Lares from "./pages/Lares";
import Jovens from "./pages/JovensPage";
import Mulheres from "./pages/Mulheres";
import Homens from "./pages/Homens";
import Retiro from "./pages/Retiro";
import Midia from "./pages/midia";
import Missoes from "./pages/missoes";
import Login from "./pages/Login";
import PainelApp from "./painel/PainelApp";

import "./css/App.css";

const AppContent = () => {
  const [theme, setTheme] = React.useState("dark");
  const location = useLocation();
  const isPainel = location.pathname.startsWith("/painel");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="app">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className={isPainel ? "painel-main-container" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/revista" element={<Revista />} />
          <Route path="/login" element={<Login />} />

          <Route path="/mulheres" element={<Mulheres />} />

          <Route path="/homens" element={<Homens />} />

          <Route path="/jovens" element={<Jovens />} />

          <Route
            path="/intercessao"
            element={
              <Ministry
                title="Ministério de Intercessão"
                subtitle="Unidos em oração, transformando vidas através do clamor"
                description="O Ministério de Intercessão é dedicado a orar pelas necessidades da igreja e do mundo. Junte-se a nós nesta missão de fé."
                schedule={["Segunda: 19h às 20h", "Sexta: 19h às 20h"]}
              />
            }
          />

          <Route path="/kids" element={<Kids />} />

          <Route path="/lares" element={<Lares />} />

          <Route path="/louvor" element={<Louvor />} />

          <Route path="/retiro" element={<Retiro />} />
          <Route path="/retiros" element={<Retiro />} />

          <Route path="/midia" element={<Midia />} />
          <Route path="/midia/live" element={<Midia />} />
          <Route path="/midia/videos" element={<Midia />} />

          <Route path="/edb" element={<EDB />} />

          <Route path="/social" element={<Social />} />
          <Route path="/missoes" element={<Missoes />} />

          <Route path="/contato" element={<Contact />} />
          <Route
            path="/ministerios"
            element={
              <Ministry
                title="Ministérios"
                subtitle="Conheça os ministérios da ADMAC"
                description="Explore os principais ministérios e encontre onde se envolver."
                schedule={["Domingo: 9h EBD", "Domingo: 18h Culto"]}
              />
            }
          />
          {/* Admin Panel Routes */}
          <Route path="/painel/*" element={<PainelApp />} />
          {/* Fallback for other routes */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
