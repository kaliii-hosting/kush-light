import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState } from 'react';
import { useLogos } from '../../context/LogosContext';
import GradientLoader from './GradientLoader';
import {
  Monitor, Smartphone, FileText, ShieldCheck, Settings,
  Save, RefreshCw, Image, Upload, Link, X
} from 'lucide-react';

const LogosManagement = () => {
  const { logos, loading, saving, updateLogo, resetToDefaults } = useLogos();
  const [editingLogo, setEditingLogo] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const logoSections = [
    {
      id: 'desktop',
      name: 'Desktop Logo',
      description: 'Main logo shown in desktop navigation',
      icon: Monitor,
      preview: 'bg-black'
    },
    {
      id: 'mobile',
      name: 'Mobile Logo',
      description: 'Compact logo for mobile devices',
      icon: Smartphone,
      preview: 'bg-black'
    },
    {
      id: 'footer',
      name: 'Footer Logo',
      description: 'Logo displayed in the website footer',
      icon: FileText,
      preview: 'bg-gray-dark'
    },
    {
      id: 'ageVerification',
      name: 'Age Verification Logo',
      description: 'Logo shown on the age verification popup',
      icon: ShieldCheck,
      preview: 'bg-black'
    },
    {
      id: 'adminDashboard',
      name: 'Admin Dashboard Logo',
      description: 'Logo for the admin panel sidebar',
      icon: Settings,
      preview: 'bg-black'
    }
  ];

  const startEditing = (logoType) => {
    setEditingLogo(logoType);
    setTempData({ ...logos[logoType] });
  };

  const cancelEditing = () => {
    setEditingLogo(null);
    setTempData(null);
  };

  const handleFieldChange = (field, value) => {
    setTempData({
      ...tempData,
      [field]: value
    });
  };

  const saveLogo = async () => {
    if (!editingLogo || !tempData) return;

    const success = await updateLogo(editingLogo, tempData);
    if (success) {
      setSuccessMessage('Logo updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      cancelEditing();
    } else {
      setErrorMessage('Failed to update logo. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleReset = async () => {
    if (window.confirm('This will reset all logos to their defaults. Are you sure?')) {
      const success = await resetToDefaults();
      if (success) {
        setSuccessMessage('Logos reset to defaults successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Failed to reset logos.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary";

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-white">Logo Management</h2>
            <p className="text-gray-400">Manage logos across different sections of your website</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg">
            <p className="text-gray-400 text-sm font-medium">Total Logos</p>
            <p className="text-xl font-bold text-white">{logoSections.length}</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset All
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Edit Form - Table Style */}
      {editingLogo && tempData && (
        <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
          <div className="bg-gray-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">Edit Logo</h3>
              <span className="text-sm text-primary">{logoSections.find(s => s.id === editingLogo)?.name}</span>
            </div>
            <button
              onClick={cancelEditing}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Logo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={tempData.url || ''}
                    onChange={(e) => handleFieldChange('url', e.target.value)}
                    className={inputClass}
                    placeholder="https://..."
                  />
                  <button
                    className="p-2 bg-gray-dark border border-border hover:bg-gray-700 rounded-lg transition-colors"
                    title="Upload to storage"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={tempData.alt || ''}
                  onChange={(e) => handleFieldChange('alt', e.target.value)}
                  className={inputClass}
                  placeholder="Logo description"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Width
                </label>
                <input
                  type="text"
                  value={tempData.width || ''}
                  onChange={(e) => handleFieldChange('width', e.target.value)}
                  className={inputClass}
                  placeholder="auto or px value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Height
                </label>
                <input
                  type="text"
                  value={tempData.height || ''}
                  onChange={(e) => handleFieldChange('height', e.target.value)}
                  className={inputClass}
                  placeholder="auto or px value"
                />
              </div>
            </div>

            {/* Preview */}
            {tempData.url && (
              <div className="bg-gray-dark rounded-lg p-4 border border-border">
                <p className="text-xs text-gray-400 mb-2">Preview</p>
                <div className="bg-black rounded-lg p-4 flex items-center justify-center">
                  <MediaPlaceholder kind="image" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={saveLogo}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={cancelEditing}
                className="flex-1 bg-gray-dark border border-border hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logos Table */}
      <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Dimensions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  URL Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logoSections.map((section) => {
                const Icon = section.icon;
                const logoData = logos[section.id];

                return (
                  <tr key={section.id} className="hover:bg-gray-dark/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{section.name}</p>
                          <p className="text-xs text-gray-400">{section.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`${section.preview} rounded-lg p-2 w-20 h-12 flex items-center justify-center`}>
                        {logoData?.url ? (
                          <MediaPlaceholder kind="image" />
                        ) : (
                          <Image className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">
                        {logoData?.width || 'auto'} × {logoData?.height || 'auto'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {logoData?.url ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                          Set
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
                          Not Set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => startEditing(section.id)}
                        className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogosManagement;
