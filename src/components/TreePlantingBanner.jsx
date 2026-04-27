import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { Leaf } from 'lucide-react';

const TreePlantingBanner = () => {
  return (
    <section className="bg-gradient-to-r from-emerald-900/20 via-green-900/30 to-emerald-900/20 py-12 md:py-16 lg:py-20 px-4 md:px-8 border-y border-green-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">

          {/* Image Section */}
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-start order-1 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
              <MediaPlaceholder kind="image" />
            </div>
          </div>

          {/* Content Section */}
          <div className="w-full lg:w-2/3 text-center lg:text-left order-2 lg:order-2">
            {/* Icon & Badge */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Leaf className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">
                Environmental Impact
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Every Purchase
              <span className="block text-green-400 mt-1">Plants a Tree</span>
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-300 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              We're committed to sustainability. For every product you purchase, we plant a tree to help restore our planet's forests and combat climate change. Together, we're making a difference—one tree at a time.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-xl mx-auto lg:mx-0">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-800/30">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">1:1</div>
                <div className="text-xs md:text-sm text-gray-400">Purchase to Tree Ratio</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-800/30">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">100%</div>
                <div className="text-xs md:text-sm text-gray-400">Carbon Offset</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-800/30 col-span-2 md:col-span-1">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">
                  <Leaf className="w-6 h-6 md:w-8 md:h-8 inline" />
                </div>
                <div className="text-xs md:text-sm text-gray-400">Sustainable Future</div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-400">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified Environmental Partner</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TreePlantingBanner;
