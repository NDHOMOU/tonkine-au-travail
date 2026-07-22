/**
 * Client Axios centralisé — TonKiné au Travail
 *
 * Toutes les requêtes vers le backend Java Spring Boot passent ici.
 * - Injecte automatiquement le JWT dans chaque requête
 * - Redirige vers /connexion si le token expire (401)
 * - Aucune donnée hardcodée : tout vient de l'API
 */
import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  // 60s : le backend gratuit (Render) peut mettre jusqu'à 50s à se réveiller
  // après une période d'inactivité (spin-down du plan gratuit).
  timeout: 60000,
});

// ── Intercepteur requête : ajoute le token JWT ──
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tonkine_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Intercepteur réponse : gestion des erreurs globales ──
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide → déconnexion propre avec message
      const estDejaConnexion = window.location.pathname === '/connexion';
      if (!estDejaConnexion) {
        localStorage.removeItem('tonkine_token');
        localStorage.removeItem('tonkine_user');
        // Petit délai pour laisser react-hot-toast s'afficher avant la redirection
        import('react-hot-toast').then(({ default: toast }) => {
          toast.error('Votre session a expiré. Reconnectez-vous.', { duration: 3000 });
          setTimeout(() => { window.location.href = '/connexion'; }, 1500);
        }).catch(() => {
          window.location.href = '/connexion';
        });
      }
    }
    return Promise.reject(error);
  }
);

export default client;
