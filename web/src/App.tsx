import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { HomeMap } from './pages/HomeMap';
import { ReportForm } from './pages/ReportForm';
import { ReportDetail } from './pages/ReportDetail';
import { HotspotDetail } from './pages/HotspotDetail';
import { Dashboard } from './pages/Dashboard';
import { SmokeTest } from './pages/SmokeTest';
import { useAuth } from './services/authService';

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();

  return (
    <APIProvider apiKey={apiKey}>
      <BrowserRouter>
        {/* Temporary Navigation for MVP scaffolding */}
        <nav className="p-4 bg-gray-100 dark:bg-gray-800 flex items-center gap-4">
          <Link to="/" className="text-blue-500 hover:underline font-bold">AirPatch</Link>
          <Link to="/" className="text-blue-500 hover:underline">Map</Link>
          <Link to="/report" className="text-blue-500 hover:underline">Report</Link>
          <Link to="/dashboard" className="text-blue-500 hover:underline">Dashboard</Link>
          <Link to="/smoke-test" className="text-red-500 hover:underline">Dev: Smoke Test</Link>
          
          <div className="ml-auto flex items-center gap-4">
            {!loading && user ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.displayName || user.email}
                </span>
                <button 
                  onClick={signOutUser}
                  className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : !loading ? (
              <button 
                onClick={signInWithGoogle}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Sign in with Google
              </button>
            ) : null}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomeMap />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/report/:id" element={<ReportDetail />} />
          <Route path="/hotspot/:id" element={<HotspotDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/smoke-test" element={<SmokeTest />} />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;
