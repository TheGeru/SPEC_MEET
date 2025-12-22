import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false
}) => {
  const {
    isAuthenticated,
    isLoading,
    isAdmin
  } = useAuth();
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading...
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
export default ProtectedRoute;