import { useEffect, useState } from 'react';

const PerformanceMonitor = ({ showInProduction = false }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: null,
    loadTime: null
  });

  useEffect(() => {
    if (!showInProduction && process.env.NODE_ENV === 'production') {
      return;
    }

    // FPS Monitor
    let frameCount = 0;
    let lastTime = performance.now();
    let fpsInterval;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        setMetrics(prev => ({ ...prev, fps }));
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();

    // Memory Monitor (if available)
    if (performance.memory) {
      fpsInterval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576)
          }
        }));
      }, 1000);
    }

    // Page Load Time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    });

    return () => {
      if (fpsInterval) clearInterval(fpsInterval);
    };
  }, [showInProduction]);

  if (!showInProduction && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 backdrop-blur-sm">
      <div className="mb-1">FPS: {metrics.fps}</div>
      {metrics.memory && (
        <div className="mb-1">Memory: {metrics.memory.used}MB / {metrics.memory.total}MB</div>
      )}
      {metrics.loadTime && (
        <div>Load Time: {(metrics.loadTime / 1000).toFixed(2)}s</div>
      )}
    </div>
  );
};

export default PerformanceMonitor;