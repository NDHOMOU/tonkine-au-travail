import client from './client';

export const authApi = {
  /** POST /api/auth/connexion — code2FA fourni uniquement au 2e appel si requiert2FA */
  connecter: (email, motDePasse, code2FA) =>
    client.post('/auth/connexion', { email, motDePasse, code2FA }),

  /** POST /api/auth/inscription */
  inscrire: (inscriptionData) =>
    client.post('/auth/inscription', inscriptionData),

  /** POST /api/auth/inscrire-entreprise */
  inscrireEntreprise: (data) =>
    client.post('/auth/inscrire-entreprise', data),

  /** GET /api/auth/entreprises — liste publique pour le formulaire d'inscription */
  getEntreprises: () =>
    client.get('/auth/entreprises'),

  /** POST /api/auth/mot-de-passe-oublie */
  motDePasseOublie: (email) =>
    client.post('/auth/mot-de-passe-oublie', { email }),

  /** POST /api/auth/reinitialiser-mot-de-passe */
  reinitialiserMotDePasse: (jeton, nouveauMotDePasse) =>
    client.post('/auth/reinitialiser-mot-de-passe', { jeton, nouveauMotDePasse }),
};
