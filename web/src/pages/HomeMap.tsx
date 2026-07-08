import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { subscribeToHotspots } from '../services/hotspots';
import type { Hotspot, PollutionCategory } from '../shared/types';


export function HomeMap() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PollutionCategory | 'all'>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to New Delhi

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToHotspots((data) => {
      setHotspots(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredHotspots = hotspots.filter(h => filter === 'all' || h.category === filter);

  // Helper for marker color
  const getMarkerColorClass = (band?: string) => {
    switch(band) {
      case 'low': return 'text-aqi-good border-aqi-good shadow-[0_4px_24px_rgba(16,185,129,0.5)]';
      case 'medium': return 'text-aqi-moderate border-aqi-moderate shadow-[0_4px_24px_rgba(245,158,11,0.5)]';
      case 'high': return 'text-orange-500 border-orange-500 shadow-[0_4px_24px_rgba(249,115,22,0.5)]';
      case 'critical': return 'text-aqi-critical border-aqi-critical shadow-[0_4px_24px_rgba(124,58,237,0.5)]';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const getMarkerBgClass = (band?: string) => {
    switch(band) {
      case 'low': return 'bg-aqi-good';
      case 'medium': return 'bg-aqi-moderate';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-aqi-critical';
      default: return 'bg-gray-500';
    }
  };

  const getMarkerIcon = (category: PollutionCategory) => {
    switch(category) {
      case 'construction_dust': return 'construction';
      case 'industrial_smoke': return 'factory';
      case 'unpicked_waste': return 'delete';
      case 'stagnant_water': return 'water_drop';
      default: return 'cloud';
    }
  };

  const getTooltipText = (h: Hotspot) => {
    const band = h.risk?.riskBand?.toUpperCase() || 'UNKNOWN';
    const cat = h.category.replace(/_/g, ' ');
    return `${cat}: ${band} Risk`;
  };

  return (
    <div className="relative h-full w-full flex flex-col font-sans">
      {/* LAYER 3: Floating Canvas Content (Filters, Overlays, FAB) */}
      {/* Map Filters (Top Center) */}
      <div className="absolute z-30 top-20 md:top-[40px] left-1/2 -translate-x-1/2 flex items-center bg-surface-glass backdrop-blur-xl border border-white/40 shadow-sm rounded-full p-1 pointer-events-auto overflow-x-auto hide-scrollbar max-w-[95vw]">
        <button 
          onClick={() => setFilter('all')}
          className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${filter === 'all' ? 'bg-primary-container text-on-primary-container shadow-sm hover:scale-105' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('unpicked_waste')}
          className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${filter === 'unpicked_waste' ? 'bg-primary-container text-on-primary-container shadow-sm hover:scale-105' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          Waste
        </button>
        <button 
          onClick={() => setFilter('construction_dust')}
          className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${filter === 'construction_dust' ? 'bg-primary-container text-on-primary-container shadow-sm hover:scale-105' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          <span className="material-symbols-outlined text-[18px]">construction</span>
          Construction
        </button>
        <button 
          onClick={() => setFilter('industrial_smoke')}
          className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${filter === 'industrial_smoke' ? 'bg-primary-container text-on-primary-container shadow-sm hover:scale-105' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          <span className="material-symbols-outlined text-[18px]">factory</span>
          Industrial
        </button>
        <button 
          onClick={() => setFilter('stagnant_water')}
          className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${filter === 'stagnant_water' ? 'bg-primary-container text-on-primary-container shadow-sm hover:scale-105' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
        >
          <span className="material-symbols-outlined text-[18px]">water_drop</span>
          Water
        </button>
      </div>

      {/* Floating Notifications */}
      <div className="absolute z-30 bottom-6 md:top-[40px] md:bottom-auto right-4 left-4 md:left-auto md:right-[40px] md:w-80 flex-col gap-3 pointer-events-none flex">
        {filteredHotspots.filter(h => !dismissedIds.includes(h.id)).slice(0, 5).map((h, index) => (
          <div 
            key={h.id} 
            onClick={() => navigate(`/hotspot/${h.id}`)} 
            className="bg-surface-glass backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-4 flex items-start gap-3 relative animate-notification hover:scale-[1.02] transition-transform cursor-pointer pointer-events-auto"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
             <button 
               onClick={(e) => { e.stopPropagation(); setDismissedIds(prev => [...prev, h.id]); }}
               className="absolute top-2 right-2 text-on-surface-variant hover:text-error transition-colors"
             >
               <span className="material-symbols-outlined text-[16px]">close</span>
             </button>
             <div className="relative mt-1 shrink-0">
               <div className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${getMarkerBgClass(h.risk?.riskBand)}`}></div>
               <div className={`relative w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] ${getMarkerBgClass(h.risk?.riskBand)}`}></div>
             </div>
             <div className="pr-4">
               <p className="text-sm font-bold text-on-surface capitalize">{h.category.replace(/_/g, ' ')}</p>
               <p className="text-[13px] text-on-surface-variant leading-tight mt-1">
                 {h.activeReportCount} active reports detected in this zone.
               </p>
             </div>
          </div>
        ))}
      </div>



      {/* LAYER 0: Map Background Canvas */}
      <div className="flex-1 w-full relative z-0">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface/50 backdrop-blur-sm">
            <div className="glass-panel p-4 rounded-lg font-bold">Loading hotspots...</div>
          </div>
        )}
        
        <Map
          mapId="DEMO_MAP_ID"
          defaultZoom={11}
          center={mapCenter}
          onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
          disableDefaultUI={true}
        >
          {!loading && filteredHotspots.map((hotspot) => (
            <AdvancedMarker
              key={hotspot.id}
              position={{ lat: hotspot.center.lat, lng: hotspot.center.lng }}
              onClick={() => navigate(`/hotspot/${hotspot.id}`)}
              title={hotspot.category.replace(/_/g, ' ')}
            >
              <div className="flex flex-col items-center group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className={`w-12 h-12 bg-surface-container-lowest/90 backdrop-blur-md rounded-full flex items-center justify-center border-2 ${getMarkerColorClass(hotspot.risk?.riskBand)} ${hotspot.risk?.riskBand === 'critical' ? 'animate-pulse' : ''}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {getMarkerIcon(hotspot.category)}
                  </span>
                </div>
                <div className="mt-2 bg-surface-glass backdrop-blur-md px-3 py-1 rounded-full border border-white/40 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  <span className="font-mono text-xs font-bold text-on-surface">
                    {getTooltipText(hotspot)}
                  </span>
                </div>
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </div>
  );
}
