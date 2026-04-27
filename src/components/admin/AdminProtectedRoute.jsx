import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';

const AdminProtectedRoute = ({ children }) => {
  // Always require passcode - no bypass mode
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for authentication in sessionStorage (clears on browser close)
  useEffect(() => {
    // Clear old localStorage bypass flag if it exists
    localStorage.removeItem('adminBypass');

    const sessionAuth = sessionStorage.getItem('adminAuthenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Clear authentication on page unload to require passcode on every visit
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('adminAuthenticated');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => {
      // Set session authentication (clears on browser close)
      sessionStorage.setItem('adminAuthenticated', 'true');
      setIsAuthenticated(true);
    }} />;
  }

  return children;
};

export default AdminProtectedRoute;