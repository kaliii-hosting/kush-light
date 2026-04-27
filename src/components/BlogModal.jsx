import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useEffect } from 'react';
import { X, Calendar, Clock, User, Share2, Facebook, Twitter, Link } from 'lucide-react';
import Portal from './ui/Portal';

const BlogModal = ({ post, isOpen, onClose }) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post.title;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        // You could add a toast notification here
        break;
      default:
        break;
    }
  };

  return (
    <Portal>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] overflow-y-auto">
        <div className="min-h-screen px-4 py-8 flex items-start justify-center">
          <div 
            className="relative bg-spotify-light-gray rounded-2xl shadow-2xl max-w-4xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Hero Image */}
            {post.imageUrl && (
              <div className="relative h-64 md:h-96 rounded-t-2xl overflow-hidden">
                <MediaPlaceholder kind="image" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-8 md:p-12">
              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-spotify-text-subdued mb-8 pb-8 border-b border-spotify-card-hover">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{calculateReadTime(post.content)}</span>
                </div>
                {post.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                )}
              </div>

              {/* Blog Content */}
              <div className="prose prose-invert max-w-none">
                <p className="text-spotify-text-subdued text-lg leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-spotify-card-hover">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share this post
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="bg-spotify-card-hover hover:bg-spotify-gray p-3 rounded-full transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="bg-spotify-card-hover hover:bg-spotify-gray p-3 rounded-full transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="bg-spotify-card-hover hover:bg-spotify-gray p-3 rounded-full transition-colors"
                      aria-label="Copy link"
                    >
                      <Link className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default BlogModal;