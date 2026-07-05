import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReport } from '../services/reports';
import type { Report } from '../shared/types';
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ResolutionPanel } from '../components/ResolutionPanel';

export function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!id) return;
    try {
      const data = await getReport(id);
      if (data) {
        setReport(data);
      } else {
        setError('Report not found');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-4">{error || 'Report not found'}</h2>
        <Link to="/" className="text-blue-500 hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to map
        </Link>
        
        <ResolutionPanel 
          targetId={report.id} 
          targetType="report" 
          isResolved={report.status === 'resolved'} 
          onResolved={fetchReport} 
        />

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-64 bg-gray-200 relative">
            <img 
              src={report.imageMetadata.url} 
              alt="Pollution report" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-sm">
              {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500 mr-2" />}
              {report.status === 'verified' && <CheckCircle className="w-4 h-4 text-green-500 mr-2" />}
              {report.status === 'rejected' && <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />}
              <span className="text-sm font-medium capitalize">{report.status}</span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {report.category.replace(/_/g, ' ')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Reported on {report.imageMetadata.uploadedAt?.toLocaleDateString() || 'Unknown date'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-sm text-gray-900 mt-1">
                  {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">AI Status</p>
                <p className="text-sm text-gray-900 mt-1 capitalize">{report.aiStatus}</p>
              </div>
            </div>

            {report.note && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500">Note</p>
                <p className="text-sm text-gray-900 mt-1">{report.note}</p>
              </div>
            )}

            {report.aiVerification && report.aiStatus === 'processed' && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Verification</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Prediction</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {report.aiVerification.predictedCategory?.replace(/_/g, ' ') || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${report.aiVerification.confidence || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{report.aiVerification.confidence || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Severity</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${(report.aiVerification.severity || 0) > 70 ? 'bg-red-500' : (report.aiVerification.severity || 0) > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${report.aiVerification.severity || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{report.aiVerification.severity || 0}/100</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Reasoning</span>
                    <p className="text-sm text-gray-700">{report.aiVerification.reason || 'No reasoning provided.'}</p>
                  </div>
                </div>
              </div>
            )}
            {report.context && report.contextStatus === 'processed' && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Context</h3>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">AQI</span>
                    <span className={`text-lg font-bold ${(report.context.aqi || 0) > 150 ? 'text-red-500' : (report.context.aqi || 0) > 100 ? 'text-orange-500' : (report.context.aqi || 0) > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {report.context.aqi ?? '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Weather</span>
                    <span className="text-md font-semibold text-gray-900">{report.context.weatherCondition || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Particulate Matter</span>
                    <span className="text-sm text-gray-700">
                      PM2.5: {report.context.pm25 ?? '--'} µg/m³<br/>
                      PM10: {report.context.pm10 ?? '--'} µg/m³
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Wind & Temp</span>
                    <span className="text-sm text-gray-700">
                      {report.context.temperature ?? '--'}°C<br/>
                      {report.context.windSpeed ?? '--'} km/h {report.context.windDirection || ''}
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
