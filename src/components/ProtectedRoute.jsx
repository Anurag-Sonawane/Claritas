import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false, allowedRoles = null }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    // Not logged in, redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getDefaultPathForRole = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'faculty') return '/faculty';
    return '/';
  };

  // If specific roles are specified
  if (allowedRoles && Array.isArray(allowedRoles)) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={getDefaultPathForRole(user.role)} replace />;
    }
  } else if (requireAdmin && user.role !== 'admin') {
    // Legacy admin check
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  } else if (!allowedRoles && !requireAdmin && user.role !== 'student') {
    // Unspecified routes default to student view; divert non-students to their respective dashboards
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  }

  return children;
}
