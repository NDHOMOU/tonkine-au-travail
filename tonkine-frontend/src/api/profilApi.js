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

  /** PUT /api/profil/hobbies */
  mettreAJourHobbies: (hobbies) =>
    client.put('/profil/hobbies', { hobbies }),
};
