import { useState, useEffect, useCallback } from 'react';
import { getResolutionsForHotspot, submitResolution } from '../services/resolutions';
import type { Resolution } from '../shared/types';
import { CheckCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

interface ResolutionPanelProps {
  hotspotId: string;
  reportId?: string;
  isResolved: boolean;
  onResolved?: () => void;
}

export function ResolutionPanel({ hotspotId, reportId, isResolved, onResolved }: ResolutionPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(isResolved); // Only block loading if it is supposed to be resolved
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const loadResolutions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getResolutionsForHotspot(hotspotId);
      setResolutions(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load resolution history.');
    } finally {
      setLoading(false);
    }
  }, [hotspotId]);

  useEffect(() => {
    if (isResolved) {
      loadResolutions();
    }
  }, [isResolved, loadResolutions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await submitResolution(hotspotId, reportId, note, imageFile || undefined);
      setShowForm(false);
      setNote('');
      setImageFile(null);
      if (onResolved) {
        onResolved();
      } else {
        await loadResolutions();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit resolution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-sm py-4">Loading resolution status...</div>;
  }

  return (
    <div id="resolution-panel" className="mb-6 scroll-mt-24">
      {/* Display Resolutions if they exist */}
      {resolutions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-primary" />
            Resolution History
          </h3>
          <div className="space-y-3">
            {resolutions.map(res => (
              <div key={res.id} className="bg-surface-bright border border-outline-variant/30 rounded-2xl p-4 flex gap-4 shadow-sm">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-on-surface">Authority Resolution</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      {res.createdAt.toLocaleDateString()} {res.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                  {res.note && (
                    <p className="text-xs text-on-surface-variant leading-relaxed">{res.note}</p>
                  )}
                </div>
                {res.evidenceImageUrl && (
                  <a href={res.evidenceImageUrl} target="_blank" rel="noreferrer" className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-outline-variant/20 hover:opacity-80 transition-opacity">
                    <img src={res.evidenceImageUrl} alt="Evidence" className="w-full h-full object-cover" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show Form or Resolve Button if not fully resolved and User is logged in */}
      {!isResolved && user && (
        <div className="bg-surface-bright rounded-2xl shadow-sm border border-outline-variant/30 p-6">
          {!showForm ? (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Authority Actions</h3>
                <p className="text-sm text-on-surface-variant">Mark this {reportId ? 'Report' : 'Hotspot'} as resolved if the incident has been addressed.</p>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve {reportId ? 'Report' : 'Hotspot'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Submit Resolution</h3>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Resolution Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-outline-variant/30 rounded-xl p-3 bg-surface-container-low text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none min-h-[80px]"
                  placeholder="Describe the actions taken..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Evidence Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-surface-container hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 text-sm border border-outline-variant/20">
                    <ImageIcon className="w-4 h-4" />
                    Select Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {imageFile && <span className="text-xs font-bold text-on-surface-variant truncate max-w-[200px]">{imageFile.name}</span>}
                </div>
              </div>

              {error && <div className="text-error text-sm font-bold mb-4">{error}</div>}

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isSubmitting ? 'Submitting...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
