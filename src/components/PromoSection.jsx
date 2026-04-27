import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PromoSection = () => {
  const promos = [
    {
      title: "ELEVATE YOUR SENSES. ENHANCE YOUR EXPERIENCE.",
      subtitle: "Dive into your daily upgrade with premium Sample + pioneering innovation.",
      buttonText: "EXPLORE PREMIUM PRODUCTS",
      buttonLink: "/shop",
      backgroundImage: "https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Pictures/IMG_0013__2__1753254679596_z4ugs1r.JPG",
      alignment: "left"
    },
    {
      title: "BLISS, REIMAGINED",
      subtitle: "25% stronger, 100% smoother, and crafted to feel as luxurious as they perform.",
      buttonText: "DISCOVER THE COLLECTION",
      buttonLink: "/shop",
      backgroundImage: "https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Pictures/IMG_0015__4__1753254680374_vknih27.JPG",
      alignment: "right"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 md:gap-4 px-2 md:px-8">
      {promos.map((promo, index) => (
        <div 
          key={index}
          className="relative h-[40vh] md:h-[81vh] overflow-hidden group rounded-lg md:rounded-2xl"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 group-hover:scale-110"
            style={{ 
              backgroundImage: `url('${promo.backgroundImage}')`,
              backgroundPosition: index === 0 ? 'center' : 'center'
            }}
          />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-${promo.alignment === 'left' ? 'r' : 'l'} from-black/80 via-black/50 to-transparent`} />
          
          {/* Content */}
          <div className="relative h-full flex items-center px-4 md:px-12 lg:px-16">
            <div className={`w-full max-w-lg ${promo.alignment === 'right' ? 'md:ml-auto md:text-right' : ''} text-center md:text-left`}>
              <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight">
                {promo.title}
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-gray-200 mb-3 md:mb-6 hidden sm:block">
                {promo.subtitle}
              </p>
              <Link
                to={promo.buttonLink}
                className="inline-flex items-center bg-primary hover:bg-primary-hover text-white font-bold py-2 px-3 md:py-2 md:px-4 rounded-full transition-all transform hover:scale-105"
              >
                <span className="hidden sm:inline">{promo.buttonText}</span>
                <span className="sm:hidden">SHOP NOW</span>
                <ChevronRight className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromoSection;