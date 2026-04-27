import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { Calendar, Clock, BookOpen, ChevronDown, ChevronUp, User } from 'lucide-react';

const Blog = () => {
  const { posts, loading } = useBlog();
  const [expandedPost, setExpandedPost] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateReadTime = (content) => {
    if (!content) return '1 min';
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min`;
  };

  const handlePostClick = (postId) => {
    // Toggle the expanded post
    if (selectedPostId === postId) {
      setSelectedPostId(null);
      setExpandedPost(null);
    } else {
      setSelectedPostId(postId);
      const post = posts.find(p => p.id === postId);
      setExpandedPost(post);
      // Scroll to the post after a short delay to allow DOM update
      setTimeout(() => {
        const element = document.getElementById(`post-${postId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-lg">Loading stories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Spotify-style Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent h-80"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-3">
              Blog Posts
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Newest Brand blog posts and news
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        {posts && posts.length > 0 ? (
          <div className="space-y-8">
            {/* Blog Posts Grid with Thumbnails */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <>
                  <article
                    key={post.id}
                    id={`post-${post.id}`}
                    className="group"
                  >
                    {/* Thumbnail Card */}
                    <div 
                      onClick={() => handlePostClick(post.id)}
                      className={`bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                        selectedPostId === post.id ? 'ring-2 ring-primary' : 'hover:bg-white/10 hover:transform hover:scale-[1.02]'
                      }`}
                    >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      {post.imageUrl ? (
                        <MediaPlaceholder kind="image" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-orange-500/20">
                          <BookOpen className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Read Time Badge */}
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                        <span className="text-xs text-white flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {calculateReadTime(post.content)}
                        </span>
                      </div>

                      {/* Expand/Collapse Indicator */}
                      {selectedPostId === post.id ? (
                        <div className="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-full">
                          <ChevronUp className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white p-2 rounded-full group-hover:bg-primary transition-colors">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    {/* Post Summary */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-400">
                          {formatDate(post.createdAt)}
                        </span>
                        {post.category && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-xs text-primary font-medium uppercase">
                              {post.category}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {post.author && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author}
                          </span>
                        )}
                        <span className="text-xs text-primary font-medium">
                          {selectedPostId === post.id ? 'Close' : 'Read More'}
                        </span>
                      </div>
                    </div>
                  </div>
                  </article>

                  {/* Mobile/Tablet Expanded Content - Shows under the row */}
                  {selectedPostId === post.id && expandedPost && (
                    <div className="lg:hidden col-span-full animate-fadeIn bg-white/5 backdrop-blur-sm rounded-lg p-6 md:p-8 -mt-2">
                      {/* Article Header */}
                      <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                          {expandedPost.title}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pb-6 border-b border-gray-800">
                          {expandedPost.author && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {expandedPost.author}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(expandedPost.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {calculateReadTime(expandedPost.content)} read
                          </span>
                          {expandedPost.category && (
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                              {expandedPost.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                          {expandedPost.content}
                        </div>
                      </div>

                      {/* Close Button */}
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPostId(null);
                            setExpandedPost(null);
                          }}
                          className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors text-sm font-medium"
                        >
                          <ChevronUp className="w-4 h-4" />
                          Close Article
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ))}
            </div>

            {/* Desktop Full Width Expanded Content - Only shows on large screens */}
            {selectedPostId && expandedPost && (
              <div className="hidden lg:block mt-12 animate-fadeIn">
                <div className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-gradient-to-b from-gray-900 to-black">
                  <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
                    {/* Full Article Header */}
                    <div className="mb-8">
                      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {expandedPost.title}
                      </h1>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-8 border-b border-gray-800">
                        {expandedPost.author && (
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {expandedPost.author}
                          </span>
                        )}
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(expandedPost.createdAt)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {calculateReadTime(expandedPost.content)} read
                        </span>
                        {expandedPost.category && (
                          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                            {expandedPost.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Full Article Content */}
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg md:text-xl">
                        {expandedPost.content}
                      </div>
                    </div>

                    {/* Close Button */}
                    <div className="mt-12 pt-8 border-t border-gray-800">
                      <button
                        onClick={() => {
                          setSelectedPostId(null);
                          setExpandedPost(null);
                          // Scroll back to the post grid
                          const element = document.getElementById(`post-${selectedPostId}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium"
                      >
                        <ChevronUp className="w-5 h-5" />
                        Close Article
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">
              No blog posts available
            </p>
            <p className="text-sm text-gray-500">
              Check back later for updates
            </p>
          </div>
        )}
      </div>

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Blog;