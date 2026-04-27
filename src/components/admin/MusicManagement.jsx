import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useRef } from 'react';
import { Music, Plus, Edit2, Trash2, Play, Pause, Upload, X, AlertCircle, Save, Search } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const MusicManagement = () => {
  const { tracks, currentTrack, isPlaying, addTrack, updateTrack, deleteTrack, playTrack, pauseTrack } = useMusic();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    coverUrl: '',
    audioUrl: '',
    duration: '',
    lyrics: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef(null);

  const resetForm = () => {
    setFormData({
      title: '',
      artist: '',
      album: '',
      coverUrl: '',
      audioUrl: '',
      duration: '',
      lyrics: ''
    });
    setEditingTrack(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title || !formData.artist || !formData.audioUrl) {
      setError('Title, Artist, and Audio URL are required');
      return;
    }

    try {
      let result;
      if (editingTrack) {
        result = await updateTrack(editingTrack.id, formData);
      } else {
        result = await addTrack(formData);
      }

      if (result) {
        setSuccess(editingTrack ? 'Track updated successfully!' : 'Track added successfully!');
        resetForm();
        setShowAddForm(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save track. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleEdit = (track) => {
    setEditingTrack(track);
    setFormData({
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      coverUrl: track.coverUrl || '',
      audioUrl: track.audioUrl,
      duration: track.duration || '',
      lyrics: track.lyrics || ''
    });
    setShowAddForm(true);
    // Scroll to form after a short delay
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (trackId) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      const result = await deleteTrack(trackId);
      if (result) {
        setSuccess('Track deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete track');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    resetForm();
  };

  // Filter tracks based on search
  const filteredTracks = tracks.filter(track => {
    const searchLower = searchTerm.toLowerCase();
    return (
      track.title?.toLowerCase().includes(searchLower) ||
      track.artist?.toLowerCase().includes(searchLower) ||
      track.album?.toLowerCase().includes(searchLower)
    );
  });

  const inputClass = "w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-white">Music Management</h2>
            <p className="text-gray-400">Manage tracks for the music player</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg">
            <p className="text-gray-400 text-sm font-medium">Total Tracks</p>
            <p className="text-xl font-bold text-white">{tracks.length}</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Track
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400">
          {success}
        </div>
      )}
      {error && !showAddForm && (
        <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-card p-4 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tracks by title, artist, or album..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Inline Add/Edit Form - Table Style */}
      {showAddForm && (
        <div ref={formRef} className="bg-card rounded-lg overflow-hidden border border-gray-700">
          <div className="bg-gray-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                {editingTrack ? 'Edit Track' : 'Add New Track'}
              </h3>
              {editingTrack && (
                <span className="text-sm text-primary">{editingTrack.title}</span>
              )}
            </div>
            <button
              onClick={handleCancelForm}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            {/* Error in form */}
            {error && (
              <div className="mb-4 p-4 bg-red-600/20 border border-red-600/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Track Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputClass}
                    placeholder="Enter track title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Artist *
                  </label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    className={inputClass}
                    placeholder="Enter artist name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Album
                  </label>
                  <input
                    type="text"
                    value={formData.album}
                    onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                    className={inputClass}
                    placeholder="Enter album name (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (in seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., 180 for 3:00"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Audio URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className={`${inputClass} pl-10`}
                    placeholder="https://example.com/track.mp3"
                    required
                  />
                  <Music className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    className={`${inputClass} pl-10`}
                    placeholder="https://example.com/cover.jpg"
                  />
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lyrics (Optional)
                </label>
                <textarea
                  value={formData.lyrics}
                  onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                  className={`${inputClass} resize-vertical`}
                  placeholder="Enter song lyrics..."
                  rows="4"
                />
              </div>

              {/* Preview */}
              {(formData.coverUrl || formData.title) && (
                <div className="bg-gray-dark rounded-lg p-4 border border-border flex items-center gap-4">
                  <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0">
                    {formData.coverUrl ? (
                      <MediaPlaceholder kind="image" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{formData.title || 'Track Title'}</h4>
                    <p className="text-gray-400 text-sm">
                      {formData.artist || 'Artist'} {formData.album && `• ${formData.album}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingTrack ? 'Update Track' : 'Add Track'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 bg-gray-dark border border-border hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracks Table */}
      <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Album
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTracks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Music className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {searchTerm ? 'No tracks match your search' : 'No tracks added yet'}
                    </p>
                    {!searchTerm && (
                      <p className="text-gray-500 mt-2">Click "Add Track" to get started</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTracks.map((track) => (
                  <tr
                    key={track.id}
                    className={`hover:bg-gray-dark/50 transition-colors ${currentTrack?.id === track.id ? 'bg-primary/5' : ''
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0">
                          {track.coverUrl ? (
                            <MediaPlaceholder kind="image" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{track.title}</p>
                          <p className="text-xs text-gray-400">{track.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{track.album || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{formatDuration(track.duration)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {currentTrack?.id === track.id ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                          {isPlaying ? 'Playing' : 'Paused'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
                          Ready
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {currentTrack?.id === track.id && isPlaying ? (
                          <button
                            onClick={() => pauseTrack()}
                            className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                            title="Pause"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => playTrack(track)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-dark rounded-lg transition-colors"
                            title="Play"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(track)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-dark rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(track.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MusicManagement;
