import { useEffect, useRef } from 'react';
import { ref, push, set, get, update, serverTimestamp } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { useLocation } from 'react-router-dom';

// Generate a unique visitor ID
const getVisitorId = () => {
  try {
    let visitorId = localStorage.getItem('kushie_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('kushie_visitor_id', visitorId);
    }
    return visitorId;
  } catch (e) {
    return 'v_' + Date.now();
  }
};

// Get session ID
const getSessionId = () => {
  try {
    const lastActivity = localStorage.getItem('kushie_last_activity');
    const currentSession = localStorage.getItem('kushie_session_id');
    const now = Date.now();

    if (!lastActivity || !currentSession || (now - parseInt(lastActivity)) > 30 * 60 * 1000) {
      const newSession = 's_' + Date.now();
      localStorage.setItem('kushie_session_id', newSession);
      localStorage.setItem('kushie_last_activity', now.toString());
      return { sessionId: newSession, isNewSession: true };
    }

    localStorage.setItem('kushie_last_activity', now.toString());
    return { sessionId: currentSession, isNewSession: false };
  } catch (e) {
    return { sessionId: 's_' + Date.now(), isNewSession: true };
  }
};

// Fetch visitor location from IP
const fetchVisitorLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.error && data.country_name) {
        return {
          ip: data.ip || 'unknown',
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || 'XX',
          region: data.region || '',
          city: data.city || 'Unknown',
        };
      }
    }
  } catch (error) {
    console.log('Location fetch failed, using default');
  }

  // Return default location if API fails
  return {
    ip: 'unknown',
    country: 'Unknown',
    countryCode: 'XX',
    region: '',
    city: 'Unknown'
  };
};

// Get device info
const getDeviceInfo = () => {
  const ua = navigator.userAgent || '';
  let device = 'Desktop';
  let browser = 'Unknown';

  if (/Mobi|Android/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  return { device, browser };
};

const useVisitorTracking = () => {
  const location = useLocation();
  const lastTrackedRef = useRef({});

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    const currentPath = location.pathname;
    const now = Date.now();

    // Prevent duplicate tracking for same path within 30 seconds
    const lastTrackedTime = lastTrackedRef.current[currentPath] || 0;
    if (now - lastTrackedTime < 30000) {
      console.log('%c[Brand Analytics] Skipping (recently tracked):', 'color: #888;', currentPath);
      return;
    }

    // Mark as tracking now
    lastTrackedRef.current[currentPath] = now;

    const trackVisit = async () => {
      console.log('%c[Brand Analytics] Starting tracking for:', 'color: #00ff00; font-weight: bold;', currentPath);

      try {
        const visitorId = getVisitorId();
        const { sessionId, isNewSession } = getSessionId();
        const deviceInfo = getDeviceInfo();
        const page = currentPath || '/';
        const timestamp = Date.now();
        const today = new Date().toISOString().split('T')[0];

        console.log('%c[Brand Analytics] Visitor ID:', 'color: #00bfff;', visitorId);
        console.log('%c[Brand Analytics] Session:', 'color: #00bfff;', sessionId, isNewSession ? '(NEW)' : '(existing)');

        // Fetch location
        console.log('%c[Brand Analytics] Fetching location...', 'color: #ffff00;');
        const locationData = await fetchVisitorLocation();
        console.log('%c[Brand Analytics] Location:', 'color: #00bfff;', locationData.city, locationData.region, locationData.country);

        // Generate friendly name based on city (more specific than state)
        const city = locationData.city || locationData.region || locationData.country || 'Unknown';
        const cityKey = city.replace(/[.#$\[\]\/\s]/g, '_');

        // Get or create visitor number for this city
        let visitorNumber = 1;
        let friendlyName = `${city} Visitor 1`;

        try {
          const visitorCountRef = ref(realtimeDb, 'analytics/visitorCounts/' + cityKey);
          const existingNumberRef = ref(realtimeDb, 'analytics/visitorNumbers/' + visitorId);
          const existingNumber = await get(existingNumberRef);

          if (existingNumber.exists()) {
            // Use stored city name to keep consistency
            const storedCity = existingNumber.val().city || city;
            visitorNumber = existingNumber.val().number;
            friendlyName = `${storedCity} Visitor ${visitorNumber}`;
          } else {
            const countSnapshot = await get(visitorCountRef);
            visitorNumber = (countSnapshot.exists() ? countSnapshot.val() : 0) + 1;
            await set(visitorCountRef, visitorNumber);
            await set(existingNumberRef, { number: visitorNumber, city: city });
            friendlyName = `${city} Visitor ${visitorNumber}`;
          }
          console.log('%c[Brand Analytics] Friendly name:', 'color: #00bfff;', friendlyName);
        } catch (e) {
          console.warn('[Brand Analytics] Counter error:', e.message);
        }

        // Create visit record
        const visitData = {
          visitorId,
          sessionId,
          page,
          timestamp,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          referrer: document.referrer || 'direct',
          location: locationData,
          friendlyName: friendlyName
        };

        // 1. Log page view
        const pageViewsRef = ref(realtimeDb, 'analytics/pageViews');
        await push(pageViewsRef, visitData);

        // 2. Update active visitors
        const activeVisitorRef = ref(realtimeDb, 'analytics/activeVisitors/' + visitorId);
        await set(activeVisitorRef, {
          lastSeen: timestamp,
          page,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          location: locationData,
          friendlyName: friendlyName
        });

        // 3. Update daily stats
        const dailyStatsRef = ref(realtimeDb, 'analytics/dailyStats/' + today);
        const dailySnapshot = await get(dailyStatsRef);

        if (dailySnapshot.exists()) {
          const currentData = dailySnapshot.val();
          await set(dailyStatsRef, {
            pageViews: (currentData.pageViews || 0) + 1,
            sessions: isNewSession ? (currentData.sessions || 0) + 1 : (currentData.sessions || 0),
            date: today
          });
        } else {
          await set(dailyStatsRef, {
            pageViews: 1,
            sessions: 1,
            date: today
          });
        }

        // 4. Update unique visitors
        const uniqueVisitorRef = ref(realtimeDb, 'analytics/uniqueVisitors/' + today + '/' + visitorId);
        await set(uniqueVisitorRef, {
          firstSeen: timestamp,
          device: deviceInfo.device,
          location: locationData,
          friendlyName: friendlyName
        });

        // 5. Track by state/region (for USA visitors)
        if (locationData.region) {
          const stateKey = locationData.region.replace(/[.#$\[\]\/\s]/g, '_');
          const stateRef = ref(realtimeDb, 'analytics/states/' + stateKey);
          const stateSnapshot = await get(stateRef);
          if (stateSnapshot.exists()) {
            const stateData = stateSnapshot.val();
            await set(stateRef, {
              visits: (stateData.visits || 0) + 1,
              name: locationData.region,
              city: locationData.city || 'Unknown'
            });
          } else {
            await set(stateRef, {
              visits: 1,
              name: locationData.region,
              city: locationData.city || 'Unknown'
            });
          }
        }

        // 6. Track page views
        const safePageKey = page.replace(/[.#$\[\]\/]/g, '_') || 'home';
        const pageStatsRef = ref(realtimeDb, 'analytics/pages/' + safePageKey);
        const pageSnapshot = await get(pageStatsRef);
        if (pageSnapshot.exists()) {
          const pageData = pageSnapshot.val();
          await set(pageStatsRef, {
            views: (pageData.views || 0) + 1,
            path: page
          });
        } else {
          await set(pageStatsRef, {
            views: 1,
            path: page
          });
        }

        // Log success
        console.log('%c[Brand Analytics] ✓ Successfully tracked visit!', 'color: #00ff00; font-weight: bold;', {
          visitor: friendlyName,
          page: page,
          device: deviceInfo.device
        });

      } catch (error) {
        console.error('%c[Brand Analytics] ✗ Tracking failed:', 'color: #ff0000; font-weight: bold;', error.message);
      }
    };

    trackVisit();

  }, [location.pathname]);
};

export default useVisitorTracking;
