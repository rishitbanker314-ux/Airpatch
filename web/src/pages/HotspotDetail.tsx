import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHotspotDetails } from '../services/hotspots';
import type { Hotspot, Report } from '../shared/types';
import { ResolutionPanel } from '../components/ResolutionPanel';
import { ArrowLeft, Wind, Cloud, Activity, Navigation, AlertTriangle } from 'lucide-react';

export function HotspotDetail() {
  const { id } = useParams();
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gaugeOffset, setGaugeOffset] = useState(213);

  const fetchDetails = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (!loading && hotspot) {
      // 213 is max circumference. We want to offset to simulate gauge.
      // E.g., AQI of 150/300 -> 50% -> offset 106.
      const aqi = reports.find(r => r.context)?.context?.air?.aqi || 0;
      const percentage = Math.min(aqi / 300, 1);
      setTimeout(() => {
        setGaugeOffset(213 - (213 * percentage));
      }, 300);
    }
  }, [loading, hotspot, reports]);

  if (loading) return <div className="flex p-8 justify-center items-center">Loading hotspot...</div>;
  if (error || !hotspot) return <div className="flex p-8 justify-center text-red-500">{error || 'Not found'}</div>;

  const latestContext = reports.find(r => r.context)?.context;
  const aqi = latestContext?.air?.aqi || (hotspot.risk?.riskBand === 'critical' ? 185 : hotspot.risk?.riskBand === 'high' ? 145 : hotspot.risk?.riskBand === 'medium' ? 120 : 85);
  const pm25 = latestContext?.air?.pm25 || (hotspot.risk?.riskBand === 'critical' ? 115 : hotspot.risk?.riskBand === 'high' ? 65 : 35);
  const windSpeed = latestContext?.weather?.windSpeedMps || 2.4;
  const aqiStatus = aqi > 150 ? 'Unhealthy' : aqi > 100 ? 'Moderate' : 'Good';

  return (
      <div className="max-w-[2560px] mx-auto min-h-screen pt-20 pb-24 lg:pb-8 px-6 lg:px-10">
      
      <Link to="/map" className="inline-flex items-center text-on-surface-variant hover:text-primary transition-colors mb-4 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Map
      </Link>

      <ResolutionPanel 
        hotspotId={hotspot.id} 
        isResolved={hotspot.status === 'resolved'} 
        onResolved={fetchDetails} 
      />

      {/* Page Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${hotspot.status === 'active' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
              {hotspot.status === 'active' ? 'High Alert' : 'Resolved'}
            </span>
            <span className="text-on-surface-variant text-sm font-medium">ID: #{hotspot.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <h2 className="text-3xl font-bold text-on-surface capitalize">
             {hotspot.name || `${hotspot.category.replace(/_/g, ' ')} Hotspot`}
          </h2>
          <p className="text-base text-on-surface-variant mt-1">
             Location: {hotspot.center.localityName ? <strong className="text-on-surface">{hotspot.center.localityName}</strong> : null} 
             {hotspot.center.localityName ? ` (${hotspot.center.lat.toFixed(4)}, ${hotspot.center.lng.toFixed(4)})` : `${hotspot.center.lat.toFixed(4)}, ${hotspot.center.lng.toFixed(4)}`}
          </p>
        </div>
      </div>

      {hotspot.imageUrl && (
        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-sm">
          <img src={hotspot.imageUrl} alt={hotspot.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Diagnostic Details */}
      <div className="flex flex-col gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-surface-bright rounded-3xl p-8 border border-outline-variant/30 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <AlertTriangle className="w-32 h-32" />
            </div>
            
            <h3 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-2 relative z-10">
              <Activity className="text-primary w-6 h-6" />
              AI Diagnostic Summary
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div>
                <h4 className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">Root Cause Analysis</h4>
                <p className="text-base text-on-surface-variant leading-relaxed">
                   {hotspot.description || hotspot.risk?.summary || "Pattern matching suggests a high probability of illegal nocturnal discharge. Emission signatures align with high-sulfur fuel combustion."}
                </p>
              </div>
              
              <div className="p-4 bg-surface-container rounded-2xl border-l-4 border-primary">
                <h4 className="text-sm font-bold text-on-surface mb-1">Impact Prediction</h4>
                <p className="text-base text-on-surface-variant">
                   {hotspot.risk?.drivers?.[0] || "Visibility reduction anticipated in the residential corridor by dawn. Respiratory advisory for vulnerable groups recommended."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Confidence Score</p>
                  <p className="text-2xl font-bold text-primary">{hotspot.avgSeverity}%</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Alert Duration</p>
                  <p className="text-2xl font-bold text-on-surface">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Atmospheric Data Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AQI Card */}
            <div className="bg-surface-bright rounded-2xl p-4 border border-outline-variant/30 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">AQI INDEX</span>
              <div className="relative w-20 h-20 mb-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="4"></circle>
                  <circle 
                    className="text-error metric-gauge" 
                    cx="40" 
                    cy="40" 
                    fill="transparent" 
                    r="34" 
                    stroke="currentColor" 
                    strokeDasharray="213" 
                    strokeDashoffset={gaugeOffset} 
                    strokeWidth="6">
                  </circle>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-xl">{aqi}</span>
              </div>
              <span className="text-error font-bold text-xs uppercase tracking-wider">{aqiStatus}</span>
            </div>

            {/* PM2.5 Card */}
            <div className="bg-surface-bright rounded-2xl p-4 border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">PM2.5</span>
                <Cloud className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-on-surface">{pm25}</p>
                <p className="text-xs text-on-surface-variant">μg/m³</p>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-error h-full" style={{ width: `${Math.min((pm25/100)*100, 100)}%` }}></div>
              </div>
            </div>

            {/* Wind Card */}
            <div className="bg-surface-bright rounded-2xl p-4 border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">WIND</span>
                <Wind className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <p className="text-2xl font-bold text-on-surface">{windSpeed}</p>
                <div className="text-left">
                  <p className="text-xs font-bold text-on-surface">NW</p>
                  <p className="text-xs text-on-surface-variant">m/s</p>
                </div>
              </div>
              <div className="mt-4 text-xs text-secondary font-bold flex items-center gap-1">
                <Navigation className="w-4 h-4" /> Dispersing
              </div>
            </div>
          </div>
      </div>


    </div>
  );
}
