import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/reports';
import { useAuth } from '../services/authService';
import type { PollutionCategory } from '../shared/types';
import { MapPin, UploadCloud, AlertCircle, Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-full bg-background py-8 px-4 sm:px-6 lg:px-8 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=28.6139,77.2090&zoom=11&size=1000x1000&maptype=roadmap&style=feature:water|element:geometry|color:0xBEE3F8&key=dummy')] bg-cover bg-center">
      <div className="max-w-md mx-auto glass-panel p-8">
        <h2 className="text-2xl font-bold text-on-surface mb-6">Report Pollution</h2>
        
        {error && (
          <div className="mb-4 bg-error-container p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error mt-0.5" />
            <p className="text-sm text-on-error-container">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">Evidence Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-outline border-dashed rounded-md relative hover:bg-black/5 transition-colors cursor-pointer group">
              <div className="space-y-1 text-center w-full">
                {image ? (
                  <div className="flex flex-col items-center">
                    <img src={URL.createObjectURL(image)} alt="Preview" className="h-32 object-contain mb-3 rounded-md shadow-sm" />
                  </div>
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-outline mb-2 group-hover:text-primary transition-colors" />
                )}
                <div className="flex text-sm text-on-surface justify-center w-full">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-container focus-within:outline-none">
                    <span>{image ? 'Change file' : 'Upload a file'}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                {image && <p className="text-xs text-on-surface-variant mt-2 truncate max-w-xs mx-auto">{image.name}</p>}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-on-surface-variant mb-1">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PollutionCategory)}
              className="glass-input block w-full"
            >

              <option value="construction_dust">Construction Dust</option>
              <option value="industrial_smoke">Industrial Smoke</option>
              <option value="unpicked_waste">Unpicked Up Waste</option>
              <option value="stagnant_water">Stagnant Water</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Location</label>
            <div className="flex gap-2 mb-3">
              <input
                type="number"
                step="any"
                placeholder="Lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="glass-input flex-1"
              />
              <input
                type="number"
                step="any"
                placeholder="Lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="glass-input flex-1"
              />
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-outline shadow-sm text-sm font-medium rounded-md text-on-surface bg-white/50 hover:bg-white/80 focus:outline-none transition-colors"
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
              Use Current Location
            </button>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-on-surface-variant mb-1">Note (Optional)</label>
            <div className="mt-1">
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="glass-input w-full block"
                placeholder="Additional details..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary flex justify-center disabled:opacity-50 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
