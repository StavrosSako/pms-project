import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a JWT token exists in local storage
    const token = localStorage.getItem('pms_token');
    
    if (token) {
      // For now, if a token exists, we consider them logged in.
      // Later, we can add an API call here to verify the token is still valid.
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // If no token exists, redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the protected content (Dashboard, Projects, etc.)
  return <Outlet />;
}