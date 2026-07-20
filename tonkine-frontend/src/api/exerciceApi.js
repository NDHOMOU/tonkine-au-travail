import client from './client';

export const exerciceApi = {
  /** GET /api/exercices */
  getExercices: (zone = null) =>
    client.get('/exercices', { params: zone ? { zone } : {} }),

  /** GET /api/exercices/personnalises — filtrés selon les hobbies du profil */
  getExercicesPersonnalises: () =>
    client.get('/exercices/personnalises'),
};
