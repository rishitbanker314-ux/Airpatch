import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHotspots } from '../services/hotspots';
import type { Hotspot, PollutionCategory } from '../shared/types';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>('All Reports');

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const data = await getHotspots();
        setHotspots(data);
      } catch (err) {
        console.error('Failed to fetch hotspots:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex p-8 justify-center text-error bg-background min-h-screen">
        {error}
      </div>
    );
  }

  // --- Derived Statistics ---
  
  const highRiskHotspots = hotspots.filter(
    h => h.risk?.riskBand === 'high' || h.risk?.riskBand === 'critical'
  );

  // Filters logic
  const filteredHotspots = hotspots.filter(h => {
    if (activeFilter === 'All Reports') return true;
    if (activeFilter === 'Critical') return h.risk?.riskBand === 'critical';
    if (activeFilter === 'Unhealthy') return h.risk?.riskBand === 'high';
    if (activeFilter === 'Moderate') return h.risk?.riskBand === 'medium' || h.risk?.riskBand === 'low';
    if (activeFilter === 'Industrial') return h.category === 'industrial_smoke';
    if (activeFilter === 'Waste') return h.category === 'unpicked_waste';
    return true;
  });

  const getCategoryIcon = (cat: PollutionCategory) => {
    switch (cat) {
      case 'unpicked_waste': return 'delete';
      case 'construction_dust': return 'construction';
      case 'industrial_smoke': return 'factory';
      case 'stagnant_water': return 'water_drop';
      default: return 'report';
    }
  };

  const getCategoryLabel = (cat: string) => {
    return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getRiskColorClass = (riskBand?: string) => {
    switch(riskBand) {
      case 'critical': return 'bg-aqi-critical';
      case 'high': return 'bg-aqi-unhealthy';
      case 'medium': return 'bg-aqi-moderate';
      case 'low': return 'bg-aqi-good';
      default: return 'bg-outline-variant';
    }
  };

  const getRiskTextColorClass = (riskBand?: string) => {
    switch(riskBand) {
      case 'critical': return 'text-aqi-critical';
      case 'high': return 'text-aqi-unhealthy';
      case 'medium': return 'text-aqi-moderate';
      case 'low': return 'text-aqi-good';
      default: return 'text-outline-variant';
    }
  };

  const getRiskBgOpacityClass = (riskBand?: string) => {
    switch(riskBand) {
      case 'critical': return 'bg-aqi-critical/10';
      case 'high': return 'bg-aqi-unhealthy/10';
      case 'medium': return 'bg-aqi-moderate/10';
      case 'low': return 'bg-aqi-good/10';
      default: return 'bg-outline-variant/10';
    }
  };
  
  const getRiskBorderOpacityClass = (riskBand?: string) => {
    switch(riskBand) {
      case 'critical': return 'border-aqi-critical/20';
      case 'high': return 'border-aqi-unhealthy/20';
      case 'medium': return 'border-aqi-moderate/20';
      case 'low': return 'border-aqi-good/20';
      default: return 'border-outline-variant/20';
    }
  };

  // Mock data for trends (since we don't have historical resolution time)
  const avgResolutionTime = 4.2;
  const aiVerificationAvg = 94;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-full flex flex-col gap-6 text-on-surface">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4 md:mt-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Active Hotspots</h2>
          <p className="text-sm md:text-base text-on-surface-variant mt-1">Real-time environmental anomaly tracking and dispatch.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_rgba(85,251,180,0.8)]"></span>
            <span className="text-xs font-bold font-mono">System Online</span>
          </div>
        </div>
      </header>

      {/* Summary Stats (Bento Grid Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-aqi-critical/10 rounded-full blur-xl group-hover:bg-aqi-critical/20 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-on-surface-variant">Critical Hotspots</h3>
            <span className="material-symbols-outlined text-aqi-critical">warning</span>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-bold">{highRiskHotspots.length}</span>
            <span className="text-xs font-bold text-aqi-critical flex items-center"><span className="material-symbols-outlined text-[14px]">arrow_upward</span> +{(highRiskHotspots.length > 0 ? 1 : 0)} today</span>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-on-surface-variant">Avg. Resolution Time</h3>
            <span className="material-symbols-outlined text-primary">timer</span>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-bold">{avgResolutionTime}</span>
            <span className="text-base text-on-surface-variant">hrs</span>
            <span className="text-xs font-bold text-secondary flex items-center ml-2"><span className="material-symbols-outlined text-[14px]">arrow_downward</span> 12%</span>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-xl group-hover:bg-secondary/20 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-on-surface-variant">AI Verification Avg</h3>
            <span className="material-symbols-outlined text-secondary">verified_user</span>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-bold">{aiVerificationAvg}</span>
            <span className="text-base text-on-surface-variant">%</span>
            <span className="text-xs font-bold text-on-surface-variant ml-2">High Confidence</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 gap-2 hide-scrollbar">
        {['All Reports', 'Critical', 'Unhealthy', 'Moderate', 'Industrial', 'Waste'].map(filterName => {
           let indicator = null;
           if (filterName === 'Critical') indicator = <span className="w-2 h-2 rounded-full bg-aqi-critical"></span>;
           if (filterName === 'Unhealthy') indicator = <span className="w-2 h-2 rounded-full bg-aqi-unhealthy"></span>;
           if (filterName === 'Moderate') indicator = <span className="w-2 h-2 rounded-full bg-aqi-moderate"></span>;
           if (filterName === 'Industrial') indicator = <span className="material-symbols-outlined text-[16px]">factory</span>;
           if (filterName === 'Waste') indicator = <span className="material-symbols-outlined text-[16px]">delete</span>;

           const isActive = activeFilter === filterName;

           return (
             <button 
               key={filterName}
               onClick={() => setActiveFilter(filterName)}
               className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors ${
                 isActive ? 'bg-primary text-white shadow-sm' : 'glass-panel text-on-surface hover:bg-white/60'
               }`}
             >
               {indicator} {filterName}
             </button>
           );
        })}
      </div>

      {/* Main Layout: Grid + Sidebar */}
      <div className="flex flex-col xl:flex-row gap-6 flex-1">
        {/* Hotspot Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
          {filteredHotspots.length === 0 ? (
            <div className="col-span-full py-12 text-center text-on-surface-variant">
              No hotspots found for this filter.
            </div>
          ) : (
            filteredHotspots.map(hotspot => {
              const riskBand = hotspot.risk?.riskBand;
              const isCritical = riskBand === 'critical';

              return (
                <article key={hotspot.id} className="glass-card p-5 hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden group flex flex-col">
                  {/* Left Border indicator */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${getRiskColorClass(riskBand)} ${isCritical ? 'shadow-[0_0_12px_rgba(124,58,237,0.8)]' : ''}`}></div>
                  
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskBgOpacityClass(riskBand)} ${getRiskTextColorClass(riskBand)} ${getRiskBorderOpacityClass(riskBand)} ${isCritical ? 'pulse-critical' : ''}`}>
                      <span className="material-symbols-outlined text-[12px]">{isCritical ? 'warning' : (riskBand === 'high' ? 'masks' : 'directions_car')}</span> 
                      {(riskBand || 'UNKNOWN').toUpperCase()}
                    </span>
                    <span className="text-xs font-bold font-mono text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> 
                      {hotspot.latestReportAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="pl-2 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline">{getCategoryIcon(hotspot.category)}</span> 
                      {getCategoryLabel(hotspot.category)}
                    </h3>
                    <p className="text-sm text-on-surface-variant mb-4">
                       {hotspot.center.lat.toFixed(4)}, {hotspot.center.lng.toFixed(4)}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      <div className="bg-white/50 border border-white/60 rounded-lg px-3 py-1.5 flex flex-col">
                        <span className="text-[10px] font-bold font-mono text-outline uppercase">Reports</span>
                        <span className="text-sm text-on-surface font-bold">{hotspot.activeReportCount}</span>
                      </div>
                      <div className="bg-white/50 border border-white/60 rounded-lg px-3 py-1.5 flex flex-col">
                        <span className="text-[10px] font-bold font-mono text-outline uppercase">AI Confidence</span>
                        <span className="text-sm text-on-surface font-bold text-secondary">{(hotspot.risk?.riskScore || 0).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      {isCritical ? (
                        <button 
                          onClick={() => navigate(`/hotspot/${hotspot.id}`)}
                          className="flex-1 bg-aqi-critical text-white rounded-xl py-2.5 text-sm font-bold shadow-md hover:bg-aqi-critical/90 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">engineering</span> Dispatch Crew
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate(`/hotspot/${hotspot.id}`)}
                          className="flex-1 glass-panel text-primary rounded-xl py-2.5 text-sm font-bold border border-primary/20 hover:bg-white/80 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">forum</span> Review
                        </button>
                      )}
                      
                      <button 
                        onClick={() => navigate(`/map?lat=${hotspot.center.lat}&lng=${hotspot.center.lng}&zoom=16`)}
                        className={`glass-panel text-on-surface rounded-xl py-2.5 flex items-center justify-center hover:bg-white/80 transition-colors ${isCritical ? 'w-12' : 'flex-1'}`}
                      >
                        {isCritical ? <span className="material-symbols-outlined">map</span> : 'View on Map'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Right Sidebar: Analytics & Trends */}
        <aside className="w-full xl:w-[340px] flex flex-col gap-4">
          <div className="glass-card p-5 flex flex-col h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-surface">24h Network Trend</h3>
              <button className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>

            {/* Pseudo-chart visualization */}
            <div className="flex-1 flex items-end gap-1.5 h-32 mt-auto mb-4 border-b border-outline-variant/30 pb-2 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-outline font-mono font-bold opacity-50 -ml-1 py-1">
                <span>150</span>
                <span>100</span>
                <span>50</span>
              </div>
              {/* Bars */}
              <div className="w-full h-full flex items-end gap-1.5 pl-6">
                {[30, 45, 40, 60, 85, 95, 70, 50, 65].map((height, i) => {
                   const isCritical = height >= 90;
                   const isModerate = height >= 80 && height < 90;
                   const colorClass = isCritical ? 'bg-aqi-critical shadow-[0_0_8px_rgba(124,58,237,0.4)]' : 
                                     isModerate ? 'bg-aqi-moderate' :
                                     (i === 8 ? 'bg-primary-container' : 'bg-primary/20');
                   return (
                     <div 
                       key={i}
                       className={`flex-1 rounded-t-sm hover:opacity-80 transition-colors cursor-pointer relative group ${colorClass}`}
                       style={{ height: `${height}%` }}
                     >
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                         AQI {Math.round(height * 1.5)}
                       </div>
                     </div>
                   );
                })}
              </div>
            </div>

            <div className="flex justify-between font-mono font-bold text-[10px] text-outline uppercase tracking-wider">
              <span>00:00</span>
              <span>12:00</span>
              <span>Now</span>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
              <div>
                <span className="block font-mono font-bold text-[10px] text-outline uppercase mb-1">Peak AQI Today</span>
                <span className="text-xl font-bold text-aqi-critical">154</span>
              </div>
              <div className="text-right">
                <span className="block font-mono font-bold text-[10px] text-outline uppercase mb-1">Network Status</span>
                <span className="text-sm font-bold text-secondary flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Optimal</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
