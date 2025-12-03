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
import Retiro from "./pages/Retiro";
import Midia from "./pages/midia";
import Login from "./pages/Login";
import Painel from "./painel";
import DynamicPage from "./pages/DynamicPage";
import "./css/App.css";

function App() {
  const [theme, setTheme] = React.useState("dark");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const [dynamicPages, setDynamicPages] = React.useState([]);

  React.useEffect(() => {
    const savedPages = localStorage.getItem("admac_pages");
    if (savedPages) {
      setDynamicPages(JSON.parse(savedPages));
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/revista" element={<Revista />} />
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

            <Route path="/mulheres" element={<Mulheres />} />

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

            <Route path="/midia" element={<Midia />} />

            <Route path="/edb" element={<EDB />} />

            <Route path="/social" element={<Social />} />

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
