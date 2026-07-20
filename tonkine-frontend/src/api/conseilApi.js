import client from './client';

export const conseilApi = {
  /** POST /api/conseils — l'employé pose une question */
  poserQuestion: (data) =>
    client.post('/conseils', data),

  /** GET /api/conseils/mes-conseils — historique employé */
  getMesConseils: () =>
    client.get('/conseils/mes-conseils'),

  /** GET /api/conseils/file — file d'attente du kiné */
  getFileKine: () =>
    client.get('/conseils/file'),

  /** PUT /api/conseils/:id/vu */
  marquerVu: (id) =>
    client.put(`/conseils/${id}/vu`),

  /** POST /api/conseils/:id/reponse */
  repondre: (id, reponse) =>
    client.post(`/conseils/${id}/reponse`, { reponse }),
};
