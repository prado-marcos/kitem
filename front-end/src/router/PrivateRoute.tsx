import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  children: ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  console.log("🚀 ~ PrivateRoute ~ isAuthenticated:", isAuthenticated);

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default PrivateRoute;