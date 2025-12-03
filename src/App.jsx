import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
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
import Login from "./pages/Login";
import Painel from "./painel";
import DynamicPage from "./pages/DynamicPage";
import "./css/App.css";
import DatabaseService from "./services/DatabaseService";

function App() {
  const [theme, setTheme] = React.useState("dark");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const [pages, setPages] = React.useState([]);
  const [dynamicPages, setDynamicPages] = React.useState([]);

  React.useEffect(() => {
    const loadPages = () => {
      DatabaseService.getPages().then((ps) => {
        setPages(ps || []);
        const dynamicOnline = (ps || [])
          .filter((p) => p.type === "dynamic" && p.status === "online");
        setDynamicPages(dynamicOnline);
      });
    };
    loadPages();
    const handleStorage = () => loadPages();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isOnline = (id) => {
    const p = pages.find((x) => x.id === id);
    if (!p) return true;
    return p.status === "online";
  };

  return (
    <Router>
      <div className="app">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/revista" element={isOnline('revista') ? <Revista /> : <Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/painel/*" element={
              <ProtectedRoute>
                <Painel />
              </ProtectedRoute>
            } />

            {/* Dynamic Routes from CMS */}
            {dynamicPages.map((page) => (
              <Route
                key={page.id}
                path={page.path}
                element={<DynamicPage page={page} />}
              />
            ))}

            <Route path="/mulheres" element={isOnline('mulheres') ? <Mulheres /> : <Home />} />

            <Route path="/homens" element={isOnline('homens') ? <Homens /> : <Home />} />

            <Route path="/jovens" element={isOnline('jovens') ? <Jovens /> : <Home />} />

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

            <Route path="/kids" element={isOnline('kids') ? <Kids /> : <Home />} />

            <Route path="/lares" element={isOnline('lares') ? <Lares /> : <Home />} />

            <Route path="/louvor" element={isOnline('louvor') ? <Louvor /> : <Home />} />

            <Route path="/retiro" element={isOnline('retiro') ? <Retiro /> : <Home />} />

            <Route path="/midia" element={isOnline('midia') ? <Midia /> : <Home />} />

            <Route path="/edb" element={isOnline('ebd') ? <EDB /> : <Home />} />

            <Route path="/social" element={isOnline('social') ? <Social /> : <Home />} />

            <Route path="/contato" element={<Contact />} />
            {/* Fallback for other routes */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
