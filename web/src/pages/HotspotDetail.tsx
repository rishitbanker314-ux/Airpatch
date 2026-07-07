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
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20 pt-24">
      <Link to="/" className="inline-flex items-center text-primary hover:text-primary-container hover:underline mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Map
      </Link>

      <ResolutionPanel 
        hotspotId={hotspot.id} 
        isResolved={hotspot.status === 'resolved'} 
        onResolved={fetchDetails} 
      />

      {/* Header Card */}
      <div className="glass-card p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-sm font-medium mb-2 capitalize">
              {hotspot.category.replace(/_/g, ' ')}
            </span>
            <h1 className="text-2xl font-bold text-on-surface mb-2">Pollution Hotspot</h1>
            <div className="flex items-center text-on-surface-variant text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {hotspot.center.lat.toFixed(4)}, {hotspot.center.lng.toFixed(4)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-on-surface-variant">Status</div>
            <div className={`font-semibold capitalize ${hotspot.status === 'active' ? 'text-error' : 'text-aqi-good'}`}>
              {hotspot.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-outline-variant/30">
          <div>
            <div className="text-sm text-on-surface-variant">Total Reports</div>
            <div className="text-xl font-bold text-on-surface">{hotspot.totalReportCount}</div>
          </div>
          <div>
            <div className="text-sm text-on-surface-variant">Active Reports</div>
            <div className="text-xl font-bold text-on-surface">{hotspot.activeReportCount}</div>
          </div>
          <div>
            <div className="text-sm text-on-surface-variant">Avg Severity</div>
            <div className="text-xl font-bold text-aqi-moderate data-mono">{hotspot.avgSeverity}%</div>
          </div>
        </div>
      </div>

      {/* Risk Card */}
      {hotspot.risk && (
        <div className="glass-card p-6 mb-8 border-error/30">
          <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />
            Risk Assessment
          </h2>
          <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-4 text-sm leading-relaxed">
            {hotspot.risk.summary || 'Risk summary unavailable for this hotspot.'}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-on-surface-variant">Risk Band</p>
              <p className="font-semibold capitalize text-error">{hotspot.risk.riskBand || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Risk Score</p>
              <p className="font-semibold text-error data-mono">{hotspot.risk.riskScore || 0}/100</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Key Drivers</p>
            <ul className="list-disc pl-5 space-y-1">
              {hotspot.risk.drivers?.map((driver: string, idx: number) => (
                <li key={idx} className="text-sm text-on-surface-variant">{driver}</li>
              ))}
              {!hotspot.risk.drivers?.length && (
                <li className="text-sm text-on-surface-variant italic">No drivers available</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Context Card */}
      {latestContext && (
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-lg font-semibold text-on-surface mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary" /> Current Environment
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-on-surface-variant">AQI</div>
              <div className="font-semibold text-lg text-on-surface data-mono">{latestContext.air?.aqi ?? 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-on-surface-variant flex items-center"><Cloud className="w-4 h-4 mr-1"/> PM2.5</div>
              <div className="font-semibold text-lg text-on-surface data-mono">{latestContext.air?.pm25 || 'N/A'} µg/m³</div>
            </div>
            <div>
              <div className="text-sm text-on-surface-variant">Temperature</div>
              <div className="font-semibold text-lg text-on-surface data-mono">{latestContext.weather?.temperatureC ?? 'N/A'}°C</div>
            </div>
            <div>
              <div className="text-sm text-on-surface-variant flex items-center"><Wind className="w-4 h-4 mr-1"/> Wind</div>
              <div className="font-semibold text-lg text-on-surface data-mono">{latestContext.weather?.windSpeedMps ?? 'N/A'} m/s</div>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-4">Recent Reports</h2>
        <div className="grid gap-4">
          {reports.map(report => (
            <Link key={report.id} to={`/report/${report.id}`} className="block">
              <div className="glass-card p-4 hover:border-primary/50 transition-colors flex gap-4">
                <div className="w-24 h-24 bg-surface-dim rounded-lg overflow-hidden shrink-0">
                  {report.imageUrl ? (
                    <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover mix-blend-overlay opacity-90" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                      <ImageOff className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px] uppercase font-semibold opacity-70 tracking-wider">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-on-surface capitalize">{report.category.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-on-surface-variant data-mono">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {report.aiVerification?.severity !== undefined && (
                    <div className="text-sm text-aqi-moderate font-medium mt-1">
                      Severity: <span className="data-mono">{report.aiVerification.severity}%</span>
                    </div>
                  )}
                  {report.note && (
                    <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{report.note}</p>
                  )}
                  <div className="mt-2 text-xs font-medium text-on-surface-variant capitalize">
                    Status: <span className={report.status === 'verified' ? 'text-aqi-good' : 'text-primary'}>{report.status}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {reports.length === 0 && (
            <div className="text-on-surface-variant text-center py-8">No reports found for this hotspot.</div>
          )}
        </div>
      </div>
    </div>
  );
}
