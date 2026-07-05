import { useState, useEffect } from 'react';
import { getResolutionsForTarget, submitResolution } from '../services/resolutions';
import type { Resolution } from '../shared/types';
import { CheckCircle, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ResolutionPanelProps {
  targetId: string;
  targetType: 'report' | 'hotspot';
  isResolved: boolean;
  onResolved?: () => void;
}

export function ResolutionPanel({ targetId, targetType, isResolved, onResolved }: ResolutionPanelProps) {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(isResolved); // Only block loading if it is supposed to be resolved
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isResolved) {
      loadResolutions();
    }
  }, [isResolved, targetId]);

  const loadResolutions = async () => {
    setLoading(true);
    try {
      const data = await getResolutionsForTarget(targetId);
      setResolutions(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load resolution history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await submitResolution(targetId, targetType, note, imageFile || undefined);
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
    <div className="mb-6">
      {/* Display Resolutions if they exist */}
      {resolutions.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Resolution History
          </h3>
          {resolutions.map(res => (
            <div key={res.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-green-800 dark:text-green-300">Resolved by Authority</span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  {res.resolvedAt.toLocaleDateString()} {res.resolvedAt.toLocaleTimeString()}
                </span>
              </div>
              {res.resolutionNote && (
                <p className="text-sm text-green-900 dark:text-green-100 mb-3 whitespace-pre-wrap">{res.resolutionNote}</p>
              )}
              {res.imageMetadata && (
                <div className="mt-2">
                  <a href={res.imageMetadata.url} target="_blank" rel="noreferrer" className="inline-block rounded-lg overflow-hidden border border-green-200 dark:border-green-700">
                    <img src={res.imageMetadata.url} alt="Evidence" className="h-32 object-cover" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show Form or Resolve Button if not fully resolved */}
      {!isResolved && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          {!showForm ? (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg dark:text-white">Authority Actions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mark this {targetType} as resolved if the incident has been addressed.</p>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve {targetType === 'hotspot' ? 'Hotspot' : 'Report'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="font-bold text-lg dark:text-white mb-4">Submit Resolution</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resolution Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 outline-none min-h-[100px]"
                  placeholder="Describe the actions taken..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evidence Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
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
                  {imageFile && <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{imageFile.name}</span>}
                </div>
              </div>

              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
