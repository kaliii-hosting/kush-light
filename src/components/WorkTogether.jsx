import LazyVideo from './LazyVideo';

const WorkTogether = () => {
  return (
    <section className="py-[131px] lg:py-[200px] bg-black">
      <div className="max-w-[1312px] mx-auto px-5 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left content - Video/Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-[20px] overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800">
                <LazyVideo
                  src="https://huly.io/videos/collaborate-video.mp4"
                  poster="https://huly.io/images/collaborate-preview.jpg"
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
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-huly-blue/20 blur-3xl opacity-50 -z-10" />
          </div>

          {/* Right content */}
          <div className="order-1 lg:order-2">
            <h2 className="font-title text-[36px] md:text-[48px] lg:text-[60px] leading-[1.1] text-white mb-6">
              Work<br />
              Together
            </h2>
            <p className="text-huly-text-light text-[15px] md:text-[18px] leading-relaxed mb-8">
              Experience seamless collaboration with high-definition video conferencing, screen sharing, and virtual office spaces. See who's working on what in real-time and jump into conversations when needed.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-white/80 text-[14px]">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                HD Video Calls
              </div>
              <div className="flex items-center gap-2 text-white/80 text-[14px]">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                Screen Sharing
              </div>
              <div className="flex items-center gap-2 text-white/80 text-[14px]">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                Virtual Offices
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkTogether;