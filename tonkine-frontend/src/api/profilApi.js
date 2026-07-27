import client from './client';

export const profilApi = {
  /** GET /api/profil/mon-profil */
  getMonProfil: () =>
    client.get('/profil/mon-profil'),

  /** POST /api/profil/photos — upload multipart (4 photos posture) */
  uploadPhoto: (vue, fichier) => {
    const form = new FormData();
    form.append('vue', vue);
    form.append('fichier', fichier);
    return client.post('/profil/photos', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** PUT /api/profil/ergonomique */
  mettreAJourProfil: (profil) =>
    client.put('/profil/ergonomique', profil),

  /** PUT /api/profil/mot-de-passe */
  changerMotDePasse: (ancienMotDePasse, nouveauMotDePasse) =>
    client.put('/profil/mot-de-passe', { ancienMotDePasse, nouveauMotDePasse }),

  /** PUT /api/profil/avatar — photo de profil (identification professionnelle) */
  mettreAJourAvatar: (photoBase64) =>
    client.put('/profil/avatar', { photoBase64 }),

  /** POST /api/profil/2fa/activer */
  activerDeuxFA: () =>
    client.post('/profil/2fa/activer'),

  /** POST /api/profil/2fa/confirmer */
  confirmerDeuxFA: (code) =>
    client.post('/profil/2fa/confirmer', { code }),

  /** POST /api/profil/2fa/desactiver */
  desactiverDeuxFA: () =>
    client.post('/profil/2fa/desactiver'),
};
