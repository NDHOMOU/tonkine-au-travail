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
};
