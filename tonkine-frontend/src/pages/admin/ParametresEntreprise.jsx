/**
 * ParametresEntreprise — Personnalisation de l'entreprise (Admin RH)
 * Nom, logo, couleurs, coordonnées — propre à chaque entreprise cliente.
 */
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import AppLayout     from '../../components/layout/AppLayout';
import toast          from 'react-hot-toast';

export default function ParametresEntreprise() {
  const [entreprise, setEntreprise]           = useState(null);
  const [entrepriseModif, setEntrepriseModif] = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data } = await adminApi.getEntreprise();
      setEntreprise(data);
      setEntrepriseModif(data);
    } catch { toast.error('Impossible de charger les paramètres de l\'entreprise.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const sauvegarder = async (e) => {
    e.preventDefault();
    setSauvegardeEnCours(true);
    try {
      const { data } = await adminApi.mettreAJourEntreprise(entrepriseModif);
      setEntreprise(data);
      setEntrepriseModif(data);
      toast.success('Paramètres de l\'entreprise mis à jour.');
    } catch {
      toast.error('Impossible d\'enregistrer les paramètres.');
    } finally {
      setSauvegardeEnCours(false);
    }
  };

  if (loading) return <AppLayout title="Paramètres de l'entreprise"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Paramètres de l'entreprise">
      <div className="card">
        <div className="card-head"><h3>Personnalisation</h3></div>
        {entrepriseModif && (
          <form onSubmit={sauvegarder} style={{ padding:'0 20px 20px', display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:14 }}>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Nom de l'entreprise</div>
              <input className="form-input" value={entrepriseModif.nom || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, nom: e.target.value }))} required />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Nom affiché de l'application</div>
              <input className="form-input" value={entrepriseModif.nomApp || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, nomApp: e.target.value }))} />
            </label>
            <label style={{ gridColumn:'1 / -1' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Slogan</div>
              <input className="form-input" value={entrepriseModif.slogan || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, slogan: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>URL du logo</div>
              <input className="form-input" value={entrepriseModif.logoUrl || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, logoUrl: e.target.value }))} placeholder="https://…" />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Secteur d'activité</div>
              <input className="form-input" value={entrepriseModif.secteurActivite || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, secteurActivite: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Couleur primaire</div>
              <input className="form-input" type="color" style={{ height:40, padding:4 }}
                value={entrepriseModif.couleurPrimaire || '#1353A4'}
                onChange={e => setEntrepriseModif(v => ({ ...v, couleurPrimaire: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Couleur secondaire</div>
              <input className="form-input" type="color" style={{ height:40, padding:4 }}
                value={entrepriseModif.couleurSecondaire || '#0B9B8A'}
                onChange={e => setEntrepriseModif(v => ({ ...v, couleurSecondaire: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Ville</div>
              <input className="form-input" value={entrepriseModif.ville || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, ville: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Pays</div>
              <input className="form-input" value={entrepriseModif.pays || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, pays: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Téléphone</div>
              <input className="form-input" value={entrepriseModif.telephone || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, telephone: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Email de contact</div>
              <input className="form-input" type="email" value={entrepriseModif.emailContact || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, emailContact: e.target.value }))} />
            </label>
            <div style={{ gridColumn:'1 / -1' }}>
              <button className="btn btn-primary" disabled={sauvegardeEnCours} type="submit">
                {sauvegardeEnCours ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
