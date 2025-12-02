import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import DashboardCharts from './DashboardCharts';
import PageManager from './PageManager';
import PageEditor from './PageEditor';
import Settings from './Settings';
import HomeEditor from './HomeEditor';
import FooterEditor from './FooterEditor';
import MinistryEditor from './MinistryEditor';

const Painel = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardCharts />} />
        <Route path="/paginas" element={<PageManager />} />
        <Route path="/paginas/editar/:id" element={<PageEditor />} />
        <Route path="/home" element={<HomeEditor />} />
        <Route path="/footer" element={<FooterEditor />} />
        <Route path="/configuracoes" element={<Settings />} />
        
        {/* Ministry Editors */}
        <Route path="/kids" element={<MinistryEditor ministryId="kids" />} />
        <Route path="/louvor" element={<MinistryEditor ministryId="louvor" />} />
        <Route path="/jovens" element={<MinistryEditor ministryId="jovens" />} />
        <Route path="/mulheres" element={<MinistryEditor ministryId="mulheres" />} />
        <Route path="/lares" element={<MinistryEditor ministryId="lares" />} />
        <Route path="/retiro" element={<MinistryEditor ministryId="retiro" />} />
        <Route path="/social" element={<MinistryEditor ministryId="social" />} />
        <Route path="/midia" element={<MinistryEditor ministryId="midia" />} />
        <Route path="/ebd" element={<MinistryEditor ministryId="ebd" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Painel;
