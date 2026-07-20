import client from './client';

export const adminApi = {
  /** GET /api/admin/dashboard */
  getDashboard: () =>
    client.get('/admin/dashboard'),

  /** POST /api/admin/alertes/collective */
  envoyerAlerteCollective: (message) =>
    client.post(`/admin/alertes/collective?message=${encodeURIComponent(message)}`),
};
