/**
 * GestionComptesAdmin — Créer d'autres comptes Admin RH, réinitialiser un
 * mot de passe, supprimer un compte (test/doublon).
 */
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import AppLayout     from '../../components/layout/AppLayout';
import toast          from 'react-hot-toast';

export default function GestionComptesAdmin() {
  const [comptesAdmin, setComptesAdmin]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showFormAdmin, setShowFormAdmin]   = useState(false);
  const [formAdmin, setFormAdmin]           = useState({ prenom:'', nom:'', email:'' });
  const [creationEnCours, setCreationEnCours] = useState(false);
  const [reinitEnCours, setReinitEnCours]   = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(null);
  const [motDePasseRevele, setMotDePasseRevele] = useState(null);

  const charger = useCallback(async () => {
    try {
      const { data: comptes } = await adminApi.listerComptesAdmin();
      setComptesAdmin(comptes);
    } catch { toast.error('Impossible de charger les comptes admin.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const creerAdmin = async (e) => {
    e.preventDefault();
    if (!formAdmin.prenom.trim() || !formAdmin.nom.trim() || !formAdmin.email.trim()) {
      toast.error('Remplissez tous les champs.'); return;
    }
    setCreationEnCours(true);
    try {
      const { data: r } = await adminApi.creerCompteAdmin(formAdmin.prenom, formAdmin.nom, formAdmin.email);
      setMotDePasseRevele(r);
      setFormAdmin({ prenom:'', nom:'', email:'' });
      setShowFormAdmin(false);
      charger();
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Impossible de créer ce compte.');
    } finally {
      setCreationEnCours(false);
    }
  };

  const reinitialiserMotDePasse = async (compte) => {
    setReinitEnCours(compte.id);
    try {
      const { data: r } = await adminApi.reinitialiserMotDePasse(compte.id);
      setMotDePasseRevele(r);
      charger();
    } catch {
      toast.error('Impossible de réinitialiser ce mot de passe.');
    } finally {
      setReinitEnCours(null);
    }
  };

  const supprimerCompteAdmin = async (compte) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${compte.prenom} ${compte.nom} (${compte.email}) ?`)) return;
    setSuppressionEnCours(compte.id);
    try {
      await adminApi.supprimerCompteAdmin(compte.id);
      toast.success('Compte supprimé.');
      charger();
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Impossible de supprimer ce compte.');
    } finally {
      setSuppressionEnCours(null);
    }
  };

  if (loading) return <AppLayout title="Gestion des comptes admin"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Gestion des comptes admin">
      <div className="card">
        <div className="card-head" style={{ paddingBottom:0 }}>
          <h3>Comptes Admin RH</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowFormAdmin(v => !v)}>
            <i className="fa-solid fa-user-plus" /> Nouvel admin
          </button>
        </div>

        {showFormAdmin && (
          <form onSubmit={creerAdmin} style={{ padding:'16px 20px', borderBottom:'1px solid var(--ink-10, #eee)', display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
            <label style={{ flex:'1 1 140px' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Prénom</div>
              <input className="form-input" value={formAdmin.prenom}
                onChange={e => setFormAdmin(f => ({ ...f, prenom: e.target.value }))} required />
            </label>
            <label style={{ flex:'1 1 140px' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Nom</div>
              <input className="form-input" value={formAdmin.nom}
                onChange={e => setFormAdmin(f => ({ ...f, nom: e.target.value }))} required />
            </label>
            <label style={{ flex:'2 1 220px' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Email professionnel</div>
              <input className="form-input" type="email" value={formAdmin.email}
                onChange={e => setFormAdmin(f => ({ ...f, email: e.target.value }))} required />
            </label>
            <button className="btn btn-primary" disabled={creationEnCours} type="submit">
              {creationEnCours ? 'Création…' : 'Créer le compte'}
            </button>
          </form>
        )}

        <div style={{ padding:'8px 0 0' }}>
          {comptesAdmin.length === 0 ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-user-shield" />
              <p>Aucun autre compte admin pour l'instant.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Nom</th><th>Email</th><th>Statut</th><th></th></tr>
                </thead>
                <tbody>
                  {comptesAdmin.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight:600 }}>{c.prenom} {c.nom}</td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{c.email}</td>
                      <td>
                        <span className={`badge ${c.motDePasseTemporaire ? 'warn' : 'green'}`}>
                          {c.motDePasseTemporaire ? 'Mot de passe temporaire' : 'Actif'}
                        </span>
                      </td>
                      <td style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button className="btn btn-outline btn-sm"
                          disabled={reinitEnCours === c.id}
                          onClick={() => reinitialiserMotDePasse(c)}>
                          {reinitEnCours === c.id ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ color:'var(--danger, #C0392B)' }}
                          disabled={suppressionEnCours === c.id}
                          onClick={() => supprimerCompteAdmin(c)}>
                          {suppressionEnCours === c.id ? 'Suppression…' : 'Supprimer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {motDePasseRevele && (
        <div style={{ position:'fixed', inset:0, background:'rgba(20,20,30,.55)', display:'flex',
          alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <div className="card" style={{ maxWidth:440, width:'100%' }}>
            <div className="card-head"><h3>Mot de passe temporaire créé</h3></div>
            <div style={{ padding:'0 20px 20px' }}>
              <p style={{ fontSize:'.85rem', color:'var(--ink-60)', marginBottom:14 }}>
                Communiquez-le vous-même à <strong>{motDePasseRevele.email}</strong> — il ne sera
                plus jamais affiché après fermeture de cette fenêtre. La personne devra le
                changer dès sa première connexion.
              </p>
              <div style={{ background:'var(--sand)', borderRadius:8, padding:'12px 14px',
                fontFamily:'monospace', fontSize:'1rem', fontWeight:700, letterSpacing:'.5px',
                userSelect:'all', marginBottom:16, wordBreak:'break-all' }}>
                {motDePasseRevele.motDePasseTemporaire}
              </div>
              <button className="btn btn-primary" style={{ width:'100%' }}
                onClick={() => setMotDePasseRevele(null)}>
                J'ai noté le mot de passe, fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
