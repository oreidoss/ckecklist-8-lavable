
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  element: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  element, 
  requireAdmin = false 
}) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires admin access and user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{element}</>;
};
