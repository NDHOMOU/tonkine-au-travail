/**
 * MonProfil — Consultation et modification du profil ergonomique de
 * l'employé après l'inscription (mesures, poste actuel, douleurs
 * déclarées, hobbies, planning). Jusqu'ici impossible à revoir/ajuster.
 */
import { useState, useEffect } from 'react';
import { profilApi } from '../../api/profilApi';
import AppLayout      from '../../components/layout/AppLayout';
import toast           from 'react-hot-toast';

const HOBBIES = [
  { id:'musique',     label:'Musique' },
  { id:'sport',       label:'Sport / Fitness' },
  { id:'lecture',     label:'Lecture' },
  { id:'gastronomie', label:'Gastronomie' },
  { id:'yoga',        label:'Yoga / Méditation' },
  { id:'marche',      label:'Marche / Nature' },
  { id:'art',         label:'Art / Créativité' },
  { id:'social',      label:'Social / Équipe' },
];

export default function MonProfil() {
  const [profil,  setProfil]  = useState(null);
  const [form,     setForm]   = useState(null);
  const [loading,  setLoading] = useState(true);
  const [enCours,  setEnCours] = useState(false);

  useEffect(() => {
    profilApi.getMonProfil()
      .then(r => { setProfil(r.data); setForm({ ...r.data, hobbiesArr: (r.data.hobbies || '').split(',').filter(Boolean) }); })
      .catch(() => toast.error('Impossible de charger votre profil.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleHobbie = (id) => {
    setForm(f => ({
      ...f,
      hobbiesArr: f.hobbiesArr.includes(id) ? f.hobbiesArr.filter(h => h !== id) : [...f.hobbiesArr, id],
    }));
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setEnCours(true);
    try {
      const payload = { ...form, hobbies: form.hobbiesArr.join(',') };
      delete payload.hobbiesArr;
      const { data } = await profilApi.mettreAJourProfil(payload);
      setProfil(data);
      setForm({ ...data, hobbiesArr: (data.hobbies || '').split(',').filter(Boolean) });
      toast.success('Profil mis à jour.');
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Impossible d\'enregistrer votre profil.');
    } finally {
      setEnCours(false);
    }
  };

  if (loading) return <AppLayout title="Mon profil"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;
  if (!form) return null;

  return (
    <AppLayout title="Mon profil">
      <div className="page-hero" style={{ marginBottom: 24 }}>
        <div className="ph-text">
          <div className="ph-eyebrow">{profil.departement} · {profil.poste || '—'}</div>
          <h1>{profil.prenom} <em>{profil.nom}</em></h1>
          <p>{profil.email}</p>
        </div>
      </div>

      <form onSubmit={soumettre}>
        <div className="grid-2" style={{ gap: 20, marginBottom: 20, alignItems:'start' }}>

          {/* ── Mesures corporelles ── */}
          <div className="card">
            <div className="card-head"><h3>Mesures corporelles</h3></div>
            <div style={{ padding:'0 20px 20px' }}>
              {[
                { field:'tailleCm',           label:'Taille',              min:100, max:250, unit:'cm' },
                { field:'longueurJambeCm',    label:'Sol → Genou',         min:20,  max:80,  unit:'cm' },
                { field:'longueurAvantBrasCm',label:'Coude → Poignet',     min:15,  max:50,  unit:'cm' },
              ].map(r => (
                <div key={r.field} style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <label style={{ fontSize:'.8rem' }}>{r.label}</label>
                    <strong style={{ fontSize:'.85rem' }}>{form[r.field] ?? '—'} {r.unit}</strong>
                  </div>
                  <input type="range" min={r.min} max={r.max} value={form[r.field] || r.min}
                    onChange={e => setForm(f => ({ ...f, [r.field]: parseInt(e.target.value) }))}
                    style={{ width:'100%' }} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Poids (kg, facultatif)</label>
                <input className="form-input" type="number" min={30} max={200} value={form.poidsKg || ''}
                  onChange={e => setForm(f => ({ ...f, poidsKg: e.target.value ? parseInt(e.target.value) : null }))} />
              </div>
            </div>
          </div>

          {/* ── Configuration poste actuel ── */}
          <div className="card">
            <div className="card-head"><h3>Votre poste actuel</h3></div>
            <div style={{ padding:'0 20px 20px' }}>
              <div className="form-group">
                <label className="form-label">Type de siège</label>
                <select className="form-select" value={form.typeSiege || ''}
                  onChange={e => setForm(f => ({ ...f, typeSiege: e.target.value }))}>
                  <option value="">Sélectionner…</option>
                  {['Chaise classique','Chaise ergonomique','Tabouret réglable','Autre'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type d'écran</label>
                <select className="form-select" value={form.typeEcran || ''}
                  onChange={e => setForm(f => ({ ...f, typeEcran: e.target.value }))}>
                  <option value="">Sélectionner…</option>
                  {['Écran fixe','Ordinateur portable','Double écran','Tablette'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid-2" style={{ gap:12 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Bureau réglable ?</label>
                  <select className="form-select" value={form.bureauReglable ? 'true' : 'false'}
                    onChange={e => setForm(f => ({ ...f, bureauReglable: e.target.value === 'true' }))}>
                    <option value="false">Non</option>
                    <option value="true">Oui</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Repose-pieds ?</label>
                  <select className="form-select" value={form.reposePieds ? 'true' : 'false'}
                    onChange={e => setForm(f => ({ ...f, reposePieds: e.target.value === 'true' }))}>
                    <option value="false">Non</option>
                    <option value="true">Oui</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Heures assises / jour</label>
                <select className="form-select" value={form.heuresAssiParJour || ''}
                  onChange={e => setForm(f => ({ ...f, heuresAssiParJour: e.target.value }))}>
                  {['4 à 5 heures','6 à 7 heures','8 à 9 heures','Plus de 9 heures'].map(h=><option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recommandation calculée ── */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-head"><h3>Configuration recommandée pour vous</h3></div>
          <div style={{ padding:'0 20px 20px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            <div style={{ background:'var(--sand)', borderRadius:8, padding:'12px', textAlign:'center' }}>
              <div style={{ fontSize:'.68rem', color:'var(--ink-60)' }}>Hauteur siège</div>
              <div style={{ fontWeight:700, fontSize:'1.1rem' }}>{profil.hauteurSiegeRecommandeCm ?? '—'} cm</div>
            </div>
            <div style={{ background:'var(--sand)', borderRadius:8, padding:'12px', textAlign:'center' }}>
              <div style={{ fontSize:'.68rem', color:'var(--ink-60)' }}>Hauteur bureau</div>
              <div style={{ fontWeight:700, fontSize:'1.1rem' }}>{profil.hauteurBureauRecommandeCm ?? '—'} cm</div>
            </div>
            <div style={{ background:'var(--sand)', borderRadius:8, padding:'12px', textAlign:'center' }}>
              <div style={{ fontSize:'.68rem', color:'var(--ink-60)' }}>Hauteur écran</div>
              <div style={{ fontWeight:700, fontSize:'1.1rem' }}>{profil.hauteurEcranRecommandeCm ?? '—'} cm</div>
            </div>
          </div>
          <p style={{ padding:'0 20px 16px', fontSize:'.72rem', color:'var(--ink-60)' }}>
            Recalculée automatiquement à chaque enregistrement, selon vos mesures ci-dessus.
          </p>
        </div>

        {/* ── Santé ── */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-head"><h3>Douleurs déclarées</h3></div>
          <div style={{ padding:'0 20px 20px' }}>
            <textarea className="form-textarea" rows={3}
              placeholder="Ex. : douleurs cervicales, tension lombaire… (laissez vide si aucune)"
              value={form.douleursDeclarees || ''}
              onChange={e => setForm(f => ({ ...f, douleursDeclarees: e.target.value }))} />
            <span style={{ fontSize:'.72rem', color:'var(--ink-60)' }}>
              Confidentiel — utilisé pour adapter vos protocoles curatifs et alerter votre kiné si besoin.
            </span>
          </div>
        </div>

        {/* ── Hobbies ── */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-head"><h3>Vos hobbies</h3></div>
          <div style={{ padding:'0 20px 20px', display:'flex', gap:8, flexWrap:'wrap' }}>
            {HOBBIES.map(h => (
              <button key={h.id} type="button" onClick={() => toggleHobbie(h.id)}
                className={`btn btn-sm ${form.hobbiesArr.includes(h.id) ? 'btn-teal' : 'btn-outline'}`}>
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Planning ── */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-head"><h3>Planning de travail</h3></div>
          <div className="grid-2" style={{ gap:12, padding:'0 20px 20px' }}>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Heure d'arrivée habituelle</label>
              <input className="form-input" type="time" value={form.heureArrivee || ''}
                onChange={e => setForm(f => ({ ...f, heureArrivee: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Heure de départ habituelle</label>
              <input className="form-input" type="time" value={form.heureDepart || ''}
                onChange={e => setForm(f => ({ ...f, heureDepart: e.target.value }))} />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" disabled={enCours} type="submit">
          {enCours ? 'Enregistrement…' : 'Enregistrer mes informations'}
        </button>
      </form>
    </AppLayout>
  );
}
