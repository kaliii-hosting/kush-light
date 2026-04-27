import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import React from 'react';
import { Award } from 'lucide-react';
import { useEnhancedProducts } from '../context/EnhancedProductsContext';

const AwardWinning = () => {
  const { shopifyProducts } = useEnhancedProducts();
  
  // Get featured product from Shopify (first product or a specific award-winning product)
  const featuredProduct = shopifyProducts.find(p => p.featured) || shopifyProducts[0];

  return (
    <div className="px-6 lg:px-8">
      <div className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-spotify-light-gray to-spotify-light-gray p-6 md:p-8 group">
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Award winning product - Centered on mobile/tablet, positioned on desktop */}
        <div className="flex justify-center mb-8 lg:hidden">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-primary/30 mx-auto">
                {featuredProduct?.imageUrl && (
                  <MediaPlaceholder kind="image" />
                )}
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs md:text-sm font-bold px-3 md:px-4 py-1 rounded-full shadow-lg whitespace-nowrap z-10">
                Winner
              </div>
            </div>
            <p className="text-white font-semibold mt-4 text-sm md:text-base">{featuredProduct?.name}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Content Section */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 rounded-full shadow-xl">
                <Award className="h-5 w-5 md:h-6 md:w-6 text-black" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Award-Winning Quality</h2>
            </div>
            <p className="text-spotify-text-subdued mb-6 leading-relaxed text-sm md:text-base max-w-2xl mx-auto lg:mx-0">
              Recognized for excellence in cultivation, processing, and customer satisfaction.
              Our commitment to quality has earned us numerous industry accolades.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
              {[
                { title: 'Best Product', award: '2024 Sample Cup', icon: '🏆' },
                { title: 'Excellence Award', award: 'Industry Leader', icon: '⭐' },
                { title: 'Top Rated', award: 'Customer Choice', icon: '❤️' }
              ].map((item, index) => (
                <div key={index} className="bg-black/30 backdrop-blur-sm rounded-xl px-3 md:px-5 py-2 md:py-3 border border-white/10 hover:border-primary/50 transition-all hover:scale-105">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base md:text-lg">{item.icon}</span>
                    <p className="text-xs text-spotify-text-subdued">{item.title}</p>
                  </div>
                  <p className="font-bold text-white text-sm md:text-base">{item.award}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Award winning product - Desktop only (positioned on right) */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-40 h-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-primary/30 mx-auto">
                  {featuredProduct?.imageUrl && (
                    <MediaPlaceholder kind="image" />
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-sm font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap z-10">
                  Winner
                </div>
              </div>
              <p className="text-white font-semibold mt-4">{featuredProduct?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AwardWinning;