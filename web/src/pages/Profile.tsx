import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { subscribeToUserReports } from '../services/reports';
import { subscribeToUserResolutions } from '../services/resolutions';
import type { Report, Resolution } from '../shared/types';
import { formatDistanceToNow } from 'date-fns';

export function Profile() {
  const { user, dbUser, loading } = useAuth();
  
  // Base trust is 50%. Each verified report awards 50 points. 
  // We scale so 500 points (10 reports) reaches ~99%.
  const trustLevel = Math.min(99, Math.floor(50 + (dbUser?.points || 0) / 10));
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loadingResolutions, setLoadingResolutions] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    const unsubscribeReports = subscribeToUserReports(user.uid, (userReports) => {
      setReports(userReports);
      setLoadingReports(false);
    });

    const unsubscribeResolutions = subscribeToUserResolutions(user.uid, (userResolutions) => {
      setResolutions(userResolutions);
      setLoadingResolutions(false);
    });

    return () => {
      unsubscribeReports();
      unsubscribeResolutions();
    };
  }, [user, loading, navigate]);

  if (loading || loadingReports || loadingResolutions) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const verifiedCount = reports.filter(r => r.status === 'verified' || r.status === 'resolved').length + resolutions.length;
  
  type ActivityItem = 
    | { type: 'report'; data: Report; timestamp: number }
    | { type: 'resolution'; data: Resolution; timestamp: number };

  const activities: ActivityItem[] = [
    ...reports.map(r => ({ type: 'report' as const, data: r, timestamp: r.createdAt.getTime() })),
    ...resolutions.map(r => ({ type: 'resolution' as const, data: r, timestamp: r.createdAt.getTime() }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="p-4 lg:p-10 max-w-[1440px] mx-auto space-y-10 lg:space-y-12 pb-32">
      
      {/* Profile Header Section */}
      <section>
        <div className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden rounded-[32px]">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-primary/20 flex items-center justify-center text-4xl text-primary font-bold">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-secondary text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="font-headline text-3xl font-semibold text-on-surface">{user?.displayName || 'Anonymous Steward'}</h2>
            <p className="text-on-surface-variant flex items-center justify-center md:justify-start gap-1 mt-1 text-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">location_on</span> Global Contributor
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Grid (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-surface-bright border border-white/50 p-6 rounded-[24px] shadow-sm hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
          </div>
          <h3 className="text-xs text-outline uppercase tracking-wider font-bold">Total Reports</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-headline text-3xl font-bold">{reports.length}</span>
            <span className="text-secondary text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> 12%
            </span>
          </div>
        </div>
        
        {/* Metric 2 */}
        <div className="bg-surface-bright border border-white/50 p-6 rounded-[24px] shadow-sm hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary mb-4">
            <span className="material-symbols-outlined text-[28px]">eco</span>
          </div>
          <h3 className="text-xs text-outline uppercase tracking-wider font-bold">Sources Resolved</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-headline text-3xl font-bold">{verifiedCount}</span>
            <span className="text-secondary text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> 8%
            </span>
          </div>
        </div>

        {/* Metric 3: AI Trust */}
        <div className="bg-surface-bright border border-white/50 p-6 rounded-[24px] shadow-sm hover:scale-[1.02] transition-transform relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 relative z-10">
            <span className="material-symbols-outlined text-[28px]">security</span>
          </div>
          <h3 className="text-xs text-outline uppercase tracking-wider font-bold relative z-10">AI Trust Level</h3>
          <div className="flex items-center justify-between mt-2 relative z-10">
            <span className="font-headline text-3xl font-bold text-primary">{trustLevel}%</span>
            <span className="text-primary text-sm font-semibold flex items-center gap-1">
              High
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Activity Ledger */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h2>
          </div>
          
          <div className="glass-panel overflow-hidden border border-white/50 rounded-[24px]">
            {activities.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center opacity-70">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">map</span>
                <p className="text-lg font-bold text-on-surface">No activity yet</p>
                <p className="text-sm text-on-surface-variant max-w-xs mt-2">
                  When you report or resolve pollution incidents, they will appear here.
                </p>
                <button onClick={() => navigate('/report')} className="mt-6 btn-primary">
                  Submit a Report
                </button>
              </div>
            ) : (
              <div className="divide-y divide-surface-container/50 overflow-y-auto max-h-[400px]">
                {activities.map((activity) => {
                  if (activity.type === 'report') {
                    const report = activity.data as Report;
                    return (
                      <div key={`rep-${report.id}`} onClick={() => navigate(`/report/${report.id}`)} className="p-5 hover:bg-surface-container-low/50 transition-colors flex items-center gap-4 cursor-pointer">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                          {report.imageUrl ? (
                            <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/50">
                              <span className="material-symbols-outlined text-[24px]">image</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-bold text-on-surface truncate capitalize">
                              {report.category.replace('_', ' ')}
                            </h4>
                          </div>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-1 truncate">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {report.location.localityName || 'Unknown Location'}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/70 uppercase font-semibold">
                            {report.createdAt ? formatDistanceToNow(report.createdAt as Date, { addSuffix: true }) : ''}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-full capitalize
                            ${report.status === 'verified' ? 'bg-green-100 text-green-700' : ''}
                            ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${report.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                            ${report.status === 'resolved' ? 'bg-blue-100 text-blue-700' : ''}
                          `}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    const resolution = activity.data as Resolution;
                    return (
                      <div key={`res-${resolution.id}`} onClick={() => navigate(`/hotspot/${resolution.hotspotId}`)} className="p-5 hover:bg-surface-container-low/50 transition-colors flex items-center gap-4 cursor-pointer">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                          {resolution.evidenceImageUrl ? (
                            <img src={resolution.evidenceImageUrl} alt="Resolution" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/50">
                              <span className="material-symbols-outlined text-[24px]">check_circle</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-bold text-on-surface truncate capitalize">
                              Resolved Hotspot
                            </h4>
                          </div>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-1 truncate">
                            {resolution.note || 'Authority Action Taken'}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/70 uppercase font-semibold">
                            {resolution.createdAt ? formatDistanceToNow(resolution.createdAt as Date, { addSuffix: true }) : ''}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-full capitalize bg-blue-100 text-blue-700`}>
                            Resolved
                          </span>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
            
            {reports.length > 0 && (
              <button onClick={() => navigate('/report')} className="w-full py-4 text-sm font-bold text-primary bg-surface-container-low hover:bg-surface-container transition-colors">
                Submit Another Report
              </button>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
