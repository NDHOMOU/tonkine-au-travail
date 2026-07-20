import client from './client';

export const dashboardApi = {
  /** GET /api/dashboard/employe — données complètes du tableau de bord */
  getDashboardEmploye: () =>
    client.get('/dashboard/employe'),

  /** GET /api/admin/dashboard — vue RH complète */
  getDashboardAdmin: () =>
    client.get('/admin/dashboard'),
};
