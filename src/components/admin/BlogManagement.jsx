import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useRef } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, Upload, X, AlertCircle, Calendar, Clock, Search, Save } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

const BlogManagement = () => {
  const { posts, addPost, updatePost, deletePost, togglePostVisibility } = useBlog();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    category: '',
    tags: '',
    author: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef(null);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      category: '',
      tags: '',
      author: ''
    });
    setEditingPost(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.content || !formData.author) {
      setError('Title, Content, and Author are required');
      return;
    }

    try {
      const postData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      let result;
      if (editingPost) {
        result = await updatePost(editingPost.id, postData);
      } else {
        result = await addPost(postData);
      }

      if (result) {
        setSuccess(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
        setTimeout(() => {
          setShowForm(false);
          setEditingPost(null);
          resetForm();
          setSuccess('');
        }, 1500);
      } else {
        setError('Failed to save post. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      imageUrl: post.imageUrl || '',
      category: post.category || '',
      tags: post.tags ? post.tags.join(', ') : '',
      author: post.author || ''
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const result = await deletePost(postId);
      if (result) {
        setSuccess('Post deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete post');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleToggleVisibility = async (postId) => {
    const result = await togglePostVisibility(postId);
    if (!result) {
      setError('Failed to update post visibility');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique categories
  const categories = [...new Set(posts.filter(p => p.category).map(p => p.category))];

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.published).length,
    drafts: posts.filter(p => !p.published).length
  };

  const inputClass = "w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Blog Management</h1>
          <p className="text-gray-400 text-sm">Create and manage blog posts</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg">
          <p className="text-gray-400 text-sm font-medium">Total Posts</p>
          <p className="text-xl font-bold text-white">{stats.total}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${stats.total === 0 ? 'opacity-50' : ''}`}>
            <FileText className={`w-6 h-6 mb-1 ${stats.total > 0 ? 'text-blue-400' : 'text-gray-500'}`} />
            <p className={`text-xl font-bold ${stats.total > 0 ? 'text-blue-400' : 'text-gray-500'}`}>{stats.total}</p>
            <p className="text-gray-400 text-xs">Total</p>
          </div>
          <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${stats.published === 0 ? 'opacity-50' : ''}`}>
            <Eye className={`w-6 h-6 mb-1 ${stats.published > 0 ? 'text-green-400' : 'text-gray-500'}`} />
            <p className={`text-xl font-bold ${stats.published > 0 ? 'text-green-400' : 'text-gray-500'}`}>{stats.published}</p>
            <p className="text-gray-400 text-xs">Published</p>
          </div>
          <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${stats.drafts === 0 ? 'opacity-50' : ''}`}>
            <EyeOff className={`w-6 h-6 mb-1 ${stats.drafts > 0 ? 'text-yellow-400' : 'text-gray-500'}`} />
            <p className={`text-xl font-bold ${stats.drafts > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>{stats.drafts}</p>
            <p className="text-gray-400 text-xs">Drafts</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-card p-4 rounded-lg mb-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
                if (!showForm) {
                  setTimeout(() => {
                    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className={`h-4 w-4 transition-transform ${showForm ? 'rotate-45' : ''}`} />
              <span className="hidden sm:inline">{showForm ? 'Cancel' : 'New Post'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && !showForm && (
        <div className="mb-4 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400">
          {success}
        </div>
      )}
      {error && !showForm && (
        <div className="mb-4 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Form - Table Design */}
      {showForm && (
        <div ref={formRef} className="mb-4 bg-card rounded-lg overflow-hidden border border-gray-700">
          <div className="bg-gray-dark px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {editingPost ? `Edit Post: ${editingPost.title}` : 'Create New Post'}
            </h3>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mx-4 mt-4 p-3 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Post Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputClass}
                    placeholder="Enter post title"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Author *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className={inputClass}
                    placeholder="Author name"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., News"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Featured Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className={inputClass}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className={inputClass}
                    placeholder="Sample, health, lifestyle"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className={`${inputClass} resize-none`}
                  placeholder="Brief summary of the post"
                  rows="2"
                />
              </div>

              {/* Row 4 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`${inputClass} resize-none`}
                  placeholder="Write your post content..."
                  rows="6"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-4 bg-gray-dark/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                {editingPost ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No blog posts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Post</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-dark/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.imageUrl ? (
                          <MediaPlaceholder kind="image" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-dark rounded flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{post.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{post.excerpt || post.content?.substring(0, 50)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{post.author}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.category ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                          {post.category}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.published
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleVisibility(post.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            post.published
                              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/40'
                              : 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/40'
                          }`}
                          title={post.published ? 'Unpublish' : 'Publish'}
                        >
                          {post.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
