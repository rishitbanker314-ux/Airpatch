import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Star, MapPin, Award, CheckCircle, Clock, XCircle, Shield } from 'lucide-react';
import { useAuth } from '../services/authService';
import { getUserReports } from '../services/reports';
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

    const fetchReports = async () => {
      try {
        const userReports = await getUserReports(user.uid);
        setReports(userReports);
      } catch (error) {
        console.error("Error fetching user reports:", error);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [user, loading, navigate]);

  if (loading || loadingReports) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const points = dbUser?.points || 0;
  
  // Calculate Rank
  let rankName = 'Novice';
  let RankIcon = Shield;
  let rankColor = 'text-gray-400';
  let nextRankPoints = 10;
  let progress = (points / 10) * 100;

  if (points >= 100) {
    rankName = 'Sentinel';
    RankIcon = Award;
    rankColor = 'text-yellow-400';
    nextRankPoints = points;
    progress = 100;
  } else if (points >= 50) {
    rankName = 'Eco Warrior';
    RankIcon = Star;
    rankColor = 'text-green-400';
    nextRankPoints = 100;
    progress = ((points - 50) / 50) * 100;
  } else if (points >= 10) {
    rankName = 'Active Citizen';
    RankIcon = Activity;
    rankColor = 'text-blue-400';
    nextRankPoints = 50;
    progress = ((points - 10) / 40) * 100;
  }

  return (
    <div className="h-full flex flex-col p-4 lg:p-10 max-w-5xl mx-auto space-y-6">
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-on-surface">Your Profile</h1>
        <p className="text-on-surface-variant">Manage your account and view your impact</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: User Info & Gamification */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* User Card */}
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 relative">
              <span className="text-4xl font-bold text-primary">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
              <div className="absolute -bottom-2 -right-2 bg-surface-container-high rounded-full p-2 shadow-lg">
                <RankIcon className={`w-6 h-6 ${rankColor}`} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-on-surface">{user?.displayName || 'Anonymous'}</h2>
            <p className="text-sm text-on-surface-variant mb-4">{user?.email}</p>
            <div className="bg-primary/10 px-4 py-2 rounded-xl">
              <span className="text-primary font-bold text-lg">{points} Points</span>
            </div>
          </div>

          {/* Gamification Card */}
          <div className="glass-card p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Current Rank
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold ${rankColor}`}>{rankName}</span>
              <span className="text-xs text-on-surface-variant">
                {points >= 100 ? 'Max Rank Reached!' : `${nextRankPoints - points} pts to next rank`}
              </span>
            </div>
            
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>

            <h4 className="text-sm font-bold text-on-surface-variant mb-3">Impact Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container p-3 rounded-xl">
                <p className="text-xs text-on-surface-variant mb-1">Reports</p>
                <p className="text-xl font-bold text-primary">{reports.length}</p>
              </div>
              <div className="bg-surface-container p-3 rounded-xl">
                <p className="text-xs text-on-surface-variant mb-1">Verified</p>
                <p className="text-xl font-bold text-green-400">
                  {reports.filter(r => r.status === 'verified').length}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Report History */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 h-full min-h-[500px] flex flex-col">
            <h3 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Report History
            </h3>

            {reports.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <MapPin className="w-12 h-12 text-on-surface-variant mb-3" />
                <p className="text-lg font-bold text-on-surface">No reports yet</p>
                <p className="text-sm text-on-surface-variant max-w-xs mt-2">
                  When you report pollution incidents, they will appear here.
                </p>
                <button 
                  onClick={() => navigate('/report')}
                  className="mt-6 btn-primary"
                >
                  Submit a Report
                </button>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '600px' }}>
                {reports.map((report) => (
                  <div key={report.id} className="bg-surface-container-low border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 hover:border-white/10 transition-colors">
                    
                    {/* Image Thumbnail */}
                    <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-surface-container-highest shrink-0">
                      <img 
                        src={report.imageUrl} 
                        alt="Report" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-on-surface truncate capitalize">
                          {report.category.replace('_', ' ')}
                        </h4>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {report.status === 'verified' && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
                          {report.status === 'rejected' && <XCircle className="w-4 h-4 text-red-400" />}
                          {report.status === 'resolved' && <Shield className="w-4 h-4 text-blue-400" />}
                          <span className={`text-xs font-bold capitalize
                            ${report.status === 'verified' ? 'text-green-400' : ''}
                            ${report.status === 'pending' ? 'text-yellow-400' : ''}
                            ${report.status === 'rejected' ? 'text-red-400' : ''}
                            ${report.status === 'resolved' ? 'text-blue-400' : ''}
                          `}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" /> 
                        {report.location.localityName || 'Unknown Location'}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between text-xs text-on-surface-variant">
                        <span>{report.createdAt ? formatDistanceToNow(report.createdAt as Date, { addSuffix: true }) : ''}</span>
                        <button 
                          onClick={() => navigate(`/report/${report.id}`)}
                          className="text-primary hover:underline font-bold"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
