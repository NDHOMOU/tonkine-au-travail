/**
 * ProtectedRoute — Garde de navigation React Router
 * Redirige vers /connexion si non authentifié.
 * Redirige vers la page d'accueil si le rôle requis ne correspond pas.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth }          from '../../context/AuthContext';

export default function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Redirige vers le bon dashboard selon le rôle réel
    const redirect =
      role === 'ADMIN_RH'         ? '/admin/dashboard' :
      role === 'KINESITHERAPEUTE' ? '/kine/dashboard'  :
                                    '/employe/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
