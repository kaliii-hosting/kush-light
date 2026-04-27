import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { ref, set, get, onValue } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import {
  X, Plus, Image, Video, Type, AlignLeft,
  ToggleLeft, ToggleRight, Save, Trash2,
  Eye, EyeOff, Megaphone, Pencil
} from 'lucide-react';
import AdminToast from './AdminToast';
import LeverSwitch from './LeverSwitch';

const PopupManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [popupData, setPopupData] = useState({
    title: '',
    subtitle: '',
    body: '',
    mediaUrl: '',
    mediaType: 'image', // 'image' or 'video'
    isActive: false,
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    accentColor: '#22c55e',
    buttonEnabled: false,
    buttonText: '',
    buttonLink: '',
    createdAt: '',
    updatedAt: ''
  });
  const [existingPopup, setExistingPopup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [toast, setToast] = useState(null);

  // Load existing popup from Firebase
  useEffect(() => {
    const popupRef = ref(realtimeDb, 'advertising_popup');
    const unsubscribe = onValue(popupRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setExistingPopup(data);
        setPopupData(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPopupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save popup to Firebase
  const handleSave = async () => {
    setSaving(true);
    try {
      const popupRef = ref(realtimeDb, 'advertising_popup');
      const dataToSave = {
        ...popupData,
        updatedAt: new Date().toISOString(),
        createdAt: existingPopup?.createdAt || new Date().toISOString()
      };
      await set(popupRef, dataToSave);
      setExistingPopup(dataToSave);
      setShowForm(false);
      setToast({ message: 'Popup saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving popup:', error);
      setToast({ message: 'Failed to save popup. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle popup activation
  const toggleActivation = async (newState) => {
    if (!existingPopup) return;

    const isActive = typeof newState === 'boolean' ? newState : !existingPopup.isActive;

    try {
      const popupRef = ref(realtimeDb, 'advertising_popup');
      const updatedData = {
        ...existingPopup,
        isActive: isActive,
        updatedAt: new Date().toISOString()
      };
      await set(popupRef, updatedData);
      setExistingPopup(updatedData);
      setPopupData(updatedData);
      setToast({
        message: `Popup ${updatedData.isActive ? 'activated' : 'deactivated'} successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error toggling popup activation:', error);
      setToast({ message: 'Failed to toggle popup activation.', type: 'error' });
    }
  };

  // Delete popup
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this popup?')) return;

    try {
      const popupRef = ref(realtimeDb, 'advertising_popup');
      await set(popupRef, null);
      setExistingPopup(null);
      setPopupData({
        title: '',
        subtitle: '',
        body: '',
        mediaUrl: '',
        mediaType: 'image',
        isActive: false,
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        accentColor: '#22c55e',
        buttonEnabled: false,
        buttonText: '',
        buttonLink: '',
        createdAt: '',
        updatedAt: ''
      });
      setShowForm(false);
      setToast({ message: 'Popup deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting popup:', error);
      setToast({ message: 'Failed to delete popup.', type: 'error' });
    }
  };

  // Preview component
  const PopupPreview = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4"
      onClick={() => setPreviewMode(false)}
    >
      <div
        className="relative max-w-lg w-full bg-black rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setPreviewMode(false)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Media Section */}
        {popupData.mediaUrl && (
          <div className="w-full h-64 bg-black">
            {popupData.mediaType === 'image' ? (
              <MediaPlaceholder kind="image" />
            ) : (
              <MediaPlaceholder kind="video" />
            )}
          </div>
        )}

        {/* Content Section - Centered */}
        <div className="p-6 text-center">
          {popupData.title && (
            <h2 className="text-2xl font-bold mb-2 text-green-400">
              {popupData.title}
            </h2>
          )}

          {popupData.subtitle && (
            <h3 className="text-lg mb-3 text-white opacity-90">
              {popupData.subtitle}
            </h3>
          )}

          {popupData.body && (
            <p className="text-sm leading-relaxed text-gray-300 opacity-80">
              {popupData.body}
            </p>
          )}

          {/* Optional Button */}
          {popupData.buttonEnabled && popupData.buttonText && (
            <div className="mt-6">
              <a
                href={popupData.buttonLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#ff6b00] hover:bg-[#e55f00] text-white font-bold text-sm px-6 py-3 rounded-full hover:scale-105 transition-all"
                onClick={(e) => {
                  if (!popupData.buttonLink) e.preventDefault();
                }}
              >
                {popupData.buttonText}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
      {/* YouTube-style Banner Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800">
        {/* Top Row - Title and Actions */}
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#272727] rounded-lg">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Advertising Popup</h2>
              <p className="text-sm text-gray-400">
                {existingPopup ?
                  `Status: ${existingPopup.isActive ? 'Active' : 'Inactive'}` :
                  'No popup created yet'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Preview Button - YouTube style */}
            {existingPopup && (
              <button
                onClick={() => setPreviewMode(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#272727] hover:bg-[#3a3a3a] text-white rounded-full transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            )}

            {/* Edit Button - YouTube style */}
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#272727] hover:bg-[#3a3a3a] text-white rounded-full transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">{existingPopup ? 'Edit' : 'Create'}</span>
              <span className="sm:hidden">Edit</span>
            </button>

            {/* Activation Toggle - 3D Lever Switch */}
            {existingPopup && (
              <div className="flex-1 sm:flex-none flex items-center justify-center">
                <LeverSwitch
                  id="popup-lever"
                  isChecked={existingPopup.isActive}
                  onChange={toggleActivation}
                />
              </div>
            )}
          </div>
        </div>

        {/* Full Width Stats Banner */}
        {existingPopup && !showForm && (
          <div className="bg-[#0f0f0f] border-t border-gray-800">
            <div className="px-4 sm:px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {/* Title Column */}
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Title</span>
                  <span className="text-white font-semibold text-sm sm:text-base truncate">{existingPopup.title || 'Not set'}</span>
                </div>

                {/* Media Type Column */}
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Media Type</span>
                  <span className="text-white font-semibold text-sm sm:text-base capitalize">{existingPopup.mediaType || 'None'}</span>
                </div>

                {/* Created Column */}
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Created</span>
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {existingPopup.createdAt ? new Date(existingPopup.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                {/* Last Updated Column */}
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Last Updated</span>
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {existingPopup.updatedAt ? new Date(existingPopup.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Form - Identical to ProductForm.jsx */}
      {showForm && (
        <div className="bg-card rounded-lg overflow-hidden border border-gray-700 mt-4 mx-4 sm:mx-6 mb-4">
          {/* Table Header */}
          <div className="bg-gray-dark">
            <div className="grid grid-cols-12 gap-4 px-4 py-3">
              <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Media Type</div>
              <div className="col-span-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Media URL</div>
              <div className="col-span-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Title</div>
              <div className="col-span-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Subtitle</div>
            </div>
          </div>

          {/* Form Rows */}
          <div className="divide-y divide-border">
            {/* First Row - Main Fields */}
            <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
              {/* Media Type */}
              <div className="col-span-2">
                <select
                  name="mediaType"
                  value={popupData.mediaType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {/* Media URL */}
              <div className="col-span-4">
                <input
                  type="url"
                  name="mediaUrl"
                  value={popupData.mediaUrl}
                  onChange={handleInputChange}
                  placeholder={`https://example.com/${popupData.mediaType === 'image' ? 'image.jpg' : 'video.mp4'}`}
                  className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Title */}
              <div className="col-span-3">
                <input
                  type="text"
                  name="title"
                  value={popupData.title}
                  onChange={handleInputChange}
                  placeholder="Special Offer!"
                  className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Subtitle */}
              <div className="col-span-3">
                <input
                  type="text"
                  name="subtitle"
                  value={popupData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Limited time only!"
                  className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Second Row - Body Text & Media Preview */}
            <div className="px-4 py-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Body Text (Optional)</label>
                  <textarea
                    name="body"
                    value={popupData.body}
                    onChange={handleInputChange}
                    placeholder="Enter your promotional message here..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Media Preview</label>
                  <div className="bg-gray-dark border border-border rounded-lg p-2 h-[68px] flex items-center justify-center">
                    {popupData.mediaUrl ? (
                      popupData.mediaType === 'image' ? (
                        <MediaPlaceholder kind="image" />
                      ) : (
                        <MediaPlaceholder kind="video" />
                      )
                    ) : (
                      <div className="flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Third Row - Button Options */}
            <div className="px-4 py-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">CTA Button</label>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={popupData.buttonEnabled}
                      onChange={(e) => setPopupData(prev => ({ ...prev, buttonEnabled: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-gray-dark border-gray-600 rounded focus:ring-green-500"
                    />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${popupData.buttonEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {popupData.buttonEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {popupData.buttonEnabled && (
                  <>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Button Text</label>
                      <input
                        type="text"
                        name="buttonText"
                        value={popupData.buttonText}
                        onChange={handleInputChange}
                        placeholder="Shop Now"
                        className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Button Link</label>
                      <input
                        type="url"
                        name="buttonLink"
                        value={popupData.buttonLink}
                        onChange={handleInputChange}
                        placeholder="https://example.com/shop"
                        className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Button Preview</label>
                      <div className="bg-gray-dark border border-border rounded-lg p-2 flex items-center justify-center h-[38px]">
                        {popupData.buttonText ? (
                          <span className="inline-block bg-[#ff6b00] text-white font-bold text-xs px-4 py-1.5 rounded-full">
                            {popupData.buttonText}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Enter text</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
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
              {existingPopup && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:text-gray-400"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : (existingPopup ? 'Update Popup' : 'Create Popup')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Mode */}
      {previewMode && <PopupPreview />}
      </div>
    </>
  );
};

export default PopupManager;