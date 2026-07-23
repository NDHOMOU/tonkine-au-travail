import client from './client';

export const adminApi = {
  /** GET /api/admin/dashboard */
  getDashboard: () =>
    client.get('/admin/dashboard'),

  /** POST /api/admin/alertes/collective */
  envoyerAlerteCollective: (message) =>
    client.post(`/admin/alertes/collective?message=${encodeURIComponent(message)}`),

  /** GET /api/admin/comptes-admin */
  listerComptesAdmin: () =>
    client.get('/admin/comptes-admin'),

  /** POST /api/admin/comptes-admin */
  creerCompteAdmin: (prenom, nom, email) =>
    client.post('/admin/comptes-admin', { prenom, nom, email }),

  /** POST /api/admin/utilisateurs/{id}/reset-password */
  reinitialiserMotDePasse: (userId) =>
    client.post(`/admin/utilisateurs/${userId}/reset-password`),

  /** GET /api/admin/entreprise */
  getEntreprise: () =>
    client.get('/admin/entreprise'),

  /** PUT /api/admin/entreprise */
  mettreAJourEntreprise: (entreprise) =>
    client.put('/admin/entreprise', entreprise),

  /** GET /api/admin/journal-connexions */
  getJournalConnexions: () =>
    client.get('/admin/journal-connexions'),

  /** GET /api/admin/journal-audit */
  getJournalAudit: () =>
    client.get('/admin/journal-audit'),

  /** GET /api/admin/rapports/hebdomadaire — fichier CSV */
  telechargerRapportHebdomadaire: () =>
    client.get('/admin/rapports/hebdomadaire', { responseType: 'blob' }),
};
