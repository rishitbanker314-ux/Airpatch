import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHotspotDetails } from '../services/hotspots';
import type { Hotspot, Report } from '../shared/types';
import { ResolutionPanel } from '../components/ResolutionPanel';
import { ArrowLeft, CheckCircle, Share, Wind, Cloud, MapPin, Activity, Navigation, AlertTriangle, Layers, Plus, Minus } from 'lucide-react';

export function HotspotDetail() {
  const { id } = useParams();
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gaugeOffset, setGaugeOffset] = useState(213);

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
  const aqi = latestContext?.air?.aqi || 0;
  const pm25 = latestContext?.air?.pm25 || 0;
  const windSpeed = latestContext?.weather?.windSpeedMps || 0;
  const aqiStatus = aqi > 150 ? 'Unhealthy' : aqi > 100 ? 'Moderate' : 'Good';

  return (
    <div className="max-w-[2560px] mx-auto min-h-screen pt-20 pb-24 lg:pb-8 px-6 lg:px-10">
      
      <Link to="/" className="inline-flex items-center text-on-surface-variant hover:text-primary transition-colors mb-4 text-sm font-medium">
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
             {hotspot.category.replace(/_/g, ' ')} Hotspot
          </h2>
          <p className="text-base text-on-surface-variant mt-1">
             Pollution anomaly detected at {hotspot.center.lat.toFixed(4)}, {hotspot.center.lng.toFixed(4)}.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-xl text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors">
            <Share className="w-5 h-5" /> Export
          </button>
          {hotspot.status !== 'resolved' && (
            <button 
              onClick={() => {
                document.getElementById('resolution-panel')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all">
              <CheckCircle className="w-5 h-5" fill="currentColor" stroke="none" /> Mark as Resolved
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Diagnostic & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left: AI Diagnostic Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
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
                   {hotspot.risk?.summary || "Pattern matching suggests a high probability of illegal nocturnal discharge. Emission signatures align with high-sulfur fuel combustion."}
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

        {/* Right: Detailed Map/Evidence Panel */}
        <div className="lg:col-span-7">
          <div className="bg-surface-bright rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Map Viewport - using static placeholder for UI match, but we could embed actual map */}
            <div className="relative flex-1 min-h-[400px] bg-surface-container overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop" 
                alt="Map View" 
                className="w-full h-full object-cover mix-blend-overlay opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/40 to-transparent pointer-events-none"></div>
              
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <div className="glass-surface p-2 rounded-xl flex items-center gap-3 pr-4 shadow-sm border border-white/50">
                  <div className="w-10 h-10 bg-error/20 rounded-lg flex items-center justify-center">
                     <MapPin className="text-error w-5 h-5" fill="currentColor" stroke="none" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Source Origin</p>
                    <p className="text-xs text-on-surface-variant capitalize">{hotspot.category.replace(/_/g, ' ')} Cluster</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <button className="w-10 h-10 glass-surface rounded-lg flex items-center justify-center hover:bg-surface-container-high transition-colors shadow-sm">
                  <Plus className="w-5 h-5 text-on-surface" />
                </button>
                <button className="w-10 h-10 glass-surface rounded-lg flex items-center justify-center hover:bg-surface-container-high transition-colors shadow-sm">
                  <Minus className="w-5 h-5 text-on-surface" />
                </button>
                <button className="w-10 h-10 glass-surface rounded-lg flex items-center justify-center hover:bg-surface-container-high transition-colors shadow-sm">
                  <Layers className="w-5 h-5 text-on-surface" />
                </button>
              </div>
            </div>

            {/* Panel Tabs */}
            <div className="px-8 py-4 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
              <div className="flex gap-8">
                <button className="text-sm font-bold text-primary border-b-2 border-primary pb-4 -mb-[17px]">Live Heatmap</button>
                <button className="text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors pb-4 -mb-[17px]">Sensor Network</button>
                <button className="text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors pb-4 -mb-[17px]">Wind Trajectory</button>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                Live Feed Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Evidence Gallery */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-on-surface">Community Evidence</h3>
            <p className="text-base text-on-surface-variant">Verified on-the-ground visual reports from active contributors.</p>
          </div>
          <button className="text-primary font-bold hover:underline text-sm">View All {reports.length} Reports</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {reports.map((report) => (
             <Link key={report.id} to={`/report/${report.id}`} className="block">
              <div className="group relative bg-surface-bright rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col">
                <div className="aspect-square relative bg-surface-container flex-shrink-0">
                  {report.imageUrl ? (
                     <img src={report.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-on-surface-variant">No Image</div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button className="text-white text-xs font-bold flex items-center gap-1">
                      <Activity className="w-4 h-4" /> View Detail
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-surface-container-highest/90 backdrop-blur-md text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    {report.status === 'verified' ? (
                       <><CheckCircle className="w-3 h-3 text-secondary" fill="currentColor" stroke="none" /> Verified</>
                    ) : (
                       <span>Pending</span>
                    )}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                       U
                    </div>
                    <span className="text-xs font-bold text-on-surface">@User_{report.id.slice(-4)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2">{report.note || report.category.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-on-surface-variant/60 mt-auto pt-2 uppercase">
                     {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          
          {/* Add CTA Card */}
          <div className="group border-2 border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-surface-container-lowest min-h-[250px]">
            <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
            </div>
            <p className="font-bold text-on-surface">Submit Evidence</p>
            <p className="text-xs text-on-surface-variant mt-1">Upload photos to aid diagnostic accuracy.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
