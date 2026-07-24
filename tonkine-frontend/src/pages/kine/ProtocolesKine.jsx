/**
 * ProtocolesKine — Programmes de rééducation multi-semaines
 * Le kiné compose un protocole à partir d'exercices existants (globaux ou
 * ajoutés par lui), organisés semaine par semaine.
 */
import { useState, useEffect, useCallback } from 'react';
import { kineApi }     from '../../api/kineApi';
import { exerciceApi } from '../../api/exerciceApi';
import AppLayout        from '../../components/layout/AppLayout';
import toast             from 'react-hot-toast';

const ZONES = [
  { value:'DOS_LOMBAIRES',       label:'Dos / Lombaires'       },
  { value:'NUQUE_CERVICALES',    label:'Nuque / Cervicales'    },
  { value:'EPAULES',             label:'Épaules'               },
  { value:'POIGNETS_AVANT_BRAS', label:'Poignets / Avant-bras' },
  { value:'HANCHES_BASSIN',      label:'Hanches / Bassin'      },
  { value:'YEUX_VISION',         label:'Yeux / Vision'         },
];

const FORM_VIDE = { titre:'', description:'', zone:'DOS_LOMBAIRES', dureeSemaines:4, avertissementMedical:'' };
const ETAPE_VIDE = () => ({ exerciceId:'', semaine:1, ordre:1, labelSemaine:'', frequence:'' });

export default function ProtocolesKine() {
  const [protocoles, setProtocoles] = useState([]);
  const [exercices,  setExercices]  = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [showForm,    setShowForm]  = useState(false);
  const [editId,      setEditId]    = useState(null);
  const [form,         setForm]     = useState(FORM_VIDE);
  const [etapes,       setEtapes]   = useState([ETAPE_VIDE()]);
  const [enCours,      setEnCours]  = useState(false);

  const charger = useCallback(async () => {
    try {
      const [pRes, eRes] = await Promise.all([kineApi.listerProtocoles(), exerciceApi.getExercices()]);
      setProtocoles(pRes.data);
      setExercices(eRes.data);
    } catch { toast.error('Impossible de charger les protocoles.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const ouvrirCreation = () => { setForm(FORM_VIDE); setEtapes([ETAPE_VIDE()]); setEditId(null); setShowForm(true); };
  const ouvrirEdition = (p) => {
    setForm({ titre: p.titre, description: p.description, zone: p.zone, dureeSemaines: p.dureeSemaines, avertissementMedical: p.avertissementMedical || '' });
    setEtapes(p.etapes.length > 0 ? p.etapes.map(e => ({
      exerciceId: e.exerciceId, semaine: e.semaine, ordre: e.ordre,
      labelSemaine: e.labelSemaine || '', frequence: e.frequence || '',
    })) : [ETAPE_VIDE()]);
    setEditId(p.id);
    setShowForm(true);
  };

  const ajouterEtape = () => setEtapes(list => [...list, { ...ETAPE_VIDE(), semaine: list[list.length-1]?.semaine || 1, ordre: (list[list.length-1]?.ordre || 0) + 1 }]);
  const retirerEtape = (i) => setEtapes(list => list.filter((_, idx) => idx !== i));
  const majEtape = (i, champ, val) => setEtapes(list => list.map((e, idx) => idx === i ? { ...e, [champ]: val } : e));

  const soumettre = async (e) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.description.trim()) { toast.error('Titre et description obligatoires.'); return; }
    if (etapes.some(e => !e.exerciceId)) { toast.error('Choisissez un exercice pour chaque étape.'); return; }
    setEnCours(true);
    try {
      const payload = { ...form, etapes: etapes.map(e => ({ ...e, exerciceId: Number(e.exerciceId) })) };
      if (editId) {
        await kineApi.modifierProtocole(editId, payload);
        toast.success('Protocole mis à jour.');
      } else {
        await kineApi.creerProtocole(payload);
        toast.success('Protocole créé.');
      }
      setShowForm(false);
      charger();
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Impossible d\'enregistrer ce protocole.');
    } finally {
      setEnCours(false);
    }
  };

  const retirer = async (p) => {
    if (!window.confirm(`Retirer le protocole "${p.titre}" ?`)) return;
    try {
      await kineApi.retirerProtocole(p.id);
      toast.success('Protocole retiré.');
      charger();
    } catch { toast.error('Impossible de retirer ce protocole.'); }
  };

  if (loading) return <AppLayout title="Protocoles curatifs"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Protocoles curatifs">
      <div className="card">
        <div className="card-head" style={{ paddingBottom:0 }}>
          <h3>Protocoles ajoutés par vous ({protocoles.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={ouvrirCreation}>
            <i className="fa-solid fa-plus" /> Nouveau protocole
          </button>
        </div>
        <p style={{ padding:'8px 20px 0', fontSize:'.78rem', color:'var(--ink-60)' }}>
          Vos employés voient aussi les protocoles globaux de base — cette liste ne montre que
          ceux que vous avez créés pour votre entreprise.
        </p>

        {showForm && (
          <form onSubmit={soumettre} style={{ padding:'16px 20px', borderTop:'1px solid var(--ink-10, #eee)', marginTop:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:14, marginBottom:18 }}>
              <label style={{ gridColumn:'1 / -1' }}>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Titre *</div>
                <input className="form-input" value={form.titre}
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} required />
              </label>
              <label style={{ gridColumn:'1 / -1' }}>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Description *</div>
                <textarea className="form-textarea" rows={2} value={form.description}
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
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Durée (semaines)</div>
                <input className="form-input" type="number" min={1} value={form.dureeSemaines}
                  onChange={e => setForm(f => ({ ...f, dureeSemaines: parseInt(e.target.value) || 1 }))} />
              </label>
              <label style={{ gridColumn:'1 / -1' }}>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Avertissement médical (optionnel)</div>
                <input className="form-input" value={form.avertissementMedical}
                  onChange={e => setForm(f => ({ ...f, avertissementMedical: e.target.value }))} />
              </label>
            </div>

            <div style={{ fontSize:'.82rem', fontWeight:700, marginBottom:8 }}>Étapes du protocole</div>
            {etapes.map((et, i) => (
              <div key={i} style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end',
                padding:'10px 0', borderBottom:'1px solid var(--ink-10, #eee)' }}>
                <label style={{ width:70 }}>
                  <div style={{ fontSize:'.7rem' }}>Semaine</div>
                  <input className="form-input" type="number" min={1} value={et.semaine}
                    onChange={e => majEtape(i, 'semaine', parseInt(e.target.value) || 1)} />
                </label>
                <label style={{ width:70 }}>
                  <div style={{ fontSize:'.7rem' }}>Ordre</div>
                  <input className="form-input" type="number" min={1} value={et.ordre}
                    onChange={e => majEtape(i, 'ordre', parseInt(e.target.value) || 1)} />
                </label>
                <label style={{ flex:'1 1 180px' }}>
                  <div style={{ fontSize:'.7rem' }}>Exercice</div>
                  <select className="form-select" value={et.exerciceId}
                    onChange={e => majEtape(i, 'exerciceId', e.target.value)}>
                    <option value="">Choisir…</option>
                    {exercices.map(ex => <option key={ex.id} value={ex.id}>{ex.titre}</option>)}
                  </select>
                </label>
                <label style={{ flex:'1 1 160px' }}>
                  <div style={{ fontSize:'.7rem' }}>Label semaine</div>
                  <input className="form-input" value={et.labelSemaine} placeholder="Ex : Relâchement doux"
                    onChange={e => majEtape(i, 'labelSemaine', e.target.value)} />
                </label>
                <label style={{ flex:'1 1 140px' }}>
                  <div style={{ fontSize:'.7rem' }}>Fréquence</div>
                  <input className="form-input" value={et.frequence} placeholder="Ex : 1× / jour"
                    onChange={e => majEtape(i, 'frequence', e.target.value)} />
                </label>
                <button type="button" className="btn btn-outline btn-sm" style={{ color:'var(--danger, #C0392B)' }}
                  disabled={etapes.length === 1} onClick={() => retirerEtape(i)}>
                  Retirer
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" style={{ marginTop:10 }} onClick={ajouterEtape}>
              <i className="fa-solid fa-plus" /> Ajouter une étape
            </button>

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button className="btn btn-primary" disabled={enCours} type="submit">
                {enCours ? 'Enregistrement…' : editId ? 'Mettre à jour' : 'Créer le protocole'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        )}

        <div style={{ padding: showForm ? '20px 0 0' : '8px 0 0' }}>
          {protocoles.length === 0 ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-kit-medical" />
              <p>Vous n'avez pas encore créé de protocole propre à votre entreprise.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Titre</th><th>Zone</th><th>Durée</th><th>Étapes</th><th></th></tr>
                </thead>
                <tbody>
                  {protocoles.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight:600 }}>{p.titre}</td>
                      <td><span className="badge gray">{ZONES.find(z=>z.value===p.zone)?.label || p.zone}</span></td>
                      <td>{p.dureeSemaines} sem.</td>
                      <td>{p.etapes.length}</td>
                      <td style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => ouvrirEdition(p)}>Modifier</button>
                        <button className="btn btn-outline btn-sm" style={{ color:'var(--danger, #C0392B)' }}
                          onClick={() => retirer(p)}>Retirer</button>
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
