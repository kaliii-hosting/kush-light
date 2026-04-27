import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import WholesaleLogin from '../pages/WholesaleLogin';

const WholesaleProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);

  // First check if user is logged in
  if (!user) {
    // Redirect to account page for login
    return <Navigate to="/account" replace />;
  }

  // Then check if PIN is entered
  if (!isPinAuthenticated) {
    return <WholesaleLogin onSuccess={() => setIsPinAuthenticated(true)} />;
  }

  return children;
};

export default WholesaleProtectedRoute;