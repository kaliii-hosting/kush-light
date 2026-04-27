import React, { useEffect, useState, useRef } from 'react';
import { Leaf, Wind, Users } from 'lucide-react';

const GrowingTogether = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [treesPlanted, setTreesPlanted] = useState(0);
  const [co2Offset, setCo2Offset] = useState(0);
  const [forestsPartners, setForestsPartners] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      // Animate counters
      const animateCounter = (setter, target, duration, isDecimal = false) => {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setter(target);
            clearInterval(timer);
          } else {
            setter(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
          }
        }, 16);

        return timer;
      };

      const timer1 = animateCounter(setTreesPlanted, 1247, 2000);
      const timer2 = animateCounter(setCo2Offset, 15.2, 2000, true);
      const timer3 = animateCounter(setForestsPartners, 5, 1500);

      return () => {
        clearInterval(timer1);
        clearInterval(timer2);
        clearInterval(timer3);
      };
    }
  }, [isVisible]);

  return (
    <div ref={sectionRef} className="relative bg-black py-24 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(203, 96, 21, 0.1) 35px, rgba(203, 96, 21, 0.1) 70px)`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Environmental Commitment
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Every purchase contributes to reforestation efforts worldwide. Together, we're building a sustainable future.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Trees Planted */}
          <div className={`bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#CB6015]/10 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#CB6015]" />
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Impact</span>
            </div>
            <h3 className="text-4xl font-bold text-white mb-2">{treesPlanted.toLocaleString()}</h3>
            <p className="text-gray-400">Trees Planted</p>
            <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full bg-[#CB6015] rounded-full transition-all duration-1000 ${isVisible ? 'w-3/4' : 'w-0'}`}></div>
            </div>
          </div>

          {/* CO2 Offset */}
          <div className={`bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#CB6015]/10 rounded-xl flex items-center justify-center">
                <Wind className="w-6 h-6 text-[#CB6015]" />
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Reduction</span>
            </div>
            <h3 className="text-4xl font-bold text-white mb-2">{co2Offset} tons</h3>
            <p className="text-gray-400">CO₂ Offset</p>
            <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full bg-[#CB6015] rounded-full transition-all duration-1000 delay-100 ${isVisible ? 'w-2/3' : 'w-0'}`}></div>
            </div>
          </div>

          {/* Forest Partners */}
          <div className={`bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#CB6015]/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-[#CB6015]" />
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Network</span>
            </div>
            <h3 className="text-4xl font-bold text-white mb-2">{forestsPartners}</h3>
            <p className="text-gray-400">Forest Partners</p>
            <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full bg-[#CB6015] rounded-full transition-all duration-1000 delay-200 ${isVisible ? 'w-1/2' : 'w-0'}`}></div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#CB6015]"></div>
            <span className="text-[#CB6015] font-medium">One Tree Per Order</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#CB6015]"></div>
          </div>
          
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            We partner with certified reforestation organizations to ensure every tree planted makes a real impact on our planet's future.
          </p>
          
          <button className="bg-[#CB6015] hover:bg-[#a04d11] text-white font-medium py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#CB6015]/20">
            Learn About Our Initiative
          </button>
        </div>
      </div>

    </div>
  );
};

export default GrowingTogether;