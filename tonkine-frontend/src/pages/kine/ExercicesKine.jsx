/**
 * ExercicesKine — Bibliothèque d'exercices ergonomiques / étirements
 * Le kiné ajoute ici son propre contenu (en plus de la bibliothèque globale),
 * visible immédiatement par tous les employés de son entreprise.
 */
import { useState, useEffect, useCallback } from 'react';
import { kineApi } from '../../api/kineApi';
import AppLayout    from '../../components/layout/AppLayout';
import toast         from 'react-hot-toast';

const ZONES = [
  { value:'DOS_LOMBAIRES',       label:'Dos / Lombaires'       },
  { value:'NUQUE_CERVICALES',    label:'Nuque / Cervicales'    },
  { value:'EPAULES',             label:'Épaules'               },
  { value:'POIGNETS_AVANT_BRAS', label:'Poignets / Avant-bras' },
  { value:'HANCHES_BASSIN',      label:'Hanches / Bassin'      },
  { value:'YEUX_VISION',         label:'Yeux / Vision'         },
];

const FORM_VIDE = {
  titre:'', description:'', zone:'DOS_LOMBAIRES', dureeMinutes:5,
  frequenceRecommandee:'', niveauDifficulte:1, hobbiesAssocies:'',
  urlVideo:'', urlImage:'',
};

export default function ExercicesKine() {
  const [exercices, setExercices] = useState([]);
  const [loading,    setLoading]  = useState(true);
  const [showForm,   setShowForm] = useState(false);
  const [editId,     setEditId]   = useState(null);
  const [form,        setForm]    = useState(FORM_VIDE);
  const [enCours,     setEnCours] = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data } = await kineApi.listerExercices();
      setExercices(data);
    } catch { toast.error('Impossible de charger la bibliothèque.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const ouvrirCreation = () => { setForm(FORM_VIDE); setEditId(null); setShowForm(true); };
  const ouvrirEdition = (ex) => {
    setForm({
      titre: ex.titre, description: ex.description, zone: ex.zone,
      dureeMinutes: ex.dureeMinutes, frequenceRecommandee: ex.frequenceRecommandee || '',
      niveauDifficulte: ex.niveauDifficulte, hobbiesAssocies: ex.hobbiesAssocies || '',
      urlVideo: ex.urlVideo || '', urlImage: ex.urlImage || '',
    });
    setEditId(ex.id);
    setShowForm(true);
  };

  const soumettre = async (e) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.description.trim()) {
      toast.error('Titre et description obligatoires.'); return;
    }
    setEnCours(true);
    try {
      if (editId) {
        await kineApi.modifierExercice(editId, form);
        toast.success('Exercice mis à jour.');
      } else {
        await kineApi.creerExercice(form);
        toast.success('Exercice ajouté à la bibliothèque.');
      }
      setShowForm(false);
      charger();
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Impossible d\'enregistrer cet exercice.');
    } finally {
      setEnCours(false);
    }
  };

  const retirer = async (ex) => {
    if (!window.confirm(`Retirer "${ex.titre}" de la bibliothèque ?`)) return;
    try {
      await kineApi.retirerExercice(ex.id);
      toast.success('Exercice retiré.');
      charger();
    } catch { toast.error('Impossible de retirer cet exercice.'); }
  };

  if (loading) return <AppLayout title="Bibliothèque d'exercices"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Bibliothèque d'exercices">
      <div className="card">
        <div className="card-head" style={{ paddingBottom:0 }}>
          <h3>Exercices ajoutés par vous ({exercices.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={ouvrirCreation}>
            <i className="fa-solid fa-plus" /> Nouvel exercice
          </button>
        </div>
        <p style={{ padding:'8px 20px 0', fontSize:'.78rem', color:'var(--ink-60)' }}>
          Vos employés voient aussi la bibliothèque globale de base — cette liste ne montre
          que le contenu que vous avez ajouté spécifiquement pour votre entreprise.
        </p>

        {showForm && (
          <form onSubmit={soumettre} style={{ padding:'16px 20px', borderTop:'1px solid var(--ink-10, #eee)',
            marginTop:12, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:14 }}>
            <label style={{ gridColumn:'1 / -1' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Titre *</div>
              <input className="form-input" value={form.titre}
                onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} required />
            </label>
            <label style={{ gridColumn:'1 / -1' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Description / instructions *</div>
              <textarea className="form-textarea" rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Zone du corps</div>
              <select className="form-select" value={form.zone}
                onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}>
                {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Durée (minutes)</div>
              <input className="form-input" type="number" min={1} value={form.dureeMinutes}
                onChange={e => setForm(f => ({ ...f, dureeMinutes: parseInt(e.target.value) || 1 }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Niveau de difficulté</div>
              <select className="form-select" value={form.niveauDifficulte}
                onChange={e => setForm(f => ({ ...f, niveauDifficulte: parseInt(e.target.value) }))}>
                <option value={1}>Facile</option>
                <option value={2}>Moyen</option>
                <option value={3}>Difficile</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Fréquence recommandée</div>
              <input className="form-input" value={form.frequenceRecommandee} placeholder="Ex : 2× / jour"
                onChange={e => setForm(f => ({ ...f, frequenceRecommandee: e.target.value }))} />
            </label>
            <label style={{ gridColumn:'1 / -1' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Lien vidéo (YouTube ou autre)</div>
              <input className="form-input" value={form.urlVideo} placeholder="https://youtube.com/watch?v=…"
                onChange={e => setForm(f => ({ ...f, urlVideo: e.target.value }))} />
            </label>
            <label style={{ gridColumn:'1 / -1' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Image de couverture (URL)</div>
              <input className="form-input" value={form.urlImage} placeholder="https://…"
                onChange={e => setForm(f => ({ ...f, urlImage: e.target.value }))} />
            </label>
            <div style={{ gridColumn:'1 / -1', display:'flex', gap:10 }}>
              <button className="btn btn-primary" disabled={enCours} type="submit">
                {enCours ? 'Enregistrement…' : editId ? 'Mettre à jour' : 'Ajouter à la bibliothèque'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        )}

        <div style={{ padding: showForm ? '20px 0 0' : '8px 0 0' }}>
          {exercices.length === 0 ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-dumbbell" />
              <p>Vous n'avez pas encore ajouté d'exercice propre à votre entreprise.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Titre</th><th>Zone</th><th>Durée</th><th>Niveau</th><th></th></tr>
                </thead>
                <tbody>
                  {exercices.map(ex => (
                    <tr key={ex.id}>
                      <td style={{ fontWeight:600 }}>{ex.titre}</td>
                      <td><span className="badge gray">{ZONES.find(z=>z.value===ex.zone)?.label || ex.zone}</span></td>
                      <td>{ex.dureeMinutes} min</td>
                      <td>{'●'.repeat(ex.niveauDifficulte)}{'○'.repeat(3-ex.niveauDifficulte)}</td>
                      <td style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => ouvrirEdition(ex)}>Modifier</button>
                        <button className="btn btn-outline btn-sm" style={{ color:'var(--danger, #C0392B)' }}
                          onClick={() => retirer(ex)}>Retirer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
