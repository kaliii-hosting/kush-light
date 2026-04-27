import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import React from 'react';

const QualityFeatures = () => {
  // Custom Flask/Beaker Icon
  const FlaskIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 2V8L4 18C3.5 19 4 20 5 20H19C20 20 20.5 19 20 18L15 8V2" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 2H15" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 14H17" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="17" r="1" fill="#CB6015"/>
      <circle cx="15" cy="17" r="1" fill="#CB6015"/>
      <circle cx="12" cy="15" r="1" fill="#CB6015"/>
    </svg>
  );

  // Custom Joint Icon
  const JointIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12L18 12" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 12L20 10.5V13.5L18 12Z" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 12L4 10V14L6 12Z" fill="#CB6015"/>
      <path d="M8 12C8 12 9 10 10 12C11 14 12 10 13 12C14 14 15 10 16 12" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  // Custom Sample Leaf Icon
  const LeafIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21V11" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 11C12 11 9 8 9 5C9 3 10 2 12 2C14 2 15 3 15 5C15 8 12 11 12 11Z" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11C12 11 7 10 5 8C3.5 6.5 3.5 5 5 4C6.5 3 8 3.5 9.5 5C11.5 7 12 11 12 11Z" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11C12 11 17 10 19 8C20.5 6.5 20.5 5 19 4C17.5 3 16 3.5 14.5 5C12.5 7 12 11 12 11Z" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11C12 11 8 13 6 13C4 13 3 12 3 10C3 8 4 7 6 7C8 7 12 11 12 11Z" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11C12 11 16 13 18 13C20 13 21 12 21 10C21 8 20 7 18 7C16 7 12 11 12 11Z" stroke="#CB6015" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const features = [
    {
      icon: FlaskIcon,
      iconType: 'component',
      title: 'Laboratory Verified for Quality and Purity',
      description: 'Independently tested with rigorous standards. Our label transparency ensures what you see is exactly what you get — guaranteed.'
    },
    {
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Pictures/svg_314228_1753253676490_n8nih9m.svg',
      iconType: 'url',
      title: 'THC Featuring Authentic Potency for Character Energy',
      description: 'Experience precisely what\'s advertised. No surprises, just pure "this is exactly what I expected" satisfaction.'
    },
    {
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Pictures/svg_443615_1753253676300_gu9xr19.svg',
      iconType: 'url',
      title: 'Exceptional Flavor, Superior Experience and Smooth Finish',
      description: 'Crafted for connoisseurs who appreciate genuine quality and smoothness, not just marketing claims.'
    }
  ];

  return (
    <div className="bg-black py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              {/* Icon Container */}
              <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#CB6015] mb-4">
                {feature.iconType === 'component' ? (
                  <feature.icon />
                ) : (
                  <MediaPlaceholder kind="image" />
                )}
              </div>
              
              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 px-4">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm md:text-base text-gray-400 leading-relaxed px-2 md:px-4">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QualityFeatures;