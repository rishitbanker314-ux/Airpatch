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
        targetId={hotspot.id} 
        targetType="hotspot" 
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
              {hotspot.centerCoordinates.latitude.toFixed(4)}, {hotspot.centerCoordinates.longitude.toFixed(4)}
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
            <div className="text-xl font-bold text-orange-500">{hotspot.averageSeverity}%</div>
          </div>
        </div>
      </div>

      {/* Risk Card */}
      {hotspot.riskSummary && (
        <div className={`rounded-2xl p-6 mb-6 border ${
          hotspot.riskSummary.riskBand === 'critical' ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100' :
          hotspot.riskSummary.riskBand === 'high' ? 'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-100' :
          hotspot.riskSummary.riskBand === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100' :
          'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> 
                Risk Assessment
                <span className="uppercase text-xs tracking-wider font-bold px-2 py-1 rounded-full bg-white/50 dark:bg-black/20 ml-2">
                  {hotspot.riskSummary.riskBand}
                </span>
              </h2>
              <p className="text-sm mt-1 opacity-80">{hotspot.riskSummary.summary}</p>
            </div>
            <div className="text-3xl font-bold">
              {hotspot.riskSummary.riskScore}
              <span className="text-sm font-normal opacity-70">/100</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2 opacity-90">Key Drivers:</div>
            <ul className="list-disc pl-5 text-sm space-y-1 opacity-80">
              {hotspot.riskSummary.drivers.map((driver, idx) => (
                <li key={idx}>{driver}</li>
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
              <div className="font-semibold text-lg">{latestContext.aqi}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Cloud className="w-4 h-4 mr-1"/> PM2.5</div>
              <div className="font-semibold text-lg">{latestContext.pm25 || 'N/A'} µg/m³</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Temperature</div>
              <div className="font-semibold text-lg">{latestContext.temperature}°C</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Wind className="w-4 h-4 mr-1"/> Wind</div>
              <div className="font-semibold text-lg">{latestContext.windSpeed} km/h</div>
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
                  {report.imageMetadata?.url ? (
                    <img src={report.imageMetadata.url} alt="Report" className="w-full h-full object-cover" />
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
