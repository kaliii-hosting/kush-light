import { Brain } from 'lucide-react';
import GlowingButton from './ui/GlowingButton';

const MetaBrain = () => {
  return (
    <section className="py-[131px] lg:py-[200px] bg-black">
      <div className="max-w-[1312px] mx-auto px-5 lg:px-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-huly-orange" />
            <span className="text-huly-orange text-[14px] font-medium uppercase tracking-wide">AI-Powered</span>
          </div>
          <h2 className="font-title text-[36px] md:text-[48px] lg:text-[60px] leading-[1.1] text-white mb-6">
            Huly MetaBrain
          </h2>
          <p className="text-huly-text-light text-[15px] md:text-[18px] leading-relaxed max-w-[700px] mx-auto">
            Your intelligent assistant that understands context, automates workflows, and helps your team work smarter, not harder.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[20px] p-8 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-huly-orange/20 rounded-full flex items-center justify-center mb-6">
              <div className="w-6 h-6 bg-huly-orange rounded-full" />
            </div>
            <h3 className="text-white text-[20px] font-semibold mb-3">Smart Automation</h3>
            <p className="text-huly-text-light text-[15px] leading-relaxed">
              Automate repetitive tasks and workflows with AI that learns from your team's patterns.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[20px] p-8 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-huly-orange/20 rounded-full flex items-center justify-center mb-6">
              <div className="w-6 h-6 bg-huly-orange rounded-full" />
            </div>
            <h3 className="text-white text-[20px] font-semibold mb-3">Context Understanding</h3>
            <p className="text-huly-text-light text-[15px] leading-relaxed">
              AI that understands your projects, documents, and conversations to provide relevant insights.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[20px] p-8 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-huly-orange/20 rounded-full flex items-center justify-center mb-6">
              <div className="w-6 h-6 bg-huly-orange rounded-full" />
            </div>
            <h3 className="text-white text-[20px] font-semibold mb-3">Intelligent Search</h3>
            <p className="text-huly-text-light text-[15px] leading-relaxed">
              Find anything across your workspace with natural language search powered by AI.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <GlowingButton
            onClick={() => window.location.href = '#learn-more'}
            className="text-[16px] font-medium"
          >
            Learn more about MetaBrain →
          </GlowingButton>
        </div>
      </div>
    </section>
  );
};

export default MetaBrain;