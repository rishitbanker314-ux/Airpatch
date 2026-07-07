import { Link } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { LogOut, LogIn } from 'lucide-react';

export function LandingPage() {
  const { user, dbUser, loading, signInWithGoogle, signOutUser } = useAuth();

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Ambient Background Element */}
      <div className="absolute inset-0 ambient-grid pointer-events-none z-[-1]"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none z-[-1]"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none z-[-1]"></div>
      
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 sticky top-0 z-50 bg-surface-glass/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>air</span>
          <span className="font-display text-headline-lg-mobile font-bold text-primary tracking-tight">AirPatch</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="font-label text-label-md text-primary font-bold border-b-2 border-primary py-1" to="/">Home</Link>
          <Link className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors py-1" to="/map">Map</Link>
          <Link className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors py-1" to="/report">Reporting</Link>
          <Link className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors py-1" to="/dashboard">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
               <div className="hidden md:flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                  <span className="text-xs font-bold text-primary">⭐️ {dbUser?.points || 0} Pts</span>
               </div>
               <button onClick={signOutUser} aria-label="sign out" className="p-2 rounded-full hover:bg-error/10 transition-all duration-300 scale-102 active:scale-95 text-on-surface-variant hover:text-error">
                  <LogOut className="w-5 h-5" />
               </button>
               <Link to="/profile" className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-transparent hover:border-primary transition-all">
                 {user.photoURL ? (
                   <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
                 )}
               </Link>
            </div>
          ) : !loading ? (
             <button onClick={signInWithGoogle} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In
             </button>
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col pt-12 pb-24 px-margin-mobile md:px-margin-desktop gap-24 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 border border-secondary-container/30 text-on-secondary-container font-label text-label-md w-max">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              Live Network Active
            </div>
            <h1 className="font-display text-display-lg text-on-surface">
              Atmospheric Clarity through <span className="text-primary">Community Stewardship</span>
            </h1>
            <p className="font-body text-body-lg text-on-surface-variant max-w-2xl">
              The real-time, community-driven platform for tracking and resolving localized pollution events. 
              Empower your neighborhood with AI-verified reporting and direct authority dispatch to restore environmental health.
            </p>
          </div>
          <div className="flex-1 relative w-full h-[500px] rounded-xl overflow-hidden glass-panel shadow-xl flex items-center justify-center group">
            {/* Hero Image Placeholder */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCDrQRLK4wGbB1TVXigsut-leGuddEZygn0ZzYxXkRRuaW9uAw_Hk5ulFsXpMYtT4Z6sOGjg4wHT3DtLNErscoymZnUrHKQeVkHq3SqXfzZdcL3RuUreHS4UKRafa-xjf7IMrv9xG0N91vbN-EnYFXUcxIPBsu1WjlqgRskZWI-NrL0YCaMibAjV0cjhJUCrBuBgOHvSTk8xGqkKTHAHpngVxExv6H3ITaztR6BDF835TFHNhBvNryr")' }}
            >
            </div>
            {/* Floating Data Elements (Micro-Skeuomorphic) */}
            <div className="absolute top-8 left-8 glass-panel px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 animate-[bounce_4s_infinite]">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#10B981] text-[18px]">eco</span>
              </div>
              <div>
                <p className="font-data-mono text-data-mono text-on-surface-variant uppercase">AQI Index</p>
                <p className="font-headline text-title-md text-on-surface">32 <span className="text-[#10B981] text-sm">Good</span></p>
              </div>
            </div>
            <div className="absolute bottom-12 right-8 glass-panel px-4 py-3 rounded-xl shadow-lg flex flex-col gap-1 animate-[bounce_5s_infinite_0.5s]">
              <p className="font-data-mono text-data-mono text-on-surface-variant uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
                AI Verified Report
              </p>
              <p className="font-body text-body-md text-on-surface">Industrial Odor Cleared</p>
              <p className="font-label text-label-md text-primary mt-1">Authority Dispatched</p>
            </div>
          </div>
        </section>

        {/* Navigation Hub */}
        <section className="flex flex-col gap-8 relative z-10">
          <div className="flex flex-col gap-2">
            <h2 className="font-headline text-headline-lg text-on-surface">Explore the Platform</h2>
            <p className="font-body text-body-md text-on-surface-variant">Select a module to begin your stewardship journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Home Map */}
            <Link to="/map" className="group glass-panel rounded-lg p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110"></div>
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary mb-2 transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>map</span>
              </div>
              <div>
                <h3 className="font-headline text-title-md text-on-surface mb-1">Home Map</h3>
                <p className="font-body text-body-md text-on-surface-variant line-clamp-2">Real-time hotspot visualization and environmental monitoring across your region.</p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-primary font-label text-label-md gap-1">
                Launch Map
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </Link>

            {/* Card 2: Pollution Reporting */}
            <Link to="/report" className="group glass-panel rounded-lg p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110"></div>
              <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary mb-2 transition-colors group-hover:bg-tertiary group-hover:text-white">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>report_problem</span>
              </div>
              <div>
                <h3 className="font-headline text-title-md text-on-surface mb-1">Pollution Reporting</h3>
                <p className="font-body text-body-md text-on-surface-variant line-clamp-2">Citizen tool for AI-verified evidence capture of localized environmental hazards.</p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-tertiary font-label text-label-md gap-1">
                Submit Report
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </Link>

            {/* Card 3: Authority Dashboard */}
            <Link to="/dashboard" className="group glass-panel rounded-lg p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110"></div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary mb-2 transition-colors group-hover:bg-secondary group-hover:text-white">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>analytics</span>
              </div>
              <div>
                <h3 className="font-headline text-title-md text-on-surface mb-1">Authority Dashboard</h3>
                <p className="font-body text-body-md text-on-surface-variant line-clamp-2">Resolution center for responders, dispatch teams, and city planners.</p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-secondary font-label text-label-md gap-1">
                Open Dashboard
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </Link>

            {/* Card 4: Impact Profile */}
            <Link to="/profile" className="group glass-panel rounded-lg p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/30 rounded-bl-full transition-transform duration-500 group-hover:scale-110"></div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface mb-2 transition-colors group-hover:bg-on-surface group-hover:text-white">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>account_circle</span>
              </div>
              <div>
                <h3 className="font-headline text-title-md text-on-surface mb-1">Impact Profile</h3>
                <p className="font-body text-body-md text-on-surface-variant line-clamp-2">Track your personal contributions, community standing, and stewardship rewards.</p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-on-surface font-label text-label-md gap-1">
                View Profile
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface-glass/80 backdrop-blur-md rounded-t-xl border-t border-white/30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Link to="/" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-5 py-1.5 transition-all scale-110 active:scale-90 duration-200 ease-out">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
          <span className="font-label text-label-md text-[10px]">Home</span>
        </Link>
        <Link to="/map" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-full px-4 py-1.5 transition-all active:scale-90 duration-200 ease-out">
          <span className="material-symbols-outlined text-[24px]">map</span>
          <span className="font-label text-label-md text-[10px]">Map</span>
        </Link>
        <Link to="/report" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-full px-4 py-1.5 transition-all active:scale-90 duration-200 ease-out">
          <span className="material-symbols-outlined text-[24px]">add_chart</span>
          <span className="font-label text-label-md text-[10px]">Reporting</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-full px-4 py-1.5 transition-all active:scale-90 duration-200 ease-out">
          <span className="material-symbols-outlined text-[24px]">dashboard</span>
          <span className="font-label text-label-md text-[10px]">Dashboard</span>
        </Link>
      </nav>
    </div>
  );
}
