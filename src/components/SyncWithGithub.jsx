import { Github } from 'lucide-react';
import LazyVideo from './LazyVideo';

const SyncWithGithub = () => {
  return (
    <section className="py-[131px] lg:py-[200px] bg-black">
      <div className="max-w-[1312px] mx-auto px-5 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Github className="w-8 h-8 text-white" />
              <span className="text-huly-blue text-[14px] font-medium uppercase tracking-wide">GitHub Integration</span>
            </div>
            <h2 className="font-title text-[36px] md:text-[48px] lg:text-[60px] leading-[1.1] text-white mb-6">
              Sync with<br />
              GitHub
            </h2>
            <p className="text-huly-text-light text-[15px] md:text-[18px] leading-relaxed mb-8">
              Keep your code and project management in perfect harmony. Two-way synchronization means changes in GitHub automatically update in Huly, and vice versa.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-huly-blue/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-huly-blue rounded-full" />
                </div>
                <span className="text-white/80 text-[15px]">Automatic issue and PR synchronization</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-huly-blue/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-huly-blue rounded-full" />
                </div>
                <span className="text-white/80 text-[15px]">Real-time status updates</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-huly-blue/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-huly-blue rounded-full" />
                </div>
                <span className="text-white/80 text-[15px]">Link commits to tasks automatically</span>
              </li>
            </ul>
          </div>

          {/* Right content - Video/Image */}
          <div className="relative">
            <div className="relative rounded-[20px] overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800">
                <LazyVideo
                  src="https://huly.io/videos/github-sync-video.mp4"
                  poster="https://huly.io/images/github-sync-preview.jpg"
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
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-huly-blue/20 blur-3xl opacity-50 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SyncWithGithub;