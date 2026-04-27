const AboutCards = ({ aboutContent }) => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black">
      {aboutContent.map((item, index) => (
        <div 
          key={index}
          className="w-screen relative bg-gradient-to-b from-gray-900 to-black border-b border-gray-800 last:border-b-0"
        >
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
            {/* Article Header - matching blog post expanded view */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {item.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-8 border-b border-gray-800">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                  {item.subtitle}
                </span>
              </div>
            </div>

            {/* Article Content - matching blog post style */}
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg md:text-xl">
                {item.text}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AboutCards;