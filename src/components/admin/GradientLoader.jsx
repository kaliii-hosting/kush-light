const GradientLoader = () => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Gradient Loader Bar at top */}
      <div className="relative w-full h-5 bg-white">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #fb0094, #0000ff, #00ff00, #ffff00, #fb0094, #0000ff, #00ff00, #ffff00, #fb0094)',
            backgroundSize: '500%',
            animation: 'gradientMove 10s linear infinite'
          }}
        />
        {/* Reflection effect */}
        <div
          className="absolute top-full left-0 right-0 h-5"
          style={{
            background: 'linear-gradient(90deg, #fb0094, #0000ff, #00ff00, #ffff00, #fb0094, #0000ff, #00ff00, #ffff00, #fb0094)',
            backgroundSize: '500%',
            animation: 'gradientMove 10s linear infinite',
            opacity: 0.3,
            transform: 'scaleY(-1)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)'
          }}
        />
      </div>

      {/* Keyframes style */}
      <style>{`
        @keyframes gradientMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 500% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GradientLoader;
