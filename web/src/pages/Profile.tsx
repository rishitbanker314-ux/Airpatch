import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { subscribeToUserReports } from '../services/reports';
import type { Report } from '../shared/types';
import { formatDistanceToNow } from 'date-fns';

export function Profile() {
  const { user, dbUser, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    const unsubscribe = subscribeToUserReports(user.uid, (userReports) => {
      setReports(userReports);
      setLoadingReports(false);
    });

    return () => unsubscribe();
  }, [user, loading, navigate]);

  if (loading || loadingReports) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const points = dbUser?.points || 0;
  const verifiedCount = reports.filter(r => r.status === 'verified' || r.status === 'resolved').length;
  
  // Calculate Progress towards next tier
  const nextTierPoints = 14000; // Example target
  const progressPercent = Math.min((points / nextTierPoints) * 100, 100);

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
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">Top 1% Steward</span>
              <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-semibold">Verified Contributor</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-xs uppercase tracking-widest text-outline font-bold">Total Impact Points</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-5xl font-bold text-primary">{points.toLocaleString()}</span>
            </div>
            <div className="w-48 h-2 bg-surface-container-high rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(29,97,255,0.4)] transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs text-on-surface-variant mt-1 font-medium">{Math.max(nextTierPoints - points, 0).toLocaleString()} points until Elite Tier</span>
          </div>
        </div>
      </section>

      {/* Metrics Grid (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        
        {/* Metric 3 */}
        <div className="bg-surface-bright border border-white/50 p-6 rounded-[24px] shadow-sm hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary mb-4">
            <span className="material-symbols-outlined text-[28px]">groups</span>
          </div>
          <h3 className="text-xs text-outline uppercase tracking-wider font-bold">Community Assists</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-headline text-3xl font-bold">0</span>
            <span className="text-on-surface-variant text-sm font-semibold">Stable</span>
          </div>
        </div>
        
        {/* Metric 4 (Environmental Gauge) */}
        <div className="bg-primary p-6 rounded-[24px] shadow-lg text-white flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[120px]">psychology</span>
          </div>
          <h3 className="text-xs opacity-80 uppercase tracking-wider font-bold relative z-10">Steward Health</h3>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-headline text-5xl font-bold">98</span>
              <span className="font-headline text-2xl opacity-80">%</span>
            </div>
            <p className="text-sm mt-2 font-medium">Optimal Performance</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Activity Ledger */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold text-on-surface">Recent Reports</h2>
          </div>
          
          <div className="glass-panel overflow-hidden border border-white/50 rounded-[24px]">
            {reports.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center opacity-70">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">map</span>
                <p className="text-lg font-bold text-on-surface">No reports yet</p>
                <p className="text-sm text-on-surface-variant max-w-xs mt-2">
                  When you report pollution incidents, they will appear here.
                </p>
                <button onClick={() => navigate('/report')} className="mt-6 btn-primary">
                  Submit a Report
                </button>
              </div>
            ) : (
              <div className="divide-y divide-surface-container/50 overflow-y-auto max-h-[400px]">
                {reports.map((report) => (
                  <div key={report.id} onClick={() => navigate(`/report/${report.id}`)} className="p-5 hover:bg-surface-container-low/50 transition-colors flex items-center gap-4 cursor-pointer">
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
                      {(report.status === 'verified' || report.status === 'resolved') && (
                        <div className="font-bold text-secondary text-sm">
                          +50 pts
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
