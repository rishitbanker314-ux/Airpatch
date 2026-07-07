import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/reports';
import { useAuth } from '../services/authService';
import type { PollutionCategory } from '../shared/types';
import { AlertCircle, Loader2 } from 'lucide-react';

export function ReportForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState<PollutionCategory>('unpicked_waste');
  const [note, setNote] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        setIsLocating(false);
      },
      () => {
        setError('Unable to retrieve your location');
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload an image.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setError('Please provide valid numerical coordinates.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reportId = await submitReport({
        createdBy: user?.uid,
        category,
        note,
        location: { lat: parsedLat, lng: parsedLng }
      }, image);
      
      navigate(`/report/${reportId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to submit report. Please try again.');
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (cat: PollutionCategory) => {
    switch (cat) {
      case 'unpicked_waste': return 'delete';
      case 'construction_dust': return 'construction';
      case 'industrial_smoke': return 'factory';
      case 'stagnant_water': return 'water_drop';
      default: return 'report';
    }
  };

  const getCategoryColorClass = (cat: PollutionCategory) => {
    switch (cat) {
      case 'unpicked_waste': return 'text-aqi-moderate';
      case 'construction_dust': return 'text-aqi-moderate';
      case 'industrial_smoke': return 'text-outline';
      case 'stagnant_water': return 'text-map-water';
      default: return 'text-primary';
    }
  };

  const getCategoryLabel = (cat: PollutionCategory) => {
    return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="relative min-h-screen bg-background text-on-surface flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0 opacity-40 grayscale-[20%]">
        <img 
          className="w-full h-full object-cover" 
          alt="Map Background" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbB2qnTekoXF09Pz9J0IDntHJXvZ8RebRMecMmuL7EuYeFTzdwZtaoOjs-nkAW42Qax0HgrxwdJZlBzRj0A5bUjC1JZGBgBukKu3Q2foMJiJCv269PrxACjWfnuO82a1Hsr98Z7PfQLRv2GM6Ejbq2D3bKDPZA_uwUWLORJEsgxwJZK37eRUUf82wgQe9oVPn2rr9tHvyJXFJv0uMClpqFNtuK2cxv1RJ9s9sRs_gwBd_xAiFUxK7pa0UqBCzimzLe0JIxk3FJhQ"
        />
      </div>

      {/* Focus Overlay */}
      <div className="absolute inset-0 z-10 bg-on-background/10 backdrop-blur-[2px]"></div>

      {/* Main Form Container */}
      <main className="glass-panel w-full max-w-2xl rounded-2xl flex flex-col relative z-20 shadow-2xl max-h-[90vh]">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-white/40">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">New Report</h1>
            <p className="text-sm md:text-base text-on-surface-variant mt-1">Help verify local air quality</p>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {error && (
          <div className="m-6 mb-0 bg-error-container p-4 rounded-xl flex items-start gap-3 border border-error/20">
            <AlertCircle className="w-5 h-5 text-error mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-on-error-container">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Step 1: Photo Upload */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
              <h2 className="text-lg font-bold">Capture Evidence</h2>
            </div>
            <label className="glass-input rounded-xl border-2 border-dashed border-outline-variant hover:border-primary transition-colors cursor-pointer relative overflow-hidden h-48 flex flex-col items-center justify-center group block">
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              {image ? (
                <div className="w-full h-full p-2">
                  <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <span className="material-symbols-outlined text-3xl mb-1">edit</span>
                    <span className="text-sm font-medium">Change Photo</span>
                  </div>
                </div>
              ) : (
                <div className="text-center group-hover:scale-105 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">cloud_upload</span>
                  <p className="text-sm font-bold text-on-surface">Tap to capture or upload</p>
                  <p className="text-xs font-bold text-on-surface-variant mt-1 tracking-wider">JPG, PNG up to 10MB</p>
                </div>
              )}
            </label>
          </section>

          {/* Step 2: Category Selection */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
              <h2 className="text-lg font-bold">Pollution Type</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(['unpicked_waste', 'construction_dust', 'industrial_smoke', 'stagnant_water'] as PollutionCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all hover:bg-primary-container/20 ${category === cat ? 'border-primary bg-primary-container/10 shadow-md' : 'border-transparent'}`}
                >
                  <span className={`material-symbols-outlined text-3xl ${category === cat ? 'text-primary' : getCategoryColorClass(cat)}`}>
                    {getCategoryIcon(cat)}
                  </span>
                  <span className={`text-sm font-bold text-center ${category === cat ? 'text-primary' : 'text-on-surface'}`}>
                    {getCategoryLabel(cat)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Step 3: Location & Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Capture */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
                  <h2 className="text-lg font-bold">Location</h2>
                </div>
                <button 
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                >
                  {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="material-symbols-outlined text-[14px]">gps_fixed</span>}
                  Detect
                </button>
              </div>
              <div className="h-32 rounded-xl overflow-hidden relative glass-input border border-outline-variant/30 group">
                <img 
                  className="w-full h-full object-cover opacity-80" 
                  alt="Location Preview" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGciZVkAxVMZ4U-5NmaY-x7dsnvp1FB_hL8-Gfn3bOjCZ51CHSMleEel12lZvyH19f4P8Tlc9tMDSCeYll2YfXuV7oD8U8FFCW2LbQv0iBw-yr5UXje7QPrH4IzljPZPhuXRKOzA_Bqq9Mtd-sdLCGG5N2t_XP9fA38s3qbrH4blB827BXUTCXH8-EZHJphWUmFDhutZf9mCB9P5u7CgTxweBZ4mW6s03aBLLXe_u-dvkvQ66FBiA9VzC7O-Jrli1h2DvhQjm52A"
                />
                <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center pointer-events-none p-2">
                   <div className="flex gap-2 w-full max-w-[200px] pointer-events-auto">
                     <input type="number" step="any" placeholder="Lat" value={lat} onChange={(e) => setLat(e.target.value)} className="w-full bg-surface-glass backdrop-blur-md rounded-md border border-white/50 px-2 py-1 text-xs text-center outline-none focus:border-primary font-bold shadow-sm" />
                     <input type="number" step="any" placeholder="Lng" value={lng} onChange={(e) => setLng(e.target.value)} className="w-full bg-surface-glass backdrop-blur-md rounded-md border border-white/50 px-2 py-1 text-xs text-center outline-none focus:border-primary font-bold shadow-sm" />
                   </div>
                </div>
              </div>
            </section>

            {/* Note */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                <h2 className="text-lg font-bold">Details (Optional)</h2>
              </div>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="glass-input w-full h-32 rounded-xl border border-outline-variant/30 p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                placeholder="Provide any additional context or details about the issue..."
              />
            </section>
          </div>

          {/* Gamification */}
          <div className="bg-secondary-container/30 border border-secondary/20 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-secondary/10 p-2 rounded-full shrink-0">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-secondary-fixed-variant">+10 Points</p>
              <p className="text-[13px] text-on-surface-variant mt-0.5">For verified {getCategoryLabel(category).toLowerCase()} reports</p>
            </div>
          </div>
          
          {/* AI Verification (Only shows when submitting) */}
          {isSubmitting && (
            <div className="h-32 glass-panel rounded-xl p-4 flex flex-col justify-center items-center relative overflow-hidden border-primary/30">
              <div className="scanning-bar"></div>
              <span className="material-symbols-outlined text-primary text-3xl mb-2 animate-pulse">model_training</span>
              <p className="text-sm font-bold text-on-surface text-center">Gemini is verifying your report...</p>
            </div>
          )}
        </form>

        {/* Footer / Submit */}
        <footer className="p-6 border-t border-white/40 bg-surface-glass/80 backdrop-blur-md rounded-b-2xl flex justify-end gap-4 shrink-0">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-8 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all relative overflow-hidden disabled:opacity-70 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            <span className="relative z-10 flex items-center gap-2">
               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
               Submit Report
            </span>
          </button>
        </footer>
      </main>
    </div>
  );
}
