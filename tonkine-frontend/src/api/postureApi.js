import client from './client';

export const postureApi = {
  /** POST /api/posture/mesure — envoie une mesure TensorFlow.js */
  envoyerMesure: (mesure) =>
    client.post('/posture/mesure', mesure),

  /** POST /api/posture/alertes/:id/pause-confirmee */
  confirmerPause: (alerteId) =>
    client.post(`/posture/alertes/${alerteId}/pause-confirmee`),

  /** POST /api/posture/alertes/:id/snooze */
  snoozer: (alerteId, delaiSecondes = 600) =>
    client.post(`/posture/alertes/${alerteId}/snooze?delaiSecondes=${delaiSecondes}`),

  /** POST /api/posture/session/fermer */
  fermerSession: (sessionId) =>
    client.post(`/posture/session/fermer?sessionId=${sessionId}`),

  /**
   * POST /api/posture/alertes/surveillance-indisponible
   * Signale à l'admin/kiné que la surveillance posturale n'a pas pu démarrer
   * (webcam refusée/absente, modèle de détection non chargé...).
   * sessionId peut être null si aucune session n'est encore ouverte.
   */
  signalerIndisponible: (sessionId, motif) =>
    client.post('/posture/alertes/surveillance-indisponible', { sessionId, motif }),
};
