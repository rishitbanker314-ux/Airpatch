import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscribeToReport } from '../services/reports';
import type { Report } from '../shared/types';
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ResolutionPanel } from '../components/ResolutionPanel';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    partial: 'bg-orange-100 text-orange-800',
    failed: 'bg-red-100 text-red-800',
  };
  const badgeStyle = styles[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${badgeStyle}`}>
      {status}
    </span>
  );
}

export function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    const unsubscribe = subscribeToReport(id, (data) => {
      if (data) {
        setReport(data);
        setError(null);
      } else {
        setError('Report not found');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background p-4">
        <AlertTriangle className="w-12 h-12 text-error mb-4" />
        <h2 className="text-xl font-bold mb-4 text-on-surface">{error || 'Report not found'}</h2>
        <Link to="/" className="text-primary hover:text-primary-container hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to map
        </Link>
        
        {report.hotspotId ? (
          <ResolutionPanel 
            hotspotId={report.hotspotId} 
            reportId={report.id} 
            isResolved={report.status === 'resolved'} 
            onResolved={() => {}} 
          />
        ) : (
          <div className="glass-card p-6 mb-6">
            <p className="text-on-surface-variant text-sm">This report has not been grouped into a hotspot yet, so it cannot be resolved directly.</p>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <div className="h-64 bg-surface-dim relative">
            <img 
              src={report.imageUrl} 
              alt="Pollution report" 
              className="w-full h-full object-cover mix-blend-overlay opacity-90"
            />
            <div className="absolute top-4 right-4 glass-panel px-3 py-1 flex items-center">
              {report.status === 'pending' && <Clock className="w-4 h-4 text-aqi-moderate mr-2" />}
              {report.status === 'verified' && <CheckCircle className="w-4 h-4 text-aqi-good mr-2" />}
              {(report.status === 'rejected' || report.status === 'failed') && <AlertTriangle className="w-4 h-4 text-error mr-2" />}
              <span className="text-sm font-medium capitalize text-on-surface">{report.status}</span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-on-surface capitalize">
                {report.category.replace(/_/g, ' ')}
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Reported on {report.createdAt?.toLocaleDateString() || 'Unknown date'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/30">
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1">Location</p>
                <p className="text-sm text-on-surface">
                  {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1">AI Verification</p>
                <StatusBadge status={report.aiStatus} />
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1">Environmental Context</p>
                <StatusBadge status={report.contextStatus} />
              </div>
            </div>

            {report.note && (
              <div className="pt-4 border-t border-outline-variant/30">
                <p className="text-sm font-medium text-on-surface-variant">Note</p>
                <p className="text-sm text-on-surface mt-1">{report.note}</p>
              </div>
            )}

            {report.aiVerification && report.aiStatus === 'completed' && (
              <div className="pt-4 border-t border-outline-variant/30">
                <h3 className="text-lg font-semibold text-on-surface mb-4">AI Verification</h3>
                <div className="bg-black/5 border border-outline-variant/50 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-on-surface-variant">Valid Event</span>
                    <span className={`text-sm font-semibold ${report.aiVerification.isPollutionEvent ? 'text-green-600' : 'text-red-600'}`}>
                      {report.aiVerification.isPollutionEvent ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-on-surface-variant">Prediction</span>
                    <span className="text-sm font-semibold text-on-surface capitalize">
                      {report.aiVerification.predictedCategory?.replace(/_/g, ' ') || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-on-surface-variant">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-surface-dim rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${report.aiVerification.confidence || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-on-surface data-mono">{report.aiVerification.confidence || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-on-surface-variant">Severity</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-surface-dim rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${(report.aiVerification.severity || 0) > 3 ? 'bg-error' : (report.aiVerification.severity || 0) > 2 ? 'bg-aqi-moderate' : 'bg-aqi-good'}`}
                          style={{ width: `${((report.aiVerification.severity || 0) / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-on-surface data-mono">{report.aiVerification.severity || 0}/5</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-on-surface-variant block mb-1">Reasoning</span>
                    <p className="text-sm text-on-surface">{report.aiVerification.reason || 'No reasoning provided.'}</p>
                  </div>
                </div>
              </div>
            )}
            {report.context && (report.contextStatus === 'completed' || report.contextStatus === 'partial') && (
              <div className="pt-4 border-t border-outline-variant/30">
                <h3 className="text-lg font-semibold text-on-surface mb-4">Environmental Context</h3>
                <div className="bg-black/5 border border-outline-variant/50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-on-surface-variant block mb-1">AQI</span>
                    <span className={`text-lg font-bold ${(report.context.air?.aqi || 0) > 150 ? 'text-red-500' : (report.context.air?.aqi || 0) > 100 ? 'text-orange-500' : (report.context.air?.aqi || 0) > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {report.context.air?.aqi ?? '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Weather</span>
                    <span className="text-md font-semibold text-gray-900">{report.context.weather?.weatherMain ?? 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Particulate Matter</span>
                    <span className="text-sm text-gray-700">
                      PM2.5: {report.context.air?.pm25 ?? '--'} µg/m³<br/>
                      PM10: {report.context.air?.pm10 ?? '--'} µg/m³
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Wind & Temp</span>
                    <span className="text-sm text-gray-700">
                      {report.context.weather?.temperatureC ?? '--'}°C, {report.context.weather?.humidityPct ?? '--'}% Hum<br/>
                      {report.context.weather?.windSpeedMps ?? '--'} m/s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
