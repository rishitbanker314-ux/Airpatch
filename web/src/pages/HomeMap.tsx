

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { getHotspots } from '../services/hotspots';
import type { Hotspot, PollutionCategory } from '../shared/types';
import { AlertTriangle, Factory, Trash2, Droplets } from 'lucide-react';

export function HomeMap() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PollutionCategory | 'all'>('all');
  const navigate = useNavigate();

  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to New Delhi

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const data = await getHotspots();
        setHotspots(data);
      } catch (err) {
        console.error('Failed to fetch hotspots:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  const filteredHotspots = hotspots.filter(h => filter === 'all' || h.category === filter);

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Overlay Filter UI */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 glass-panel p-2 flex gap-2 overflow-x-auto w-[90%] md:w-auto snap-x custom-scrollbar">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap snap-center ${filter === 'all' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface hover:bg-white/40'}`}
        >
          All
        </button>

        <button 
          onClick={() => setFilter('construction_dust')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap snap-center ${filter === 'construction_dust' ? 'bg-aqi-moderate text-white shadow-md' : 'text-on-surface hover:bg-white/40'}`}
        >
          <AlertTriangle className="w-4 h-4" /> Construction
        </button>
        <button 
          onClick={() => setFilter('industrial_smoke')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap snap-center ${filter === 'industrial_smoke' ? 'bg-aqi-critical text-white shadow-md' : 'text-on-surface hover:bg-white/40'}`}
        >
          <Factory className="w-4 h-4" /> Industrial
        </button>
        <button 
          onClick={() => setFilter('unpicked_waste')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap snap-center ${filter === 'unpicked_waste' ? 'bg-orange-600 text-white shadow-md' : 'text-on-surface hover:bg-white/40'}`}
        >
          <Trash2 className="w-4 h-4" /> Unpicked Waste
        </button>
        <button 
          onClick={() => setFilter('stagnant_water')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap snap-center ${filter === 'stagnant_water' ? 'bg-blue-600 text-white shadow-md' : 'text-on-surface hover:bg-white/40'}`}
        >
          <Droplets className="w-4 h-4" /> Stagnant Water
        </button>
      </div>

      <div className="flex-1 w-full relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">Loading hotspots...</div>
          </div>
        )}
        
        {!loading && hotspots.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg text-gray-600 dark:text-gray-300">
              No hotspots found.
            </div>
          </div>
        )}
        
        <Map
          mapId="DEMO_MAP_ID"
          defaultZoom={11}
          center={mapCenter}
          onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
          disableDefaultUI={true}
        >
          {!loading && filteredHotspots.map((hotspot) => {
            const getBgColor = (band?: string) => {
              switch(band) {
                case 'low': return 'bg-green-500';
                case 'medium': return 'bg-yellow-500';
                case 'high': return 'bg-orange-500';
                case 'critical': return 'bg-red-600';
                default: return 'bg-gray-500';
              }
            };

            // If there are multiple hotspots at the EXACT same location, they might overlap.
            // For MVP, we can apply a tiny random offset or just rely on the number.
            
            return (
              <AdvancedMarker
                key={hotspot.id}
                position={{ lat: hotspot.center.lat, lng: hotspot.center.lng }}
                onClick={() => navigate(`/hotspot/${hotspot.id}`)}
                title={hotspot.category.replace(/_/g, ' ')}
              >
                <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-white text-xs ${getBgColor(hotspot.risk?.riskBand)} hover:scale-110 transition-transform cursor-pointer`}>
                  {hotspot.activeReportCount}
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </div>
    </div>
  );
}
