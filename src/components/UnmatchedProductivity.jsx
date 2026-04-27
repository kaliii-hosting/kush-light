import LazyVideo from './LazyVideo';

const UnmatchedProductivity = () => {
  const features = [
    {
      title: "Tasks, Projects, Docs, and Teams",
      description: "Everything your team needs to function — tasks, projects, documentation, and chat — all in one place."
    },
    {
      title: "Bidirectional GitHub Sync",
      description: "Native two-way synchronization with GitHub ensures your code and project management stay perfectly aligned."
    },
    {
      title: "Real-time Collaboration",
      description: "Work together seamlessly with instant updates, live presence indicators, and collaborative editing."
    }
  ];

  return (
    <section className="py-[131px] lg:py-[200px] bg-black">
      <div className="max-w-[1312px] mx-auto px-5 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left content */}
          <div>
            <h2 className="font-title text-[36px] md:text-[48px] lg:text-[60px] leading-[1.1] text-white mb-8">
              Unmatched<br />
              Productivity
            </h2>
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <h3 className="text-white text-[18px] font-semibold mb-2 group-hover:text-huly-blue transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-huly-text-light text-[15px] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Video/Image */}
          <div className="relative">
            <div className="relative rounded-[20px] overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800">
                <LazyVideo
                  src="https://huly.io/videos/productivity-video.mp4"
                  poster="https://huly.io/images/productivity-preview.jpg"
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
            <div className="absolute -inset-4 bg-gradient-to-r from-huly-blue/20 to-purple-500/20 blur-3xl opacity-50 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnmatchedProductivity;