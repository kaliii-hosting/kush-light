import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import {
  X, Save, Trash2, Eye, Pencil, Film, Play
} from 'lucide-react';
import AdminToast from './AdminToast';
import LeverSwitch from './LeverSwitch';

// Default hero video URL
const DEFAULT_HERO_VIDEO = 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Videos/Horizontal%20Videos/Hero%20Section.mp4';

const HeroVideoManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [heroData, setHeroData] = useState({
    videoUrl: DEFAULT_HERO_VIDEO,
    isActive: true,
    createdAt: '',
    updatedAt: ''
  });
  const [existingHero, setExistingHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [toast, setToast] = useState(null);

  // Load existing hero video data from Firebase
  useEffect(() => {
    const heroRef = ref(realtimeDb, 'homepage_hero_video');
    const unsubscribe = onValue(heroRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setExistingHero(data);
        setHeroData(data);
      } else {
        // Initialize with default if no data exists
        const defaultData = {
          videoUrl: DEFAULT_HERO_VIDEO,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setExistingHero(defaultData);
        setHeroData(defaultData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHeroData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save hero video to Firebase
  const handleSave = async () => {
    setSaving(true);
    try {
      const heroRef = ref(realtimeDb, 'homepage_hero_video');
      const dataToSave = {
        ...heroData,
        updatedAt: new Date().toISOString(),
        createdAt: existingHero?.createdAt || new Date().toISOString()
      };
      await set(heroRef, dataToSave);
      setExistingHero(dataToSave);
      setShowForm(false);
      setToast({ message: 'Hero video saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving hero video:', error);
      setToast({ message: 'Failed to save hero video. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle activation
  const toggleActivation = async (newState) => {
    if (!existingHero) return;

    const isActive = typeof newState === 'boolean' ? newState : !existingHero.isActive;

    try {
      const heroRef = ref(realtimeDb, 'homepage_hero_video');
      const updatedData = {
        ...existingHero,
        isActive: isActive,
        updatedAt: new Date().toISOString()
      };
      await set(heroRef, updatedData);
      setExistingHero(updatedData);
      setHeroData(updatedData);
      setToast({
        message: `Hero video ${updatedData.isActive ? 'activated' : 'deactivated'} successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error toggling hero video activation:', error);
      setToast({ message: 'Failed to toggle hero video activation.', type: 'error' });
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    if (!window.confirm('Reset hero video to default?')) return;

    try {
      const heroRef = ref(realtimeDb, 'homepage_hero_video');
      const defaultData = {
        videoUrl: DEFAULT_HERO_VIDEO,
        isActive: true,
        createdAt: existingHero?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await set(heroRef, defaultData);
      setExistingHero(defaultData);
      setHeroData(defaultData);
      setShowForm(false);
      setToast({ message: 'Hero video reset to default!', type: 'success' });
    } catch (error) {
      console.error('Error resetting hero video:', error);
      setToast({ message: 'Failed to reset hero video.', type: 'error' });
    }
  };

  // Truncate URL for display
  const truncateUrl = (url, maxLength = 60) => {
    if (!url) return 'Not set';
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  // Preview component
  const VideoPreview = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4"
      onClick={() => setPreviewMode(false)}
    >
      <div
        className="relative max-w-4xl w-full bg-black rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setPreviewMode(false)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Video */}
        <MediaPlaceholder kind="video" />
      </div>
    </div>
  );

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <AdminToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-[#0f0f0f] rounded-lg overflow-hidden">
        {/* Banner Header - Identical to PopupManager */}
        <div className="bg-[#1a1a1a] border-b border-gray-800">
          {/* Top Row - Title and Actions */}
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#272727] rounded-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Hero Video Editor</h2>
                <p className="text-sm text-gray-400">
                  {existingHero ?
                    `Status: ${existingHero.isActive ? 'Active' : 'Inactive'}` :
                    'No video configured'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Preview Button */}
              {existingHero?.videoUrl && (
                <button
                  onClick={() => setPreviewMode(true)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#272727] hover:bg-[#3a3a3a] text-white rounded-full transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
              )}

              {/* Edit Button */}
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#272727] hover:bg-[#3a3a3a] text-white rounded-full transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </button>

              {/* Activation Toggle */}
              {existingHero && (
                <div className="flex-1 sm:flex-none flex items-center justify-center">
                  <LeverSwitch
                    id="hero-lever"
                    isChecked={existingHero.isActive}
                    onChange={toggleActivation}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats Banner */}
          {existingHero && !showForm && (
            <div className="bg-[#0f0f0f] border-t border-gray-800">
              <div className="px-4 sm:px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {/* Video URL Column */}
                  <div className="flex flex-col col-span-2">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Video URL</span>
                    <span className="text-white font-semibold text-sm sm:text-base truncate" title={existingHero.videoUrl}>
                      {truncateUrl(existingHero.videoUrl)}
                    </span>
                  </div>

                  {/* Created Column */}
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Created</span>
                    <span className="text-white font-semibold text-sm sm:text-base">
                      {existingHero.createdAt ? new Date(existingHero.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  {/* Last Updated Column */}
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Last Updated</span>
                    <span className="text-white font-semibold text-sm sm:text-base">
                      {existingHero.updatedAt ? new Date(existingHero.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Form - Identical to ProductForm.jsx style */}
        {showForm && (
          <div className="bg-card rounded-lg overflow-hidden border border-gray-700 mt-4 mx-4 sm:mx-6 mb-4">
            {/* Table Header */}
            <div className="bg-gray-dark">
              <div className="grid grid-cols-12 gap-4 px-4 py-3">
                <div className="col-span-12 text-xs font-medium text-gray-300 uppercase tracking-wider">Hero Video URL</div>
              </div>
            </div>

            {/* Form Rows */}
            <div className="divide-y divide-border">
              {/* First Row - Video URL */}
              <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
                <div className="col-span-12">
                  <input
                    type="url"
                    name="videoUrl"
                    value={heroData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/hero-video.mp4"
                    className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Second Row - Video Preview */}
              <div className="px-4 py-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Video Preview</label>
                    <div className="bg-gray-dark border border-border rounded-lg p-2 h-[200px] flex items-center justify-center overflow-hidden">
                      {heroData.videoUrl ? (
                        <MediaPlaceholder kind="video" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Play className="h-12 w-12 mb-2" />
                          <span className="text-sm">Enter a video URL to preview</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="px-4 py-4 bg-gray-dark/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg text-white hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleResetToDefault}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 border border-yellow-600/50 rounded-lg text-yellow-400 hover:bg-yellow-600/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Reset to Default
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:text-gray-400"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Update Video'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {previewMode && <VideoPreview />}
      </div>
    </>
  );
};

export default HeroVideoManager;
