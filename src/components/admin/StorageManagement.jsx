import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { supabase, STORAGE_BUCKET } from '../../config/supabase';
import GradientLoader from './GradientLoader';
import {
  Upload, Download, Trash2, Copy, CheckCircle,
  AlertCircle, Loader, Image, FileText, Music,
  Video, File, Search, Filter, Folder, FolderPlus,
  ChevronRight, Home, ArrowLeft
} from 'lucide-react';

const StorageManagement = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copiedUrl, setCopiedUrl] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // File type configurations
  const fileTypes = {
    image: {
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      icon: Image,
      color: 'text-green-400'
    },
    video: {
      extensions: ['mp4', 'webm', 'ogg', 'mov'],
      icon: Video,
      color: 'text-blue-400'
    },
    audio: {
      extensions: ['mp3', 'wav', 'ogg', 'aac'],
      icon: Music,
      color: 'text-purple-400'
    },
    document: {
      extensions: ['pdf', 'doc', 'docx', 'txt'],
      icon: FileText,
      color: 'text-yellow-400'
    }
  };

  // Fetch files and folders from Supabase storage
  useEffect(() => {
    fetchFilesAndFolders();
  }, [currentPath]);

  const fetchFilesAndFolders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(currentPath, {
          limit: 1000,
          offset: 0
        });

      if (error) throw error;

      // Separate folders and files
      const allItems = data || [];
      const folderItems = allItems.filter(item => item.id === null);
      const fileItems = allItems.filter(item => item.id !== null);

      // Get file details with public URLs
      const filesWithUrls = await Promise.all(
        fileItems.map(async (file) => {
          const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
          const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fullPath);
          
          return {
            ...file,
            publicUrl,
            type: getFileType(file.name),
            fullPath
          };
        })
      );

      setFolders(folderItems);
      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error fetching files:', error);
      showMessage('error', 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  // Get file type based on extension
  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    for (const [type, config] of Object.entries(fileTypes)) {
      if (config.extensions.includes(extension)) {
        return type;
      }
    }
    return 'other';
  };

  // Generate unique filename
  const generateUniqueFilename = (file) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split('.').pop();
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
    return `${cleanName}_${timestamp}_${randomString}.${extension}`;
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    
    const totalFiles = selectedFiles.length;
    let uploadedCount = 0;
    const uploadResults = [];

    try {
      for (const file of selectedFiles) {
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          uploadResults.push({
            name: file.name,
            success: false,
            error: 'File size exceeds 50MB limit'
          });
          continue;
        }

        const uniqueFilename = generateUniqueFilename(file);
        const uploadPath = currentPath ? `${currentPath}/${uniqueFilename}` : uniqueFilename;

        try {
          // Upload file to Supabase
          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(uploadPath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(uploadPath);

          uploadResults.push({
            name: file.name,
            success: true,
            publicUrl,
            filename: uniqueFilename
          });

          uploadedCount++;
        } catch (error) {
          uploadResults.push({
            name: file.name,
            success: false,
            error: error.message
          });
        }

        // Update progress
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      // Show results
      const successCount = uploadResults.filter(r => r.success).length;
      if (successCount === totalFiles) {
        showMessage('success', `Successfully uploaded ${successCount} file(s)`);
      } else if (successCount > 0) {
        showMessage('warning', `Uploaded ${successCount} of ${totalFiles} file(s)`);
      } else {
        showMessage('error', 'Failed to upload files');
      }

      // Refresh file list
      fetchFilesAndFolders();

    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', 'Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showMessage('error', 'Please enter a folder name');
      return;
    }

    try {
      const folderPath = currentPath ? `${currentPath}/${newFolderName}/.keep` : `${newFolderName}/.keep`;
      
      // Create a .keep file to establish the folder
      const keepFile = new File([''], '.keep', { type: 'text/plain' });
      
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(folderPath, keepFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      showMessage('success', 'Folder created successfully');
      setShowNewFolderModal(false);
      setNewFolderName('');
      fetchFilesAndFolders();
    } catch (error) {
      console.error('Create folder error:', error);
      showMessage('error', 'Failed to create folder: ' + error.message);
    }
  };

  // Navigate to folder
  const navigateToFolder = (folderName) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  // Navigate back
  const navigateBack = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  // Navigate to home
  const navigateHome = () => {
    setCurrentPath('');
  };

  // Delete file
  const handleDelete = async (filePath) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (error) throw error;

      showMessage('success', 'File deleted successfully');
      fetchFilesAndFolders();
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('error', 'Failed to delete file');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderName) => {
    if (!window.confirm(`Are you sure you want to delete the folder "${folderName}" and all its contents?`)) return;

    try {
      const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      
      // List all files in the folder
      const { data: folderContents, error: listError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folderPath, {
          limit: 1000,
          offset: 0
        });

      if (listError) throw listError;

      // Delete all files in the folder
      if (folderContents && folderContents.length > 0) {
        const filePaths = folderContents
          .filter(item => item.id !== null)
          .map(file => `${folderPath}/${file.name}`);
        
        if (filePaths.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(filePaths);
          
          if (deleteError) throw deleteError;
        }
      }

      // Delete the .keep file if it exists
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([`${folderPath}/.keep`]);

      showMessage('success', 'Folder deleted successfully');
      fetchFilesAndFolders();
    } catch (error) {
      console.error('Delete folder error:', error);
      showMessage('error', 'Failed to delete folder');
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url, filename) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(filename);
      setTimeout(() => setCopiedUrl(''), 2000);
      showMessage('success', 'URL copied to clipboard');
    } catch (error) {
      showMessage('error', 'Failed to copy URL');
    }
  };

  // Show message
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Get breadcrumb parts
  const getBreadcrumbParts = () => {
    if (!currentPath) return [];
    return currentPath.split('/').filter(part => part);
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesType;
  });

  // Filter folders
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Storage Management</h2>
          <p className="text-gray-400 mt-1">Upload and manage your media files</p>
        </div>
        
        <div className="flex gap-3">
          {/* New Folder Button */}
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-2 bg-spotify-gray hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
            New Folder
          </button>
          
          {/* Upload Button */}
          <label className="flex items-center gap-2 bg-spotify-green hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            Upload Files
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
          </label>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-gray-400">
        <button
          onClick={navigateHome}
          className="hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
        </button>
        {getBreadcrumbParts().map((part, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => {
                const newPath = getBreadcrumbParts().slice(0, index + 1).join('/');
                setCurrentPath(newPath);
              }}
              className="hover:text-white transition-colors"
            >
              {part}
            </button>
          </div>
        ))}
      </div>

      {/* Back Button */}
      {currentPath && (
        <button
          onClick={navigateBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Message Alert */}
      {message.text && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400' :
          message.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
           message.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
           <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-spotify-light-gray rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white">Uploading...</span>
            <span className="text-spotify-green">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-spotify-gray rounded-full h-2">
            <div 
              className="bg-spotify-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-card p-4 rounded-lg">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-dark border border-border text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-dark border border-border text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Folders Table */}
      {filteredFolders.length > 0 && (
        <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Folder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFolders.map((folder) => (
                  <tr
                    key={folder.name}
                    className="hover:bg-gray-dark/50 transition-colors cursor-pointer"
                    onDoubleClick={() => navigateToFolder(folder.name)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Folder className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-white font-medium">{folder.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                        Folder
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigateToFolder(folder.name)}
                          className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
                        >
                          Open
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.name);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

        {/* Files */}
        {filteredFiles.length === 0 && filteredFolders.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No files or folders found
          </div>
        ) : (
          filteredFiles.map((file) => {
            const FileIcon = fileTypes[file.type]?.icon || File;
            const iconColor = fileTypes[file.type]?.color || 'text-gray-400';
            const isImage = file.type === 'image';
            const isVideo = file.type === 'video';
            const showThumbnail = isImage || isVideo;
            
            return (
              <div key={file.name} className="bg-spotify-light-gray rounded-lg overflow-hidden hover:bg-spotify-gray transition-colors">
                {/* Thumbnail Section */}
                {showThumbnail ? (
                  <div className="relative h-48 bg-spotify-gray overflow-hidden">
                    {isImage ? (
                      <MediaPlaceholder kind="image" />
                    ) : isVideo ? (
                      <MediaPlaceholder kind="video" />
                    ) : null}
                    {/* Fallback icon */}
                    <div className="absolute inset-0 items-center justify-center hidden">
                      <FileIcon className={`w-16 h-16 ${iconColor}`} />
                    </div>
                    {/* Delete button overlay */}
                    <button
                      onClick={() => handleDelete(file.fullPath)}
                      className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-red-400 hover:text-red-300 hover:bg-black/70 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {/* File type badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                      {file.type.toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <FileIcon className={`w-8 h-8 ${iconColor}`} />
                      <button
                        onClick={() => handleDelete(file.fullPath)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="p-4 pt-3">
                  <h3 className="text-white font-medium text-sm mb-2 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  
                  <div className="text-gray-400 text-xs space-y-1">
                    <p>Size: {formatFileSize(file.metadata?.size || 0)}</p>
                    <p>Modified: {formatDate(file.updated_at)}</p>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <a
                      href={file.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 bg-spotify-gray hover:bg-gray-600 text-white text-xs py-2 rounded transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      View
                    </a>
                    <button
                      onClick={() => copyToClipboard(file.publicUrl, file.name)}
                      className="flex-1 flex items-center justify-center gap-1 bg-spotify-gray hover:bg-gray-600 text-white text-xs py-2 rounded transition-colors"
                    >
                      {copiedUrl === file.name ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-spotify-green" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy URL
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-spotify-light-gray rounded-lg p-6 w-96">
            <h3 className="text-white text-xl font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="w-full bg-spotify-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateFolder}
                className="flex-1 bg-spotify-green hover:bg-green-400 text-black font-semibold py-2 rounded-lg transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="flex-1 bg-spotify-gray hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Info */}
      <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
        <div className="bg-gray-dark px-4 py-3">
          <h3 className="text-lg font-semibold text-white">Storage Information</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Max file size:</span>
              <span className="text-white">50MB per file</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Current folder:</span>
              <span className="text-white">{currentPath || 'Root'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Bucket:</span>
              <span className="text-white">{STORAGE_BUCKET}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Access:</span>
              <span className="text-green-400">Public URLs</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-gray-400 text-xs">
              Supported formats: Images (JPG, PNG, GIF, WebP, SVG), Videos (MP4, WebM), Audio (MP3, WAV), Documents (PDF, DOC, TXT)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageManagement;