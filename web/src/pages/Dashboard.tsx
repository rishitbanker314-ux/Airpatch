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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="glass-card p-4">Loading dashboard...</div>
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

  const dominantCategory = Object.entries(categoryCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

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
    <div className="glass-card p-6 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h2>
      <div className="flex flex-col gap-3 flex-1">
        {items.length === 0 ? (
          <div className="text-on-surface-variant text-sm">No hotspots match this criteria.</div>
        ) : items.map((h) => (
          <Link 
            key={h.id} 
            to={`/hotspot/${h.id}`}
            className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 hover:border-primary/50 hover:bg-black/5 transition-all"
          >
            <div>
              <div className="font-medium capitalize text-sm text-on-surface">
                {formatCategory(h.category)}
              </div>
              <div className="text-xs text-on-surface-variant flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {h.center.lat.toFixed(3)}, {h.center.lng.toFixed(3)}
              </div>
            </div>
            
            <div className="text-right flex items-center gap-2">
              {highlightField === 'reports' && (
                <div className="px-2 py-1 bg-primary-container text-on-primary-container rounded-lg text-xs font-semibold">
                  {h.activeReportCount} Active
                </div>
              )}
              {highlightField === 'risk' && h.risk && (
                <div className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                  ${h.risk.riskBand === 'critical' ? 'bg-error text-on-error' : 'bg-aqi-moderate text-surface-dim'}
                `}>
                  {h.risk.riskBand} ({h.risk.riskScore})
                </div>
              )}
              {highlightField === 'time' && (
                <div className="text-xs text-on-surface-variant data-mono">
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
    <div className="min-h-full bg-background p-4 md:p-8 pb-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-on-surface mb-2">Authority Dashboard</h1>
            <p className="text-on-surface-variant">Real-time overview of active environmental hotspots.</p>
          </div>
          <Link to="/" className="text-primary hover:text-primary-container hover:underline font-medium transition-colors">View Map</Link>
        </header>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="text-on-surface-variant text-sm font-medium mb-1">Total Active Hotspots</div>
            <div className="text-3xl font-bold text-on-surface data-mono">{hotspots.length}</div>
          </div>
          <div className="glass-card p-6 border-error/30 bg-error/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="text-error text-sm font-medium mb-1 flex items-center gap-1 relative z-10">
              <AlertTriangle className="w-4 h-4" /> High/Critical Risk
            </div>
            <div className="text-3xl font-bold text-error data-mono relative z-10">{highRiskHotspots.length}</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-on-surface-variant text-sm font-medium mb-1">Most Active Category</div>
            <div className="text-xl font-bold text-on-surface capitalize">
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
          <div className="glass-card p-6 flex flex-col h-full">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
              <Activity className="w-5 h-5 text-primary" />
              Category Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(categoryCounts).map(([cat, count]: [string, any]) => {
                const percentage = (count / hotspots.length) * 100;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium text-on-surface">{formatCategory(cat)}</span>
                      <span className="text-on-surface-variant font-semibold data-mono">{count}</span>
                    </div>
                    <div className="w-full bg-surface-dim rounded-full h-2 overflow-hidden border border-outline-variant/30">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(categoryCounts).length === 0 && (
                <div className="text-on-surface-variant text-sm">No data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
