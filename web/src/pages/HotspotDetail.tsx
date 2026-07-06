import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHotspotDetails } from '../services/hotspots';
import type { Hotspot, Report } from '../shared/types';
import { Activity, Wind, Cloud, MapPin, ArrowLeft, AlertTriangle, ImageOff } from 'lucide-react';

import { ResolutionPanel } from '../components/ResolutionPanel';

export function HotspotDetail() {
  const { id } = useParams();
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const data = await getHotspotDetails(id);
      setHotspot(data.hotspot);
      setReports(data.reports);
    } catch (err) {
      setError('Failed to fetch hotspot details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <div className="flex p-8 justify-center items-center">Loading hotspot...</div>;
  if (error || !hotspot) return <div className="flex p-8 justify-center text-red-500">{error || 'Not found'}</div>;

  // Use the most recent report's context for the hotspot environment
  const latestContext = reports.find(r => r.context)?.context;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
      <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Map
      </Link>

      <ResolutionPanel 
        hotspotId={hotspot.id} 
        isResolved={hotspot.status === 'resolved'} 
        onResolved={fetchDetails} 
      />

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2 capitalize">
              {hotspot.category.replace(/_/g, ' ')}
            </span>
            <h1 className="text-2xl font-bold dark:text-white mb-2">Pollution Hotspot</h1>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {hotspot.center.lat.toFixed(4)}, {hotspot.center.lng.toFixed(4)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
            <div className={`font-semibold capitalize ${hotspot.status === 'active' ? 'text-red-500' : 'text-green-500'}`}>
              {hotspot.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Reports</div>
            <div className="text-xl font-bold dark:text-white">{hotspot.totalReportCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Reports</div>
            <div className="text-xl font-bold dark:text-white">{hotspot.activeReportCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Severity</div>
            <div className="text-xl font-bold text-orange-500">{hotspot.avgSeverity}%</div>
          </div>
        </div>
      </div>

      {/* Risk Card */}
      {hotspot.risk && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-red-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Risk Assessment
          </h2>
          <div className="bg-red-50 text-red-900 p-4 rounded-lg mb-4">
            {hotspot.risk.summary}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Risk Band</p>
              <p className="font-semibold capitalize text-red-700">{hotspot.risk.riskBand}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Risk Score</p>
              <p className="font-semibold text-red-700">{hotspot.risk.riskScore}/100</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Key Drivers</p>
            <ul className="list-disc pl-5 space-y-1">
              {hotspot.risk.drivers.map((driver, idx) => (
                <li key={idx} className="text-sm text-gray-700">{driver}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Context Card */}
      {latestContext && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold dark:text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" /> Current Environment
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">AQI</div>
              <div className="font-semibold text-lg">{latestContext.air?.aqi ?? 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Cloud className="w-4 h-4 mr-1"/> PM2.5</div>
              <div className="font-semibold text-lg">{latestContext.air?.pm25 || 'N/A'} µg/m³</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Temperature</div>
              <div className="font-semibold text-lg">{latestContext.weather?.temperatureC ?? 'N/A'}°C</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Wind className="w-4 h-4 mr-1"/> Wind</div>
              <div className="font-semibold text-lg">{latestContext.weather?.windSpeedMps ?? 'N/A'} m/s</div>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div>
        <h2 className="text-xl font-bold dark:text-white mb-4">Recent Reports</h2>
        <div className="grid gap-4">
          {reports.map(report => (
            <Link key={report.id} to={`/report/${report.id}`} className="block">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-colors flex gap-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                  {report.imageUrl ? (
                    <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ImageOff className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px] uppercase font-semibold opacity-70">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="font-medium dark:text-white capitalize">{report.category.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {report.aiVerification?.severity !== undefined && (
                    <div className="text-sm text-orange-500 font-medium mt-1">
                      Severity: {report.aiVerification.severity}%
                    </div>
                  )}
                  {report.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{report.note}</p>
                  )}
                  <div className="mt-2 text-xs font-medium text-gray-500 capitalize">
                    Status: <span className={report.status === 'verified' ? 'text-green-500' : 'text-blue-500'}>{report.status}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {reports.length === 0 && (
            <div className="text-gray-500 text-center py-8">No reports found for this hotspot.</div>
          )}
        </div>
      </div>
    </div>
  );
}
