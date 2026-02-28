import React from "react";
import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import { routes } from "./routes";
import "./css/App.css";
import AnalyticsService from "./services/AnalyticsService";

const AppContent = () => {
  const [theme] = React.useState("dark");
  const content = useRoutes(routes);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  React.useEffect(() => {
    AnalyticsService.recordPageView(location.pathname || "/");
  }, [location.pathname]);

  return (
    <div className="app">
      {content}
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
