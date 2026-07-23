import client from './client';

export const authApi = {
  /** POST /api/auth/connexion — code2FA fourni uniquement au 2e appel si requiert2FA */
  connecter: (email, motDePasse, code2FA) =>
    client.post('/auth/connexion', { email, motDePasse, code2FA }),

  /** POST /api/auth/inscription */
  inscrire: (inscriptionData) =>
    client.post('/auth/inscription', inscriptionData),

  /** GET /api/auth/entreprises — liste publique pour le formulaire d'inscription */
  getEntreprises: () =>
    client.get('/auth/entreprises'),
};
