import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHotspots } from '../services/hotspots';
import type { Hotspot, PollutionCategory } from '../shared/types';
import { AlertTriangle, Activity, MapPin, Clock, BarChart3, AlertCircle } from 'lucide-react';

export function Dashboard() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex p-8 justify-center text-red-500 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {error}
      </div>
    );
  }

  // --- Derived Statistics ---
  
  const highRiskHotspots = hotspots.filter(
    h => h.risk?.riskBand === 'high' || h.risk?.riskBand === 'critical'
  ).sort((a, b) => (b.risk?.riskScore || 0) - (a.risk?.riskScore || 0));

  const topActiveHotspots = [...hotspots]
    .sort((a, b) => b.activeReportCount - a.activeReportCount)
    .slice(0, 5);

  const recentEscalations = [...hotspots]
    .sort((a, b) => b.latestReportAt.getTime() - a.latestReportAt.getTime())
    .slice(0, 5);

  const categoryCounts = hotspots.reduce((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + 1;
    return acc;
  }, {} as Record<PollutionCategory, number>);

  const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const formatCategory = (cat: string) => cat.replace(/_/g, ' ');

  // --- Components ---

  const HotspotListCard = ({ 
    title, 
    icon: Icon, 
    items, 
    highlightField 
  }: { 
    title: string, 
    icon: any, 
    items: Hotspot[], 
    highlightField: 'reports' | 'risk' | 'time' 
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
        <Icon className="w-5 h-5 text-blue-500" />
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="text-gray-500 text-sm">No hotspots match this criteria.</div>
        ) : items.map((h) => (
          <Link 
            key={h.id} 
            to={`/hotspot/${h.id}`}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
          >
            <div>
              <div className="font-medium capitalize text-sm dark:text-gray-200">
                {formatCategory(h.category)}
              </div>
              <div className="text-xs text-gray-500 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {h.center.lat.toFixed(3)}, {h.center.lng.toFixed(3)}
              </div>
            </div>
            
            <div className="text-right flex items-center gap-2">
              {highlightField === 'reports' && (
                <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                  {h.activeReportCount} Active
                </div>
              )}
              {highlightField === 'risk' && h.risk && (
                <div className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                  ${h.risk.riskBand === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}
                `}>
                  {h.risk.riskBand} ({h.risk.riskScore})
                </div>
              )}
              {highlightField === 'time' && (
                <div className="text-xs text-gray-500">
                  {h.latestReportAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold dark:text-white mb-2">Authority Dashboard</h1>
            <p className="text-gray-500">Real-time overview of active environmental hotspots.</p>
          </div>
          <Link to="/" className="text-blue-500 hover:underline font-medium">View Map</Link>
        </header>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-gray-500 text-sm font-medium mb-1">Total Active Hotspots</div>
            <div className="text-3xl font-bold dark:text-white">{hotspots.length}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 shadow-sm border border-red-100 dark:border-red-900">
            <div className="text-red-800 dark:text-red-200 text-sm font-medium mb-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> High/Critical Risk
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{highRiskHotspots.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-gray-500 text-sm font-medium mb-1">Most Active Category</div>
            <div className="text-xl font-bold dark:text-white capitalize">
              {dominantCategory ? formatCategory(dominantCategory[0]) : 'None'}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HotspotListCard 
            title="High-Risk Escalations" 
            icon={AlertCircle} 
            items={highRiskHotspots.slice(0, 5)} 
            highlightField="risk" 
          />
          
          <HotspotListCard 
            title="Most Reported Regions" 
            icon={BarChart3} 
            items={topActiveHotspots} 
            highlightField="reports" 
          />
          
          <HotspotListCard 
            title="Recent Activity" 
            icon={Clock} 
            items={recentEscalations} 
            highlightField="time" 
          />

          {/* Breakdown Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <Activity className="w-5 h-5 text-blue-500" />
              Category Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percentage = (count / hotspots.length) * 100;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium dark:text-gray-300">{formatCategory(cat)}</span>
                      <span className="text-gray-500 font-semibold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(categoryCounts).length === 0 && (
                <div className="text-gray-500 text-sm">No data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
