import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Activity, LayoutDashboard, LogOut, LogIn, User } from 'lucide-react';
import { useAuth } from '../services/authService';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, dbUser, loading, signInWithGoogle, signOutUser } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Map', path: '/map', icon: MapPin },
    { name: 'Report', path: '/report', icon: Activity },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Side Navigation Bar (Desktop Only) */}
      <aside className="fixed left-0 top-0 h-full w-64 glass-panel border-r border-white/20 hidden lg:flex flex-col py-8 px-6 z-50">
        <div className="mb-10">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1 className="font-headline text-2xl font-bold text-primary">AirPatch</h1>
          </Link>
          <p className="text-sm text-on-surface-variant opacity-70">Environmental Lead</p>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/map' && location.pathname.startsWith('/hotspot/'));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'text-primary font-bold border-r-2 border-primary bg-primary-container/10' 
                    : 'text-on-surface-variant hover:bg-surface-container-high/50 font-medium'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          {user ? (
            <div className="flex flex-col gap-3">
               <Link to="/profile" className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl hover:bg-surface-container transition-colors">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
                    )}
                 </div>
                 <div className="flex-1 truncate">
                    <p className="text-sm font-bold text-on-surface truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-primary font-bold">⭐️ {dbUser?.points || 0} Pts</p>
                 </div>
               </Link>
               <button onClick={signOutUser} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-on-surface-variant font-bold text-sm hover:bg-error/10 hover:text-error transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
               </button>
            </div>
          ) : !loading ? (
             <button onClick={signInWithGoogle} className="w-full btn-primary text-sm flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In
             </button>
          ) : null}
        </div>
      </aside>

      {/* Top App Bar */}
      <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] glass-panel border-b border-white/20 flex justify-between items-center h-16 px-4 lg:px-10 z-40 rounded-none lg:rounded-bl-xl">
        <div className="flex items-center gap-4 flex-1">
          <div className="lg:hidden">
            <Link to="/">
              <span className="font-headline text-xl font-bold text-primary">AirPatch</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {user && (
             <div className="lg:hidden flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                <span className="text-xs font-bold text-primary">⭐️ {dbUser?.points || 0} Pts</span>
             </div>
           )}
           {user ? (
             <Link to="/profile" className="h-8 w-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm lg:hidden overflow-hidden border border-transparent hover:border-primary transition-all">
               {user.photoURL ? (
                 <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
               )}
             </Link>
           ) : !loading ? (
             <button onClick={signInWithGoogle} className="text-primary font-bold text-sm lg:hidden">Sign In</button>
           ) : null}
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="relative w-full lg:ml-64 lg:w-[calc(100%-16rem)] h-screen pt-16 pb-24 lg:pb-0 bg-surface-container-low overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-between items-center px-1 pb-6 pt-3 glass-panel border-t border-white/20 rounded-t-2xl rounded-b-none">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/map' && location.pathname.startsWith('/hotspot/'));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 transition-all flex-1 min-w-0 ${
                isActive 
                  ? 'bg-primary-container text-white' 
                  : 'text-on-surface-variant hover:bg-primary-container/20'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold truncate max-w-full">{item.name}</span>
            </Link>
          );
        })}
        {user && (
            <button
              onClick={signOutUser}
              className="flex flex-col items-center justify-center rounded-xl px-2 py-2 text-on-surface-variant hover:bg-error/10 hover:text-error transition-all flex-1 min-w-0"
            >
              <LogOut className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold truncate max-w-full">Logout</span>
            </button>
        )}
      </nav>
    </>
  );
}
