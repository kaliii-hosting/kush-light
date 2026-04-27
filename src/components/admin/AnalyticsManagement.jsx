import { useState, useEffect, useMemo } from 'react';
import { ref, onValue, get, remove } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import GradientLoader from './GradientLoader';
import {
  BarChart3, Users, Globe, Clock, TrendingUp,
  MousePointer, Eye, ArrowUpRight, ArrowDownRight,
  MapPin, Monitor, Smartphone, Tablet, RefreshCw,
  Activity, Trash2
} from 'lucide-react';
import './Radar.css';

const AnalyticsManagement = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [todayStats, setTodayStats] = useState({ pageViews: 0, sessions: 0, uniqueVisitors: 0 });
  const [states, setStates] = useState([]);
  const [pages, setPages] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [totalStats, setTotalStats] = useState({ totalPageViews: 0, totalSessions: 0, totalVisitors: 0 });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('states'); // 'states', 'pages', or 'active'

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalytics = () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Listen to active visitors (real-time)
      const activeVisitorsRef = ref(realtimeDb, 'analytics/activeVisitors');
      const unsubActive = onValue(activeVisitorsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const now = Date.now();
          // Filter visitors active in the last 5 minutes
          const active = Object.entries(data)
            .map(([id, visitor]) => ({ id, ...visitor }))
            .filter(visitor => {
              const lastSeen = visitor.lastSeen;
              return lastSeen && (now - lastSeen) < 5 * 60 * 1000;
            });
          setActiveVisitors(active);
        } else {
          setActiveVisitors([]);
        }
      });

      // Listen to today's stats
      const dailyStatsRef = ref(realtimeDb, `analytics/dailyStats/${today}`);
      const unsubDaily = onValue(dailyStatsRef, (snapshot) => {
        if (snapshot.exists()) {
          setTodayStats(snapshot.val());
        } else {
          setTodayStats({ pageViews: 0, sessions: 0 });
        }
      });

      // Listen to unique visitors for today
      const uniqueVisitorsRef = ref(realtimeDb, `analytics/uniqueVisitors/${today}`);
      const unsubUnique = onValue(uniqueVisitorsRef, (snapshot) => {
        if (snapshot.exists()) {
          const count = Object.keys(snapshot.val()).length;
          setTodayStats(prev => ({ ...prev, uniqueVisitors: count }));
        }
      });

      // Listen to states/regions
      const statesRef = ref(realtimeDb, 'analytics/states');
      const unsubStates = onValue(statesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const stateList = Object.entries(data)
            .map(([key, info]) => ({ key, ...info }))
            .sort((a, b) => b.visits - a.visits);
          setStates(stateList);
        } else {
          setStates([]);
        }
      });

      // Listen to pages
      const pagesRef = ref(realtimeDb, 'analytics/pages');
      const unsubPages = onValue(pagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const pageList = Object.entries(data)
            .map(([key, info]) => ({ key, ...info }))
            .sort((a, b) => b.views - a.views);
          setPages(pageList);
        } else {
          setPages([]);
        }
      });

      // Listen to recent page views
      const pageViewsRef = ref(realtimeDb, 'analytics/pageViews');
      const unsubPageViews = onValue(pageViewsRef, (snapshot) => {
        setConnectionStatus('connected');
        setLastUpdate(new Date());
        if (snapshot.exists()) {
          const data = snapshot.val();
          const visits = Object.entries(data)
            .map(([id, visit]) => ({ id, ...visit }))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50); // Last 50 visits
          setRecentVisits(visits);

          // Calculate totals
          const total = Object.keys(data).length;
          setTotalStats(prev => ({ ...prev, totalPageViews: total }));
        } else {
          setRecentVisits([]);
        }
        setLoading(false);
      }, (error) => {
        console.error('Firebase connection error:', error);
        setConnectionStatus('error');
      });

      // Calculate total stats from daily stats
      const allDailyRef = ref(realtimeDb, 'analytics/dailyStats');
      const unsubAllDaily = onValue(allDailyRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let totalSessions = 0;
          Object.values(data).forEach(day => {
            totalSessions += day.sessions || 0;
          });
          setTotalStats(prev => ({ ...prev, totalSessions }));
        }
      });

      return () => {
        unsubActive();
        unsubDaily();
        unsubUnique();
        unsubStates();
        unsubPages();
        unsubPageViews();
        unsubAllDaily();
      };
    };

    const unsub = fetchAnalytics();
    return unsub;
  }, []);

  // Clear all analytics data
  const clearAnalytics = async () => {
    if (!confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) return;

    try {
      const analyticsRef = ref(realtimeDb, 'analytics');
      await remove(analyticsRef);
      alert('Analytics data cleared successfully');
    } catch (error) {
      console.error('Error clearing analytics:', error);
      alert('Failed to clear analytics data');
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Get device icon
  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  // Get flag emoji from country code
  const getFlagEmoji = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Generate unique color for visitor based on their number
  const getVisitorColor = (friendlyName) => {
    const colors = [
      'from-orange-500 to-red-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-purple-500 to-pink-500',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-blue-500',
      'from-teal-500 to-green-500',
      'from-red-500 to-pink-500',
      'from-cyan-500 to-blue-500',
    ];
    // Extract number from friendly name (e.g., "Friendswood Visitor 2" -> 2)
    const match = friendlyName?.match(/(\d+)$/);
    const num = match ? parseInt(match[1]) : 1;
    return colors[(num - 1) % colors.length];
  };

  // Generate radar dot positions for active visitors
  const radarDotPositions = useMemo(() => {
    const positions = [];
    activeVisitors.forEach((visitor, index) => {
      // Distribute dots around the radar (larger radius for bigger radar)
      const angle = (index * (360 / Math.max(activeVisitors.length, 1))) + (index * 45);
      const distance = 40 + (index % 3) * 30; // Vary distance from center
      const x = Math.cos((angle * Math.PI) / 180) * distance;
      const y = Math.sin((angle * Math.PI) / 180) * distance;
      positions.push({ x, y, visitor });
    });
    return positions;
  }, [activeVisitors]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Website Analytics</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-400">Real-time visitor tracking and insights</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className={`text-xs ${
                connectionStatus === 'connected' ? 'text-green-400' :
                connectionStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'error' ? 'Error' : 'Connecting...'}
              </span>
              {lastUpdate && (
                <span className="text-xs text-gray-500">
                  Updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLastRefresh(new Date())}
            className="flex items-center gap-2 bg-[#282828] hover:bg-[#333] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={clearAnalytics}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </button>
        </div>
      </div>

      {/* Stats Banner Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${todayStats.uniqueVisitors === 0 ? 'opacity-50' : ''}`}>
          <Users className={`w-8 h-8 mb-2 ${todayStats.uniqueVisitors > 0 ? 'text-blue-400' : 'text-gray-500'}`} />
          <p className={`text-2xl font-bold ${todayStats.uniqueVisitors > 0 ? 'text-blue-400' : 'text-gray-500'}`}>{todayStats.uniqueVisitors || 0}</p>
          <p className="text-gray-400 text-xs">Unique Visitors</p>
        </div>
        <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${todayStats.pageViews === 0 ? 'opacity-50' : ''}`}>
          <Eye className={`w-8 h-8 mb-2 ${todayStats.pageViews > 0 ? 'text-green-400' : 'text-gray-500'}`} />
          <p className={`text-2xl font-bold ${todayStats.pageViews > 0 ? 'text-green-400' : 'text-gray-500'}`}>{todayStats.pageViews || 0}</p>
          <p className="text-gray-400 text-xs">Page Views Today</p>
        </div>
        <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${todayStats.sessions === 0 ? 'opacity-50' : ''}`}>
          <TrendingUp className={`w-8 h-8 mb-2 ${todayStats.sessions > 0 ? 'text-purple-400' : 'text-gray-500'}`} />
          <p className={`text-2xl font-bold ${todayStats.sessions > 0 ? 'text-purple-400' : 'text-gray-500'}`}>{todayStats.sessions || 0}</p>
          <p className="text-gray-400 text-xs">Sessions Today</p>
        </div>
        <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${totalStats.totalPageViews === 0 ? 'opacity-50' : ''}`}>
          <BarChart3 className={`w-8 h-8 mb-2 ${totalStats.totalPageViews > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
          <p className={`text-2xl font-bold ${totalStats.totalPageViews > 0 ? 'text-orange-400' : 'text-gray-500'}`}>{totalStats.totalPageViews || 0}</p>
          <p className="text-gray-400 text-xs">Total Page Views</p>
        </div>
      </div>

      {/* Radar Section */}
      <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center justify-center">
          {/* Center - Radar */}
          <div className="radar-container flex-shrink-0">
            <div className="radar-wrapper">
              {/* Board with grid lines and circles */}
              <div className="radar-board">
                <div className="round round-sm"></div>
                <div className="round round-md"></div>
                <div className="round round-lg"></div>
                <div className="line line-x"></div>
                <div className="line line-y"></div>
              </div>
              {/* Rotating radar sweep */}
              <div className="radar-sweep"></div>
              {/* Radar dots for active visitors */}
              {radarDotPositions.map((pos, index) => (
                <div
                  key={index}
                  className="radar-dot"
                  style={{
                    left: `calc(50% + ${pos.x}px)`,
                    top: `calc(50% + ${pos.y}px)`,
                    transform: 'translate(-50%, -50%)',
                    animationDelay: `${index * 0.3}s`
                  }}
                  title={pos.visitor.friendlyName || 'Visitor'}
                />
              ))}
              {/* Center dot */}
              <div className="radar-center-dot"></div>
            </div>
          </div>
        </div>

        {/* Active Users Label */}
        <div className="text-center mt-4">
          <span className="text-green-400 font-semibold">{activeVisitors.length}</span>
          <span className="text-gray-400 ml-2">Active Users Online</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Visitors */}
        <div className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-primary" />
              Recent Visitors
            </h2>
            <span className="text-gray-500 text-sm">{recentVisits.length} visits</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <GradientLoader />
            ) : recentVisits.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No visitors recorded yet</p>
                <p className="text-sm mt-1">Visit your website to start tracking</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#282828] text-gray-400 text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">Visitor</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Page</th>
                    <th className="px-4 py-3 text-left">Device</th>
                    <th className="px-4 py-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {recentVisits.map((visit, index) => (
                    <tr key={visit.id || index} className="hover:bg-[#282828] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 bg-gradient-to-br ${getVisitorColor(visit.friendlyName)} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                            {visit.friendlyName?.split(' ').pop() || visit.visitorId?.slice(-2).toUpperCase() || '??'}
                          </div>
                          <span className="text-gray-300 text-sm font-medium">{visit.friendlyName || 'Anonymous Visitor'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFlagEmoji(visit.location?.countryCode)}</span>
                          <div>
                            <p className="text-white text-sm">{visit.location?.city || 'Unknown'}</p>
                            <p className="text-gray-500 text-xs">{visit.location?.country || 'Unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300 text-sm bg-[#333] px-2 py-1 rounded">
                          {visit.page || '/'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-400">
                          {getDeviceIcon(visit.device)}
                          <span className="text-sm">{visit.browser}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {formatDate(visit.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top States / Pages / Active Users with Toggle */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              {activeTab === 'states' && <MapPin className="w-5 h-5 text-primary" />}
              {activeTab === 'pages' && <Eye className="w-5 h-5 text-primary" />}
              {activeTab === 'active' && <Activity className="w-5 h-5 text-green-400" />}
              {activeTab === 'states' && 'Top States'}
              {activeTab === 'pages' && 'Top Pages'}
              {activeTab === 'active' && (
                <>
                  Active Users
                  {activeVisitors.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {activeVisitors.length} online
                    </span>
                  )}
                </>
              )}
            </h2>
            {/* Toggle Button */}
            <div className="flex bg-[#282828] rounded-lg p-1">
              <button
                onClick={() => setActiveTab('states')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'states'
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                States
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'pages'
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Pages
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'active'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Active
              </button>
            </div>
          </div>
          <div className="p-4 max-h-[350px] overflow-y-auto">
            {activeTab === 'states' && (
              // States View
              states.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No state data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {states.slice(0, 10).map((state, index) => (
                    <div key={state.key || index} className="flex items-center justify-between p-3 bg-[#282828] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-white">{state.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">{state.visits}</span>
                        <span className="text-gray-500 text-sm">visits</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {activeTab === 'pages' && (
              // Pages View
              pages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No page data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pages.slice(0, 10).map((page, index) => (
                    <div key={page.key || index} className="flex items-center justify-between p-3 bg-[#282828] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Eye className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-white">{page.path || '/' + page.key}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">{page.views}</span>
                        <span className="text-gray-500 text-sm">views</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {activeTab === 'active' && (
              // Active Users View
              activeVisitors.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active users right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeVisitors.map((visitor, index) => (
                    <div key={visitor.id || index} className="flex items-center justify-between p-3 bg-[#282828] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getVisitorColor(visitor.friendlyName)} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                            {visitor.friendlyName?.split(' ').pop() || '?'}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#282828] animate-pulse"></div>
                        </div>
                        <div>
                          <span className="text-white font-medium">{visitor.friendlyName || 'Unknown Visitor'}</span>
                          <p className="text-gray-500 text-xs">{visitor.page || '/'} • {visitor.browser}</p>
                        </div>
                      </div>
                      <span className="text-lg">{getFlagEmoji(visitor.location?.countryCode)}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsManagement;
