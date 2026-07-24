import client from './client';

export const kineApi = {
  /** GET /api/kine/dashboard */
  getDashboard: () =>
    client.get('/kine/dashboard'),

  /** GET /api/kine/patients/:id */
  getDetailPatient: (employeId) =>
    client.get(`/kine/patients/${employeId}`),

  /** POST /api/kine/rdv/:id/notes */
  ajouterNotes: (rdvId, notes) =>
    client.post(`/kine/rdv/${rdvId}/notes`, { notes }),

  /** GET /api/kine/rapports/hebdomadaire — fichier CSV */
  telechargerRapportHebdomadaire: () =>
    client.get('/kine/rapports/hebdomadaire', { responseType: 'blob' }),

  // ── Bibliothèque d'exercices ──
  listerExercices: () => client.get('/kine/exercices'),
  creerExercice: (data) => client.post('/kine/exercices', data),
  modifierExercice: (id, data) => client.put(`/kine/exercices/${id}`, data),
  retirerExercice: (id) => client.delete(`/kine/exercices/${id}`),

  // ── Protocoles curatifs ──
  listerProtocoles: () => client.get('/kine/protocoles'),
  creerProtocole: (data) => client.post('/kine/protocoles', data),
  modifierProtocole: (id, data) => client.put(`/kine/protocoles/${id}`, data),
  retirerProtocole: (id) => client.delete(`/kine/protocoles/${id}`),

  // ── Recommandations produits (orthèses...) ──
  listerProduits: () => client.get('/kine/produits'),
  creerProduit: (data) => client.post('/kine/produits', data),
  modifierProduit: (id, data) => client.put(`/kine/produits/${id}`, data),
  retirerProduit: (id) => client.delete(`/kine/produits/${id}`),
};
