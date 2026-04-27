// Web Vitals monitoring for performance tracking

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Log web vitals to console in development
export const logWebVitals = () => {
  reportWebVitals((metric) => {
    console.log(`${metric.name}: ${metric.value.toFixed(2)}ms`);
    
    // You can also send these metrics to your analytics service
    // Example: sendToAnalytics(metric);
  });
};

// Check if the browser supports the Web Vitals API
export const supportsWebVitals = () => {
  return 'PerformanceObserver' in window && 
         'PerformancePaintTiming' in window &&
         'LayoutShift' in window;