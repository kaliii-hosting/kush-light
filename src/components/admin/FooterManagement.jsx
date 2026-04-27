import { useState } from 'react';
import { usePageContent } from '../../context/PageContentContext';
import {
  FileText, Plus, Trash2, Edit3, Save, X,
  Link, Mail, Facebook, Instagram, Twitter,
  Youtube, Globe, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import TikTokIcon from '../icons/TikTokIcon';

const FooterManagement = () => {
  const { pageContent, loading, saving, updateSection, defaultPageContent } = usePageContent();
  const [editingField, setEditingField] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Find footer section from any page (prioritize home page)
  const footerSection = pageContent?.home?.sections?.find(s => s.type === 'footer') ||
    pageContent?.about?.sections?.find(s => s.type === 'footer') ||
    defaultPageContent?.home?.sections?.find(s => s.type === 'footer');

  const startEditing = (field) => {
    setEditingField(field);
    if (field === 'newsletter') {
      setTempData({ ...footerSection.newsletter });
    } else if (field === 'columns') {
      setTempData([...footerSection.columns]);
    } else if (field === 'socialLinks') {
      setTempData([...footerSection.socialLinks]);
    } else if (field === 'bottom') {
      setTempData({
        copyright: footerSection.copyright,
        bottomLinks: footerSection.bottomLinks ? [...footerSection.bottomLinks] : []
      });
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempData(null);
  };

  const saveChanges = async () => {
    if (!editingField || !tempData) return;

    // Create a complete footer section object with all existing data
    let updatedFooter = { ...footerSection };

    if (editingField === 'newsletter') {
      updatedFooter.newsletter = tempData;
    } else if (editingField === 'columns') {
      updatedFooter.columns = tempData;
    } else if (editingField === 'socialLinks') {
      updatedFooter.socialLinks = tempData;
    } else if (editingField === 'bottom') {
      updatedFooter.copyright = tempData.copyright;
      updatedFooter.bottomLinks = tempData.bottomLinks;
    }

    // Pass the complete updated footer section
    const success = await updateSection('home', footerSection.id, updatedFooter);
    if (success) {
      setSuccessMessage('Footer updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      cancelEditing();
    } else {
      setErrorMessage('Failed to update footer. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleReset = async () => {
    if (window.confirm('This will reset the footer to default content. Are you sure?')) {
      const defaultFooter = defaultPageContent.home.sections.find(s => s.type === 'footer');
      if (defaultFooter) {
        // Ensure we're passing the complete footer object
        const success = await updateSection('home', footerSection.id, defaultFooter);
        if (success) {
          setSuccessMessage('Footer reset to defaults successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setErrorMessage('Failed to reset footer.');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      } else {
        setErrorMessage('Default footer configuration not found.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  // Social platform icons mapping
  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    tiktok: TikTokIcon,
    default: Globe
  };

  const inputClass = "w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary";

  if (loading || !footerSection) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-400">
          {loading ? 'Loading footer content...' : 'No footer section found'}
        </div>
      </div>
    );
  }

  // Count footer sections
  const sectionCount = 4; // newsletter, columns, social, bottom

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-white">Footer Management</h2>
            <p className="text-gray-400">Manage all footer content including links, newsletter, and social media</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg">
            <p className="text-gray-400 text-sm font-medium">Total Sections</p>
            <p className="text-xl font-bold text-white">{sectionCount}</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
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
      {editingField && tempData && (
        <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
          <div className="bg-gray-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                Edit {editingField === 'newsletter' ? 'Newsletter' :
                  editingField === 'columns' ? 'Footer Columns' :
                    editingField === 'socialLinks' ? 'Social Links' : 'Copyright & Links'}
              </h3>
            </div>
            <button
              onClick={cancelEditing}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {editingField === 'newsletter' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={tempData.title || ''}
                      onChange={(e) => setTempData({ ...tempData, title: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Button Text</label>
                    <input
                      type="text"
                      value={tempData.buttonText || ''}
                      onChange={(e) => setTempData({ ...tempData, buttonText: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={tempData.description || ''}
                    onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
                    className={`${inputClass} resize-none`}
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Placeholder Text</label>
                  <input
                    type="text"
                    value={tempData.placeholder || ''}
                    onChange={(e) => setTempData({ ...tempData, placeholder: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {editingField === 'columns' && (
              <div className="space-y-4">
                {tempData.map((column, colIndex) => (
                  <div key={column.id} className="bg-gray-dark rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={column.title || ''}
                        onChange={(e) => {
                          const newColumns = [...tempData];
                          newColumns[colIndex] = { ...column, title: e.target.value };
                          setTempData(newColumns);
                        }}
                        className="bg-gray-dark text-white px-3 py-1 rounded font-medium border border-border"
                        placeholder="Column Title"
                      />
                      <button
                        onClick={() => {
                          setTempData(tempData.filter((_, i) => i !== colIndex));
                        }}
                        className="p-1 hover:bg-red-600/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {column.links?.map((link, linkIndex) => (
                        <div key={linkIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={link.text || ''}
                            placeholder="Link text"
                            onChange={(e) => {
                              const newColumns = [...tempData];
                              newColumns[colIndex].links[linkIndex] = {
                                ...link,
                                text: e.target.value
                              };
                              setTempData(newColumns);
                            }}
                            className="flex-1 bg-gray-dark text-white px-2 py-1 rounded text-sm border border-border"
                          />
                          <input
                            type="text"
                            value={link.url || ''}
                            placeholder="URL"
                            onChange={(e) => {
                              const newColumns = [...tempData];
                              newColumns[colIndex].links[linkIndex] = {
                                ...link,
                                url: e.target.value
                              };
                              setTempData(newColumns);
                            }}
                            className="flex-1 bg-gray-dark text-white px-2 py-1 rounded text-sm border border-border"
                          />
                          <button
                            onClick={() => {
                              const newColumns = [...tempData];
                              newColumns[colIndex].links = newColumns[colIndex].links.filter((_, i) => i !== linkIndex);
                              setTempData(newColumns);
                            }}
                            className="p-1 hover:bg-red-600/20 rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newColumns = [...tempData];
                          if (!newColumns[colIndex].links) newColumns[colIndex].links = [];
                          newColumns[colIndex].links.push({ text: '', url: '' });
                          setTempData(newColumns);
                        }}
                        className="text-sm text-primary hover:text-primary-hover"
                      >
                        + Add Link
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setTempData([...tempData, {
                      id: `column_${Date.now()}`,
                      title: 'New Column',
                      links: [{ text: 'Link', url: '#' }]
                    }]);
                  }}
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  <Plus className="w-5 h-5 mx-auto mb-1" />
                  Add New Column
                </button>
              </div>
            )}

            {editingField === 'socialLinks' && (
              <div className="space-y-4">
                {tempData.map((social, index) => {
                  const Icon = socialIcons[social.platform?.toLowerCase()] || socialIcons.default;
                  return (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="p-2 bg-gray-dark border border-border rounded">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <input
                        type="text"
                        value={social.platform || ''}
                        placeholder="Platform (e.g., instagram)"
                        onChange={(e) => {
                          const newSocial = [...tempData];
                          newSocial[index] = { ...social, platform: e.target.value };
                          setTempData(newSocial);
                        }}
                        className={`flex-1 ${inputClass}`}
                      />
                      <input
                        type="url"
                        value={social.url || ''}
                        placeholder="URL"
                        onChange={(e) => {
                          const newSocial = [...tempData];
                          newSocial[index] = { ...social, url: e.target.value };
                          setTempData(newSocial);
                        }}
                        className={`flex-1 ${inputClass}`}
                      />
                      <button
                        onClick={() => {
                          setTempData(tempData.filter((_, i) => i !== index));
                        }}
                        className="p-2 hover:bg-red-600/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    setTempData([...tempData, { platform: '', url: '' }]);
                  }}
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  <Plus className="w-5 h-5 mx-auto mb-1" />
                  Add Social Link
                </button>
              </div>
            )}

            {editingField === 'bottom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Copyright Text</label>
                  <input
                    type="text"
                    value={tempData.copyright || ''}
                    onChange={(e) => setTempData({ ...tempData, copyright: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bottom Links</label>
                  <div className="space-y-2">
                    {tempData.bottomLinks?.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={link.text || ''}
                          placeholder="Link text"
                          onChange={(e) => {
                            const newLinks = [...tempData.bottomLinks];
                            newLinks[index] = { ...link, text: e.target.value };
                            setTempData({ ...tempData, bottomLinks: newLinks });
                          }}
                          className={`flex-1 ${inputClass}`}
                        />
                        <input
                          type="text"
                          value={link.url || ''}
                          placeholder="URL"
                          onChange={(e) => {
                            const newLinks = [...tempData.bottomLinks];
                            newLinks[index] = { ...link, url: e.target.value };
                            setTempData({ ...tempData, bottomLinks: newLinks });
                          }}
                          className={`flex-1 ${inputClass}`}
                        />
                        <button
                          onClick={() => {
                            const newLinks = tempData.bottomLinks.filter((_, i) => i !== index);
                            setTempData({ ...tempData, bottomLinks: newLinks });
                          }}
                          className="p-2 hover:bg-red-600/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newLinks = [...(tempData.bottomLinks || []), { text: '', url: '' }];
                        setTempData({ ...tempData, bottomLinks: newLinks });
                      }}
                      className="text-sm text-primary hover:text-primary-hover"
                    >
                      + Add Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={saveChanges}
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

      {/* Footer Sections Table */}
      <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Newsletter Row */}
              <tr className="hover:bg-gray-dark/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Newsletter Section</p>
                      <p className="text-xs text-gray-400">Manage newsletter signup form</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-300 truncate max-w-xs">{footerSection.newsletter?.title || 'Not set'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                    4 fields
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => startEditing('newsletter')}
                    className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>

              {/* Columns Row */}
              <tr className="hover:bg-gray-dark/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Footer Columns</p>
                      <p className="text-xs text-gray-400">Manage footer link columns</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {footerSection.columns?.slice(0, 3).map((col, i) => (
                      <span key={i} className="text-xs text-gray-400">{col.title}</span>
                    ))}
                    {footerSection.columns?.length > 3 && (
                      <span className="text-xs text-gray-500">+{footerSection.columns.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                    {footerSection.columns?.length || 0} columns
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => startEditing('columns')}
                    className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>

              {/* Social Links Row */}
              <tr className="hover:bg-gray-dark/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Social Media Links</p>
                      <p className="text-xs text-gray-400">Manage social media profiles</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {footerSection.socialLinks?.map((social, index) => {
                      const Icon = socialIcons[social.platform?.toLowerCase()] || socialIcons.default;
                      return (
                        <div key={index} className="p-1.5 bg-gray-dark rounded">
                          <Icon className="w-4 h-4 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                    {footerSection.socialLinks?.length || 0} links
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => startEditing('socialLinks')}
                    className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>

              {/* Copyright Row */}
              <tr className="hover:bg-gray-dark/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Copyright & Bottom Links</p>
                      <p className="text-xs text-gray-400">Manage copyright text and legal links</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-300 truncate max-w-xs">{footerSection.copyright || 'Not set'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                    {(footerSection.bottomLinks?.length || 0) + 1} items
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => startEditing('bottom')}
                    className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FooterManagement;
