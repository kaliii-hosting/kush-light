import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import GradientLoader from './GradientLoader';
import {
  Home, Save, RefreshCw, AlertCircle, Plus,
  Trash2, Eye, EyeOff, Upload
} from 'lucide-react';

const HomepageManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = () => {
    const sectionsRef = ref(realtimeDb, 'homepage/sections');
    
    const unsubscribe = onValue(sectionsRef, 
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const sectionsArray = Object.entries(data).map(([id, section]) => ({
            id,
            ...section
          }));
          sectionsArray.sort((a, b) => (a.order || 0) - (b.order || 0));
          setSections(sectionsArray);
        } else {
          setSections([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching homepage sections:', error);
        setErrorMessage('Failed to load sections');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert array back to object for Firebase
      const sectionsObject = {};
      sections.forEach((section) => {
        sectionsObject[section.id] = {
          ...section,
          updatedAt: new Date().toISOString()
        };
      });

      await set(ref(realtimeDb, 'homepage/sections'), sectionsObject);
      setSuccessMessage('Homepage sections saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving sections:', error);
      setErrorMessage('Failed to save sections');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleSectionVisibility = (sectionId) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, visible: !section.visible }
        : section
    ));
  };

  const deleteSection = (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setSections(sections.filter(section => section.id !== sectionId));
    }
  };

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Homepage Builder</h1>
          <p className="text-gray-400">Manage your homepage sections and content</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="bg-spotify-light-gray rounded-xl p-12 text-center">
            <Home className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No sections configured yet</p>
            <p className="text-gray-500 mt-2">
              Homepage sections will appear here once configured
            </p>
          </div>
        ) : (
          sections.map((section, index) => (
            <div key={section.id} className="bg-spotify-light-gray rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium text-lg">{section.name || `Section ${index + 1}`}</h3>
                  <p className="text-gray-400 text-sm">Type: {section.type} • Order: {section.order || 0}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSectionVisibility(section.id)}
                    className="p-2 hover:bg-spotify-gray rounded-lg transition-colors"
                    title={section.visible ? 'Hide section' : 'Show section'}
                  >
                    {section.visible ? (
                      <Eye className="w-4 h-4 text-gray-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 hover:bg-spotify-gray rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">Homepage Dynamic Sections</p>
            <p>
              This page manages dynamic homepage sections. For full homepage customization including
              static content, video backgrounds, and product grids, use the original homepage file
              or implement a more comprehensive builder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageManagement;