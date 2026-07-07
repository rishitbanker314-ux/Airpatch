import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { HomeMap } from './pages/HomeMap';
import { ReportForm } from './pages/ReportForm';
import { ReportDetail } from './pages/ReportDetail';
import { HotspotDetail } from './pages/HotspotDetail';
import { Dashboard } from './pages/Dashboard';
import { SmokeTest } from './pages/SmokeTest';
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './components/DashboardLayout';

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/map" element={<DashboardLayout><HomeMap /></DashboardLayout>} />
      <Route path="/report" element={<DashboardLayout><ReportForm /></DashboardLayout>} />
      <Route path="/report/:id" element={<DashboardLayout><ReportDetail /></DashboardLayout>} />
      <Route path="/hotspot/:id" element={<DashboardLayout><HotspotDetail /></DashboardLayout>} />
      <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/smoke-test" element={<SmokeTest />} />
    </Routes>
  );
}

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <APIProvider apiKey={apiKey}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;
