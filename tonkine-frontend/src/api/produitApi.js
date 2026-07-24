import client from './client';

export const produitApi = {
  /** GET /api/produits — recommandations de l'entreprise de l'employé connecté */
  getProduits: () =>
    client.get('/produits'),
};
