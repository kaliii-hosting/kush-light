import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { usePageContent } from '../context/PageContentContext';
import { useLogos } from '../context/LogosContext';
import { ref, push } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import NotificationToast from './NotificationToast';
import TikTokIcon from './icons/TikTokIcon';

const GlobalFooter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const currentYear = new Date().getFullYear();
  const { pageContent } = usePageContent();
  const { logos } = useLogos();
  
  // Get footer content from PageContentContext
  const footerSection = pageContent?.home?.sections?.find(s => s.type === 'footer');
  
  // Use footer data if available, otherwise use defaults
  const newsletter = footerSection?.newsletter || {
    title: 'Stay Updated',
    description: 'Get the latest news and exclusive offers',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe'
  };
  
  const columns = footerSection?.columns || [
    {
      id: 'company',
      title: 'Company',
      links: [
        { text: 'About Us', url: '/about' },
        { text: 'Blog', url: '/blog' },
      ]
    },
    {
      id: 'products',
      title: 'Products',
      links: [
        { text: 'Merch', url: '/shop' },
        { text: 'New Arrivals', url: '/shop?filter=new' },
        { text: 'Best Sellers', url: '/shop?filter=bestsellers' },
        { text: 'Wholesale', url: '/wholesale' },
      ]
    },
    {
      id: 'support',
      title: 'Support',
      links: [
        { text: 'Contact Us', url: '/contact' },
        { text: 'Careers', url: '/careers' },
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { text: 'Privacy Policy', url: '/privacy-policy' },
        { text: 'Terms of Service', url: '/terms-of-service' },
        { text: 'Lab Results', url: '/lab-results' },
      ]
    }
  ];
  
  const socialLinks = footerSection?.socialLinks || [
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
    { platform: 'youtube', url: 'https://youtube.com' },
  ];
  
  const copyright = footerSection?.copyright || `© ${currentYear} Brand. All rights reserved.`;

  const bottomLinks = footerSection?.bottomLinks || [
    { text: 'Accessibility', url: '/accessibility' },
  ];

  // Social icon mapping
  const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube,
    tiktok: TikTokIcon,
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Firebase messages with newsletter flag
      await push(ref(realtimeDb, 'messages'), {
        name: 'Newsletter Subscriber',
        email: email,
        message: 'Newsletter subscription',
        phone: '',
        timestamp: Date.now(),
        read: false,
        isNewsletter: true
      });

      // Show success toast
      setShowToast(true);
      setEmail('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="footer-section bg-black border-t border-spotify-light-gray">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        
        {/* Newsletter Section */}
        {newsletter && (
          <div className="mb-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{newsletter.title}</h3>
            <p className="text-spotify-text-subdued mb-6">{newsletter.description}</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder={newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 bg-spotify-light-gray text-white px-6 py-3 rounded-full placeholder-spotify-text-subdued focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Subscribing...' : newsletter.buttonText}
              </button>
            </form>
          </div>
        )}
        
        {/* Divider */}
        <div className="mb-12 border-t border-spotify-light-gray" />
        
        {/* Mobile Logo Section - Centered and Bigger */}
        <div className="block md:hidden mb-8 text-center">
          <Link to="/" className="inline-block mb-4">
            <MediaPlaceholder kind="image" />
          </Link>
          <p className="text-sm text-spotify-text-subdued mb-6 px-4">
            Premium Sample products delivered with care. Quality, consistency, and customer satisfaction are our priorities.
          </p>
          {/* Mobile Social Links - Centered */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {socialLinks.map((social, index) => {
              const Icon = socialIcons[social.platform?.toLowerCase()] || socialIcons.facebook;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-light-gray text-spotify-text-subdued hover:bg-spotify-card-hover hover:text-white transition-all"
                  aria-label={social.platform}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Mobile Footer Content - All columns in one row */}
        <div className="grid grid-cols-4 gap-4 md:hidden mb-8">
          {columns.map((column) => (
            <div key={column.id}>
              <h3 className="text-xs font-semibold text-white mb-3">{column.title}</h3>
              <ul className="space-y-2">
                {column.links?.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.url} 
                      className="text-xs text-spotify-text-subdued hover:text-white transition-colors block"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Desktop Footer Content */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Logo and Company Info */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-6">
              <MediaPlaceholder kind="image" />
            </Link>
            <p className="text-sm text-spotify-text-subdued mb-6 max-w-sm">
              Premium Sample products delivered with care. Quality, consistency, and customer satisfaction are our priorities.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-spotify-text-subdued">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Multiple locations across 6 states</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-spotify-text-subdued">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:213-290-6664" className="hover:text-white transition-colors">
                  213-290-6664
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-spotify-text-subdued">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:order@kushiebrand.com" className="hover:text-white transition-colors">
                  order@kushiebrand.com
                </a>
              </div>
            </div>
          </div>

          {/* Dynamic Columns */}
          {columns.map((column) => (
            <div key={column.id}>
              <h3 className="text-sm font-semibold text-white mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links?.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.url} 
                      className="text-sm text-spotify-text-subdued hover:text-white transition-colors flex items-center gap-1"
                    >
                      {link.text}
                      {link.url.includes('lab-results') && (
                        <ExternalLink className="h-3 w-3" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-spotify-light-gray" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Links - Desktop Only (already shown above on mobile) */}
          <div className="hidden md:flex items-center gap-4">
            {socialLinks.map((social, index) => {
              const Icon = socialIcons[social.platform?.toLowerCase()] || socialIcons.facebook;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-light-gray text-spotify-text-subdued hover:bg-spotify-card-hover hover:text-white transition-all"
                  aria-label={social.platform}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>

          {/* Copyright and Additional Links */}
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-spotify-text-subdued">
            <span>{copyright}</span>
            <div className="flex items-center gap-6">
              {bottomLinks?.map((link, index) => (
                <Link key={index} to={link.url} className="hover:text-white transition-colors">
                  {link.text}
                </Link>
              ))}
              <button
                onClick={() => {
                  // Scroll to top - works for both body scroll and container scroll
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
                  // Also try scrolling main content containers
                  const mainContent = document.querySelector('main') || document.querySelector('.main-content');
                  if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </div>

        {/* Age Verification Notice */}
        <div className="mt-8 rounded-lg bg-spotify-light-gray/50 p-4 text-center">
          <p className="text-xs text-spotify-text-subdued">
            <span className="font-semibold">WARNING:</span> Products may contain THC. Keep out of reach of children and pets. 
            For use only by adults 21 years of age and older. Do not drive or operate machinery.
          </p>
        </div>
      </div>
      
      {/* Notification Toast */}
      <NotificationToast 
        show={showToast} 
        message="Subscribed!" 
        onClose={() => setShowToast(false)} 
      />
    </footer>
  );
};

export default GlobalFooter;