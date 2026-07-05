import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { HomeMap } from './pages/HomeMap';
import { ReportForm } from './pages/ReportForm';
import { ReportDetail } from './pages/ReportDetail';
import { HotspotDetail } from './pages/HotspotDetail';
import { Dashboard } from './pages/Dashboard';

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <APIProvider apiKey={apiKey}>
      <BrowserRouter>
        {/* Temporary Navigation for MVP scaffolding */}
        <nav className="p-4 bg-gray-100 dark:bg-gray-800 flex gap-4">
          <Link to="/" className="text-blue-500 hover:underline">HomeMap</Link>
          <Link to="/report" className="text-blue-500 hover:underline">ReportForm</Link>
          <Link to="/dashboard" className="text-blue-500 hover:underline">Dashboard</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomeMap />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/report/:id" element={<ReportDetail />} />
          <Route path="/hotspot/:id" element={<HotspotDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;
