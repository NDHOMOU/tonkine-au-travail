import client from './client';

export const ergonomieApi = {
  /** POST /api/ergonomie/evaluer-poste */
  evaluerPoste: (payload) =>
    client.post('/ergonomie/evaluer-poste', payload),
};
