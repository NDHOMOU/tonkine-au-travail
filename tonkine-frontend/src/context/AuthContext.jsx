/**
 * AuthContext — Gestion globale de l'authentification
 *
 * Stocke le token JWT et les infos utilisateur dans localStorage.
 * Expose :  user, token, login(), logout(), isAuthenticated, role
 */
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('tonkine_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem('tonkine_token') || null
  );

  /** Appelé après connexion ou inscription réussie */
  const login = useCallback((authResponse) => {
    const { token: jwt, ...userInfo } = authResponse;
    localStorage.setItem('tonkine_token', jwt);
    localStorage.setItem('tonkine_user', JSON.stringify(userInfo));
    setToken(jwt);
    setUser(userInfo);
  }, []);

  /** Déconnexion : efface le stockage local */
  const logout = useCallback(() => {
    localStorage.removeItem('tonkine_token');
    localStorage.removeItem('tonkine_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    role: user?.role || null,
    isEmploye:  user?.role === 'EMPLOYE',
    isAdminRH:  user?.role === 'ADMIN_RH',
    isKine:     user?.role === 'KINESITHERAPEUTE',
    // Personnalisation entreprise (reçue à la connexion)
    nomApp:            user?.nomApp            || 'TonKiné au Travail',
    couleurPrimaire:   user?.couleurPrimaire   || '#1353A4',
    couleurSecondaire: user?.couleurSecondaire || '#0B9B8A',
    logoUrl:           user?.logoUrl           || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
