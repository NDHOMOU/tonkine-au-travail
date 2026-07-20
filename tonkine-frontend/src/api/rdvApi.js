import client from './client';

export const rdvApi = {
  /** GET /api/rdv/kine-info — infos du kiné de l'entreprise */
  getKineInfo: () =>
    client.get('/rdv/kine-info'),

  /** GET /api/rdv/creneaux-disponibles?date=YYYY-MM-DD */
  getCreneaux: (date) =>
    client.get('/rdv/creneaux-disponibles', { params: { date } }),

  /** POST /api/rdv/reserver */
  reserver: (data) =>
    client.post('/rdv/reserver', data),

  /** GET /api/rdv/mes-rdv */
  getMesRdv: () =>
    client.get('/rdv/mes-rdv'),

  /** DELETE /api/rdv/:id */
  annuler: (rdvId) =>
    client.delete(`/rdv/${rdvId}`),
};
