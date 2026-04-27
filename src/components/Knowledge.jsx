import { BookOpen } from 'lucide-react';
import LazyVideo from './LazyVideo';

const Knowledge = () => {
  return (
    <section className="py-[131px] lg:py-[200px] bg-black">
      <div className="max-w-[1312px] mx-auto px-5 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left content - Video/Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-[20px] overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800">
                <LazyVideo
                  src="https://huly.io/videos/knowledge-video.mp4"
                  poster="https://huly.io/images/knowledge-preview.jpg"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  threshold={0.1}
                  rootMargin="50px"
                />
              </div>
            </div>
            {/* Gradient blur effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-huly-blue/20 to-green-500/20 blur-3xl opacity-50 -z-10" />
          </div>

          {/* Right content */}
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-8 h-8 text-white" />
              <span className="text-green-400 text-[14px] font-medium uppercase tracking-wide">Documentation</span>
            </div>
            <h2 className="font-title text-[36px] md:text-[48px] lg:text-[60px] leading-[1.1] text-white mb-6">
              Knowledge at<br />
              Your Fingertips
            </h2>
            <p className="text-huly-text-light text-[15px] md:text-[18px] leading-relaxed mb-8">
              Create, organize, and share knowledge effortlessly. From project documentation to team wikis, everything is interconnected and instantly searchable.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-[32px] font-bold text-white mb-2">100%</div>
                <div className="text-huly-text-light text-[14px]">Searchable content</div>
              </div>
              <div>
                <div className="text-[32px] font-bold text-white mb-2">Real-time</div>
                <div className="text-huly-text-light text-[14px]">Collaborative editing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Knowledge;