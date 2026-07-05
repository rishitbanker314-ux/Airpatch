import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/reports';
import type { PollutionCategory } from '../shared/types';
import { MapPin, UploadCloud, AlertCircle, Loader2 } from 'lucide-react';

export function ReportForm() {
  const navigate = useNavigate();
  
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState<PollutionCategory>('waste_burning_smoke');
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
        category,
        note,
        location: { latitude: parsedLat, longitude: parsedLng }
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Pollution</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition-colors">
              <div className="space-y-1 text-center w-full">
                {image ? (
                  <div className="flex flex-col items-center">
                    <img src={URL.createObjectURL(image)} alt="Preview" className="h-32 object-contain mb-3 rounded-md" />
                  </div>
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                )}
                <div className="flex text-sm text-gray-600 justify-center w-full">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>{image ? 'Change file' : 'Upload a file'}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                {image && <p className="text-xs text-gray-500 mt-2 truncate max-w-xs mx-auto">{image.name}</p>}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PollutionCategory)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="waste_burning_smoke">Waste Burning Smoke</option>
              <option value="construction_dust">Construction Dust</option>
              <option value="industrial_smoke">Industrial Smoke</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                step="any"
                placeholder="Lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              />
              <input
                type="number"
                step="any"
                placeholder="Lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              />
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
              Use Current Location
            </button>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">Note (Optional)</label>
            <div className="mt-1">
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                placeholder="Additional details..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
