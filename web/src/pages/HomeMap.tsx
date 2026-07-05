

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { getHotspots } from '../services/hotspots';
import type { Hotspot, PollutionCategory } from '../shared/types';
import { AlertTriangle, Factory, Trash2 } from 'lucide-react';

export function HomeMap() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PollutionCategory | 'all'>('all');
  const navigate = useNavigate();

  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const data = await getHotspots();
        setHotspots(data);
        
        // Auto-center map on the active hotspots if available
        if (data.length > 0) {
          const sumLat = data.reduce((sum, h) => sum + h.center.lat, 0);
          const sumLng = data.reduce((sum, h) => sum + h.center.lng, 0);
          setMapCenter({
            lat: sumLat / data.length,
            lng: sumLng / data.length
          });
        }
      } catch (err) {
        console.error('Failed to fetch hotspots:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  const filteredHotspots = hotspots.filter(h => filter === 'all' || h.category === filter);

  // Map category to a specific color for the pin
  const getPinColor = (category: PollutionCategory) => {
    switch (category) {
      case 'waste_burning_smoke': return '#ef4444'; // red-500
      case 'construction_dust': return '#eab308'; // yellow-500
      case 'industrial_smoke': return '#8b5cf6'; // violet-500
      default: return '#3b82f6';
    }
  };

  return (
    <div className="relative h-screen w-full flex flex-col">
      {/* Overlay Filter UI */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg flex gap-2">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('waste_burning_smoke')}
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${filter === 'waste_burning_smoke' ? 'bg-red-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          <Trash2 className="w-4 h-4" /> Waste
        </button>
        <button 
          onClick={() => setFilter('construction_dust')}
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${filter === 'construction_dust' ? 'bg-yellow-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          <AlertTriangle className="w-4 h-4" /> Construction
        </button>
        <button 
          onClick={() => setFilter('industrial_smoke')}
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${filter === 'industrial_smoke' ? 'bg-violet-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          <Factory className="w-4 h-4" /> Industrial
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
          defaultZoom={11}
          center={mapCenter}
          onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
          mapId="AIRPATCH_MVP_MAP_ID"
          disableDefaultUI={true}
        >
          {!loading && filteredHotspots.map((hotspot) => (
            <AdvancedMarker
              key={hotspot.id}
              position={{ lat: hotspot.center.lat, lng: hotspot.center.lng }}
              onClick={() => navigate(`/hotspot/${hotspot.id}`)}
              title={`Hotspot: ${hotspot.category}`}
            >
              <Pin 
                background={getPinColor(hotspot.category)} 
                borderColor="#ffffff" 
                glyphColor="#ffffff" 
              />
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </div>
  );
}
