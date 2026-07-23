/** Déclenche le téléchargement d'un blob (réponse axios responseType:'blob') sous un nom donné. */
export function telechargerBlob(blob, nomFichier) {
  const url = window.URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.URL.revokeObjectURL(url);
}
