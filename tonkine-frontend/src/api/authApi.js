import client from './client';

export const authApi = {
  /** POST /api/auth/connexion */
  connecter: (email, motDePasse) =>
    client.post('/auth/connexion', { email, motDePasse }),

  /** POST /api/auth/inscription */
  inscrire: (inscriptionData) =>
    client.post('/auth/inscription', inscriptionData),

  /** GET /api/auth/entreprises — liste publique pour le formulaire d'inscription */
  getEntreprises: () =>
    client.get('/auth/entreprises'),
};
