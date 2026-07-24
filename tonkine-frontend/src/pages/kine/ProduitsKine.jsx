/**
 * ProduitsKine — Catalogue de recommandations produits (orthèses, coussins
 * ergonomiques, repose-pieds...). Simples fiches avec lien externe vers le
 * vendeur — aucune vente ni paiement géré dans l'application.
 */
import { useState, useEffect, useCallback } from 'react';
import { kineApi } from '../../api/kineApi';
import AppLayout    from '../../components/layout/AppLayout';
import toast         from 'react-hot-toast';

const ZONES = [
  { value:'',                    label:'Non spécifiée'         },
  { value:'DOS_LOMBAIRES',       label:'Dos / Lombaires'       },
  { value:'NUQUE_CERVICALES',    label:'Nuque / Cervicales'    },
  { value:'EPAULES',             label:'Épaules'               },
  { value:'POIGNETS_AVANT_BRAS', label:'Poignets / Avant-bras' },
  { value:'HANCHES_BASSIN',      label:'Hanches / Bassin'      },
  { value:'YEUX_VISION',         label:'Yeux / Vision'         },
];

const FORM_VIDE = { titre:'', description:'', categorie:'', zone:'', urlImage:'', urlExterne:'', prixIndicatif:'' };

export default function ProduitsKine() {
  const [produits, setProduits] = useState([]);
  const [loading,   setLoading] = useState(true);
  const [showForm,  setShowForm] = useState(false);
  const [editId,    setEditId]  = useState(null);
  const [form,       setForm]   = useState(FORM_VIDE);
  const [enCours,    setEnCours] = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data } = await kineApi.listerProduits();
      setProduits(data);
    } catch { toast.error('Impossible de charger le catalogue.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const ouvrirCreation = () => { setForm(FORM_VIDE); setEditId(null); setShowForm(true); };
  const ouvrirEdition = (p) => {
    setForm({
      titre: p.titre, description: p.description || '', categorie: p.categorie || '',
      zone: p.zone || '', urlImage: p.urlImage || '', urlExterne: p.urlExterne || '',
      prixIndicatif: p.prixIndicatif || '',
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const soumettre = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) { toast.error('Le titre est obligatoire.'); return; }
    setEnCours(true);
    try {
      const payload = { ...form, zone: form.zone || null };
      if (editId) {
        await kineApi.modifierProduit(editId, payload);
        toast.success('Fiche produit mise à jour.');
      } else {
        await kineApi.creerProduit(payload);
        toast.success('Produit ajouté au catalogue.');
      }
      setShowForm(false);
      charger();
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Impossible d\'enregistrer ce produit.');
    } finally {
      setEnCours(false);
    }
  };

  const retirer = async (p) => {
    if (!window.confirm(`Retirer "${p.titre}" du catalogue ?`)) return;
    try {
      await kineApi.retirerProduit(p.id);
      toast.success('Produit retiré.');
      charger();
    } catch { toast.error('Impossible de retirer ce produit.'); }
  };

  if (loading) return <AppLayout title="Recommandations produits"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Recommandations produits">
      <div className="card">
        <div className="card-head" style={{ paddingBottom:0 }}>
          <h3>Orthèses & équipements recommandés ({produits.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={ouvrirCreation}>
            <i className="fa-solid fa-plus" /> Nouveau produit
          </button>
        </div>
        <p style={{ padding:'8px 20px 0', fontSize:'.78rem', color:'var(--ink-60)' }}>
          Simple catalogue consultable par vos employés, avec un lien vers le vendeur — l'achat
          se fait en dehors de l'application, aucun paiement n'est géré ici.
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
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Description</div>
              <textarea className="form-textarea" rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Catégorie</div>
              <input className="form-input" value={form.categorie} placeholder="Ex : Orthèse, Coussin ergonomique…"
                onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Zone concernée</div>
              <select className="form-select" value={form.zone}
                onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}>
                {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Prix indicatif</div>
              <input className="form-input" value={form.prixIndicatif} placeholder="Ex : ~15 000 FCFA"
                onChange={e => setForm(f => ({ ...f, prixIndicatif: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Lien vers le vendeur</div>
              <input className="form-input" value={form.urlExterne} placeholder="https://…"
                onChange={e => setForm(f => ({ ...f, urlExterne: e.target.value }))} />
            </label>
            <label style={{ gridColumn:'1 / -1' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Image du produit (URL)</div>
              <input className="form-input" value={form.urlImage} placeholder="https://…"
                onChange={e => setForm(f => ({ ...f, urlImage: e.target.value }))} />
            </label>
            <div style={{ gridColumn:'1 / -1', display:'flex', gap:10 }}>
              <button className="btn btn-primary" disabled={enCours} type="submit">
                {enCours ? 'Enregistrement…' : editId ? 'Mettre à jour' : 'Ajouter au catalogue'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        )}

        <div style={{ padding: showForm ? '20px 0 0' : '8px 0 0' }}>
          {produits.length === 0 ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-briefcase-medical" />
              <p>Aucun produit recommandé pour l'instant.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Titre</th><th>Catégorie</th><th>Prix indicatif</th><th>Statut</th><th></th></tr>
                </thead>
                <tbody>
                  {produits.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight:600 }}>{p.titre}</td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{p.categorie || '—'}</td>
                      <td>{p.prixIndicatif || '—'}</td>
                      <td><span className={`badge ${p.actif ? 'green' : 'gray'}`}>{p.actif ? 'Visible' : 'Retiré'}</span></td>
                      <td style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => ouvrirEdition(p)}>Modifier</button>
                        {p.actif && (
                          <button className="btn btn-outline btn-sm" style={{ color:'var(--danger, #C0392B)' }}
                            onClick={() => retirer(p)}>Retirer</button>
                        )}
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
