import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductSections from './ProductSections';
import AwardWinning from './AwardWinning';

const DynamicSection = ({ section, className = '', isFirstSection = false, onCartClick }) => {
  // Add consistent spacing wrapper for all sections
  const sectionWrapper = (content, sectionType) => {
    // Special handling for main hero section
    if (sectionType === 'hero' && (isFirstSection || section.id === 'hero_main')) {
      return <div className={`hero-section ${className}`}>{content}</div>;
    }
    const wrapperClass = `section-wrapper ${sectionType}-section ${className}`;
    return <div className={wrapperClass}>{content}</div>;
  };

  // Render hero section
  if (section.type === 'hero') {
    // Check if this is the main hero (first section) or a video section
    const isMainHero = section.id === 'hero' || section.id === 'hero_main' || isFirstSection;
    const sectionIndex = ['goldCartridges', 'disposables', 'premiumExperience', 'innovation'].indexOf(section.id);
    const isAlternateLayout = sectionIndex >= 0 && sectionIndex % 2 === 1;
    
    if (isMainHero) {
      return sectionWrapper(
        <div className={`relative h-[85vh] -mt-16 overflow-hidden ${className}`}>
        {/* Video or Image Background */}
        {section.videoUrl && (
          <MediaPlaceholder kind="video" />
        )}
        
        {section.imageUrl && !section.videoUrl && (
          <MediaPlaceholder kind="image" />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        {/* Content - only show if there's actual content to display */}
        {((section.title && section.title.trim() !== '') || 
          (section.subtitle && section.subtitle.trim() !== '') || 
          (section.buttonText && section.buttonText.trim() !== '' && section.buttonLink && section.buttonLink.trim() !== '')) && (
          <div className={`relative h-full flex items-center ${
            section.alignment === 'left' ? 'justify-start' : 
            section.alignment === 'right' ? 'justify-end' : 
            'justify-center'
          } ${
            section.alignment === 'center' ? 'text-center' : 
            section.alignment === 'right' ? 'text-right' : 
            'text-left'
          } px-8`}>
            <div className="max-w-4xl">
              {section.title && section.title.trim() !== '' && (
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
                  {section.title}
                </h1>
              )}
              {section.subtitle && section.subtitle.trim() !== '' && (
                <p className="text-xl md:text-2xl text-gray-300 mb-4">
                  {section.subtitle}
                </p>
              )}
              {section.buttonText && section.buttonText.trim() !== '' && section.buttonLink && section.buttonLink.trim() !== '' && (
                <Link
                  to={section.buttonLink}
                  className="inline-flex items-center bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-full transition-all transform hover:scale-105"
                >
                  {section.buttonText}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>,
      'hero'
    );
    } else {
      // Video sections with smaller height and alternating layout
      return sectionWrapper(
        <div className={`relative h-[50vh] md:h-[60vh] overflow-hidden ${className}`}>
          {/* Video Background */}
          {section.videoUrl && (
            <MediaPlaceholder kind="video" />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Content - only show if there's actual content */}
          {((section.title && section.title.trim() !== '') || 
            (section.subtitle && section.subtitle.trim() !== '') || 
            (section.buttonText && section.buttonText.trim() !== '' && section.buttonLink && section.buttonLink.trim() !== '')) && (
            <div className="relative h-full">
              <div className="max-w-7xl mx-auto h-full px-6 lg:px-8">
                <div className={`h-full flex items-center ${
                  section.alignment ? (
                    section.alignment === 'left' ? 'justify-start' : 
                    section.alignment === 'right' ? 'justify-end' : 
                    'justify-center'
                  ) : (isAlternateLayout ? 'justify-end' : 'justify-start')
                }`}>
                  <div className={`max-w-xl ${
                    section.alignment ? (
                      section.alignment === 'center' ? 'text-center' : 
                      section.alignment === 'right' ? 'text-right' : 
                      'text-left'
                    ) : (isAlternateLayout ? 'text-right' : 'text-left')
                  }`}>
                    {section.title && section.title.trim() !== '' && (
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
                        {section.title}
                      </h2>
                    )}
                    {section.subtitle && section.subtitle.trim() !== '' && (
                      <p className="text-lg md:text-xl text-gray-200 mb-4 leading-relaxed">
                        {section.subtitle}
                      </p>
                    )}
                    {section.buttonText && section.buttonText.trim() !== '' && section.buttonLink && section.buttonLink.trim() !== '' && (
                      <Link
                        to={section.buttonLink}
                        className="inline-flex items-center bg-primary hover:bg-primary-hover text-white font-bold py-1.5 px-3 rounded-full transition-all transform hover:scale-105"
                      >
                        {section.buttonText}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>,
        'video-section'
      );
    }
  }

  // Render content section
  if (section.type === 'content') {
    return sectionWrapper(
      <div className={`px-6 lg:px-8 ${className}`}>
        <div className="max-w-7xl mx-auto">
          {section.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {section.title}
            </h2>
          )}
          {section.subtitle && (
            <p className="text-xl text-gray-400 mb-4">
              {section.subtitle}
            </p>
          )}
          {section.description && (
            <p className="text-lg text-gray-300 mb-4 max-w-3xl">
              {section.description}
            </p>
          )}
          
          {/* Render items if they exist */}
          {section.items && section.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {section.items.map((item, index) => (
                <div key={index} className="bg-spotify-light-gray rounded-lg p-3">
                  {item.value && (
                    <div className="text-3xl font-bold text-primary mb-1">{item.value}</div>
                  )}
                  {item.label && (
                    <div className="text-lg font-semibold text-white mb-1">{item.label}</div>
                  )}
                  {item.title && (
                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-gray-400">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Contact-specific fields */}
          {section.email && (
            <div className="mb-2">
              <span className="text-gray-400">Email: </span>
              <a href={`mailto:${section.email}`} className="text-primary hover:underline">
                {section.email}
              </a>
            </div>
          )}
          {section.phone && (
            <div className="mb-2">
              <span className="text-gray-400">Phone: </span>
              <a href={`tel:${section.phone}`} className="text-primary hover:underline">
                {section.phone}
              </a>
            </div>
          )}
          {section.address && (
            <div className="mb-2">
              <span className="text-gray-400">Address: </span>
              <span className="text-white">{section.address}</span>
              {section.city && <span className="text-white">, {section.city}</span>}
            </div>
          )}
          {section.hours && (
            <div className="mb-2">
              <span className="text-gray-400">Hours: </span>
              <span className="text-white">{section.hours}</span>
            </div>
          )}
        </div>
      </div>,
      'content'
    );
  }

  // Render CTA section
  if (section.type === 'cta') {
    return sectionWrapper(
      <div className={`px-6 lg:px-8 ${className}`}>
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-6">
          {section.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {section.title}
            </h2>
          )}
          {section.description && (
            <p className="text-xl text-gray-300 mb-4">
              {section.description}
            </p>
          )}
          
          {/* Newsletter form */}
          {section.emailPlaceholder && (
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-4">
              <input
                type="email"
                placeholder={section.emailPlaceholder}
                className="flex-1 bg-black/50 border border-gray-700 rounded-full px-3 py-1.5 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white font-bold py-1.5 px-4 rounded-full transition-colors"
              >
                {section.buttonText || 'Subscribe'}
              </button>
            </form>
          )}
          
          {/* Regular CTA button */}
          {!section.emailPlaceholder && section.buttonText && section.buttonLink && (
            <Link
              to={section.buttonLink}
              className="inline-flex items-center bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105"
            >
              {section.buttonText}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>,
      'cta'
    );
  }

  // Render product sections
  if (section.type === 'products') {
    // Skip rendering recentlyViewed sections
    if (section.productType === 'recentlyViewed') {
      return null;
    }
    
    return sectionWrapper(
      <>
        <ProductSections productType={section.productType} />
      </>,
      'products'
    );
  }

  // Render award-winning section
  if (section.type === 'awardWinning') {
    return sectionWrapper(<AwardWinning />, 'award-winning');
  }

  // Render footer section
  if (section.type === 'footer') {
    return sectionWrapper(
      <footer className={`bg-black border-t border-spotify-gray py-6 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Newsletter Section */}
          {section.newsletter && (
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-1">{section.newsletter.title}</h3>
              <p className="text-gray-400 mb-2">{section.newsletter.description}</p>
              <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={section.newsletter.placeholder}
                  className="flex-1 bg-spotify-gray border border-gray-700 rounded-full px-3 py-1.5 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-bold py-1.5 px-4 rounded-full transition-colors"
                >
                  {section.newsletter.buttonText}
                </button>
              </form>
            </div>
          )}
          
          {/* Footer Columns */}
          {section.columns && section.columns.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {section.columns.map((column) => (
                <div key={column.id}>
                  <h4 className="text-white font-semibold mb-2">{column.title}</h4>
                  <ul className="space-y-1">
                    {column.links && column.links.map((link, index) => (
                      <li key={index}>
                        <Link 
                          to={link.url} 
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          
          {/* Social Links */}
          {section.socialLinks && section.socialLinks.length > 0 && (
            <div className="flex justify-center gap-3 mb-4">
              {section.socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.platform}
                >
                  <span className="text-2xl">
                    {social.platform === 'instagram' && '📷'}
                    {social.platform === 'twitter' && '🐦'}
                    {social.platform === 'facebook' && '📘'}
                    {social.platform === 'youtube' && '📺'}
                    {social.platform === 'linkedin' && '💼'}
                    {social.platform === 'tiktok' && '🎵'}
                  </span>
                </a>
              ))}
            </div>
          )}
          
          {/* Copyright and Bottom Links */}
          <div className="border-t border-spotify-gray pt-4 text-center">
            {section.copyright && (
              <p className="text-gray-400 mb-2">{section.copyright}</p>
            )}
            {section.bottomLinks && section.bottomLinks.length > 0 && (
              <div className="flex justify-center gap-3 text-sm">
                {section.bottomLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.url}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.text}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>,
      'footer'
    );
  }

  // Default fallback
  return null;
};

export default DynamicSection;