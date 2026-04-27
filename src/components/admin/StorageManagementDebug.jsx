import { useState, useEffect } from 'react';
import { supabase, STORAGE_BUCKET } from '../../config/supabase';
import GradientLoader from './GradientLoader';
import {
  Upload, Download, Trash2, Copy, CheckCircle,
  AlertCircle, Loader, Image, FileText, Music,
  Video, File, Search, Filter
} from 'lucide-react';

const StorageManagementDebug = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copiedUrl, setCopiedUrl] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

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

  // Check bucket configuration on mount
  useEffect(() => {
    checkBucketConfiguration();
    fetchFiles();
  }, []);

  // Debug function to check bucket configuration
  const checkBucketConfiguration = async () => {
    try {
      console.log('Checking bucket configuration...');
      console.log('Bucket name:', STORAGE_BUCKET);
      console.log('Supabase URL:', supabase.supabaseUrl);
      
      // Try to list files to verify bucket access
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list('', { limit: 1 });
      
      if (error) {
        console.error('Bucket access error:', error);
        setDebugInfo({
          bucketName: STORAGE_BUCKET,
          accessError: error.message,
          errorCode: error.code,
          errorHint: error.hint || 'No hint available'
        });
      } else {
        console.log('Bucket access successful');
        setDebugInfo({
          bucketName: STORAGE_BUCKET,
          accessStatus: 'Success',
          canList: true
        });
      }
    } catch (error) {
      console.error('Configuration check error:', error);
      setDebugInfo({
        bucketName: STORAGE_BUCKET,
        generalError: error.message
      });
    }
  };

  // Fetch files from Supabase storage
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list('', {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Fetch files error:', error);
        throw error;
      }

      // Get file details with public URLs
      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(file.name);
          
          return {
            ...file,
            publicUrl,
            type: getFileType(file.name)
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error fetching files:', error);
      showMessage('error', `Failed to fetch files: ${error.message}`);
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

  // Enhanced file upload with detailed error logging
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
        console.log(`Attempting to upload: ${file.name}`);
        console.log(`File size: ${file.size} bytes (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`File type: ${file.type}`);

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          console.error(`File ${file.name} exceeds 50MB limit`);
          uploadResults.push({
            name: file.name,
            success: false,
            error: 'File size exceeds 50MB limit'
          });
          continue;
        }

        const uniqueFilename = generateUniqueFilename(file);
        console.log(`Generated filename: ${uniqueFilename}`);

        try {
          // Upload file to Supabase with detailed error handling
          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(uniqueFilename, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error('Upload error details:', {
              message: error.message,
              code: error.code,
              hint: error.hint,
              details: error.details
            });
            throw error;
          }

          console.log('Upload successful:', data);

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(uniqueFilename);

          console.log('Public URL:', publicUrl);

          uploadResults.push({
            name: file.name,
            success: true,
            publicUrl,
            filename: uniqueFilename
          });

          uploadedCount++;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          uploadResults.push({
            name: file.name,
            success: false,
            error: error.message,
            errorDetails: {
              code: error.code,
              hint: error.hint,
              details: error.details
            }
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
        showMessage('error', 'Failed to upload files. Check console for details.');
      }

      // Log detailed results
      console.log('Upload Results:', uploadResults);

      // Refresh file list
      fetchFiles();

    } catch (error) {
      console.error('General upload error:', error);
      showMessage('error', `Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  // Delete file
  const handleDelete = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filename]);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      showMessage('success', 'File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('error', `Failed to delete file: ${error.message}`);
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
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesType;
  });

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
          <h2 className="text-2xl font-bold text-white">Storage Management (Debug Mode)</h2>
          <p className="text-gray-400 mt-1">Upload and manage your media files</p>
        </div>
        
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

      {/* Debug Information */}
      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">Debug Information</h3>
        <pre className="text-xs text-gray-300 overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

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
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-spotify-light-gray text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-spotify-light-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
        >
          <option value="all">All Files</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="document">Documents</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No files found
          </div>
        ) : (
          filteredFiles.map((file) => {
            const FileIcon = fileTypes[file.type]?.icon || File;
            const iconColor = fileTypes[file.type]?.color || 'text-gray-400';
            
            return (
              <div key={file.name} className="bg-spotify-light-gray rounded-lg p-4 hover:bg-spotify-gray transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <FileIcon className={`w-8 h-8 ${iconColor}`} />
                  <button
                    onClick={() => handleDelete(file.name)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
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
            );
          })
        )}
      </div>

      {/* Storage Info */}
      <div className="bg-spotify-light-gray rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Storage Information</h3>
        <div className="text-gray-400 text-sm space-y-1">
          <p>• Maximum file size: 50MB per file</p>
          <p>• Supported formats: Images (JPG, PNG, GIF, WebP, SVG), Videos (MP4, WebM), Audio (MP3, WAV), Documents (PDF, DOC, TXT)</p>
          <p>• Files are publicly accessible via their URLs</p>
          <p>• Bucket: {STORAGE_BUCKET}</p>
          <p>• Supabase URL: {supabase.supabaseUrl}</p>
        </div>
      </div>

      {/* Troubleshooting Guide */}
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">Troubleshooting Upload Issues</h3>
        <div className="text-gray-300 text-sm space-y-2">
          <p><strong>1. Check Browser Console:</strong> Press F12 and look for error messages in the Console tab</p>
          <p><strong>2. Verify Bucket Permissions:</strong> Ensure your Supabase bucket has proper RLS policies</p>
          <p><strong>3. Check CORS Settings:</strong> Your domain must be whitelisted in Supabase dashboard</p>
          <p><strong>4. File Size:</strong> Ensure files are under 50MB</p>
          <p><strong>5. Network Tab:</strong> Check the Network tab in DevTools for failed requests</p>
        </div>
      </div>
    </div>
  );
};

export default StorageManagementDebug;