/**
 * ExercicesKine — Bibliothèque d'exercices ET protocoles curatifs, réunis
 * dans un seul onglet car un protocole n'est qu'une séquence d'exercices.
 * Le kiné ajoute ici son propre contenu (en plus de la bibliothèque
 * globale), visible immédiatement par tous les employés de son entreprise.
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

const FORM_EXERCICE_VIDE = {
  titre:'', description:'', zone:'DOS_LOMBAIRES', dureeMinutes:5,
  frequenceRecommandee:'', niveauDifficulte:1, hobbiesAssocies:'',
  urlVideo:'', urlImage:'',
};
const FORM_PROTOCOLE_VIDE = { titre:'', description:'', zone:'DOS_LOMBAIRES', dureeSemaines:4, avertissementMedical:'' };
const ETAPE_VIDE = () => ({ exerciceId:'', semaine:1, ordre:1, labelSemaine:'', frequence:'' });

const SECTIONS = [
  { key:'exercices',  label:'Bibliothèque d\'exercices', icon:'fa-dumbbell'    },
  { key:'protocoles', label:'Protocoles curatifs',        icon:'fa-kit-medical' },
];

export default function ExercicesKine() {
  const [section, setSection] = useState('exercices');
  const [loading,  setLoading] = useState(true);

  // ── Exercices ──
  const [exercices, setExercices]       = useState([]);
  const [showFormEx, setShowFormEx]     = useState(false);
  const [editExId,   setEditExId]       = useState(null);
  const [formEx,      setFormEx]        = useState(FORM_EXERCICE_VIDE);
  const [enCoursEx,   setEnCoursEx]     = useState(false);

  // ── Protocoles ──
  const [protocoles,     setProtocoles]     = useState([]);
  const [exercicesTous,  setExercicesTous]  = useState([]); // globaux + propres, pour le choix des étapes
  const [showFormProto,  setShowFormProto]  = useState(false);
  const [editProtoId,    setEditProtoId]    = useState(null);
  const [formProto,        setFormProto]    = useState(FORM_PROTOCOLE_VIDE);
  const [etapes,           setEtapes]       = useState([ETAPE_VIDE()]);
  const [enCoursProto,     setEnCoursProto] = useState(false);

  const charger = useCallback(async () => {
    try {
      const [exRes, protoRes, exTousRes] = await Promise.all([
        kineApi.listerExercices(), kineApi.listerProtocoles(), exerciceApi.getExercices(),
      ]);
      setExercices(exRes.data);
      setProtocoles(protoRes.data);
      setExercicesTous(exTousRes.data);
    } catch { toast.error('Impossible de charger la bibliothèque.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // ── Handlers exercices ──
  const ouvrirCreationEx = () => { setFormEx(FORM_EXERCICE_VIDE); setEditExId(null); setShowFormEx(true); };
  const ouvrirEditionEx = (ex) => {
    setFormEx({
      titre: ex.titre, description: ex.description, zone: ex.zone,
      dureeMinutes: ex.dureeMinutes, frequenceRecommandee: ex.frequenceRecommandee || '',
      niveauDifficulte: ex.niveauDifficulte, hobbiesAssocies: ex.hobbiesAssocies || '',
      urlVideo: ex.urlVideo || '', urlImage: ex.urlImage || '',
    });
    setEditExId(ex.id);
    setShowFormEx(true);
  };

  const soumettreEx = async (e) => {
    e.preventDefault();
    if (!formEx.titre.trim() || !formEx.description.trim()) {
      toast.error('Titre et description obligatoires.'); return;
    }
    setEnCoursEx(true);
    try {
      if (editExId) {
        await kineApi.modifierExercice(editExId, formEx);
        toast.success('Exercice mis à jour.');
      } else {
        await kineApi.creerExercice(formEx);
        toast.success('Exercice ajouté à la bibliothèque.');
      }
      setShowFormEx(false);
      charger();
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Impossible d\'enregistrer cet exercice.');
    } finally {
      setEnCoursEx(false);
    }
  };

  const retirerEx = async (ex) => {
    if (!window.confirm(`Retirer "${ex.titre}" de la bibliothèque ?`)) return;
    try {
      await kineApi.retirerExercice(ex.id);
      toast.success('Exercice retiré.');
      charger();
    } catch { toast.error('Impossible de retirer cet exercice.'); }
  };

  // ── Handlers protocoles ──
  const ouvrirCreationProto = () => { setFormProto(FORM_PROTOCOLE_VIDE); setEtapes([ETAPE_VIDE()]); setEditProtoId(null); setShowFormProto(true); };
  const ouvrirEditionProto = (p) => {
    setFormProto({ titre: p.titre, description: p.description, zone: p.zone, dureeSemaines: p.dureeSemaines, avertissementMedical: p.avertissementMedical || '' });
    setEtapes(p.etapes.length > 0 ? p.etapes.map(e => ({
      exerciceId: e.exerciceId, semaine: e.semaine, ordre: e.ordre,
      labelSemaine: e.labelSemaine || '', frequence: e.frequence || '',
    })) : [ETAPE_VIDE()]);
    setEditProtoId(p.id);
    setShowFormProto(true);
  };

  const ajouterEtape = () => setEtapes(list => [...list, { ...ETAPE_VIDE(), semaine: list[list.length-1]?.semaine || 1, ordre: (list[list.length-1]?.ordre || 0) + 1 }]);
  const retirerEtape = (i) => setEtapes(list => list.filter((_, idx) => idx !== i));
  const majEtape = (i, champ, val) => setEtapes(list => list.map((e, idx) => idx === i ? { ...e, [champ]: val } : e));

  const soumettreProto = async (e) => {
    e.preventDefault();
    if (!formProto.titre.trim() || !formProto.description.trim()) { toast.error('Titre et description obligatoires.'); return; }
    if (etapes.some(e => !e.exerciceId)) { toast.error('Choisissez un exercice pour chaque étape.'); return; }
    setEnCoursProto(true);
    try {
      const payload = { ...formProto, etapes: etapes.map(e => ({ ...e, exerciceId: Number(e.exerciceId) })) };
      if (editProtoId) {
        await kineApi.modifierProtocole(editProtoId, payload);
        toast.success('Protocole mis à jour.');
      } else {
        await kineApi.creerProtocole(payload);
        toast.success('Protocole créé.');
      }
      setShowFormProto(false);
      charger();
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Impossible d\'enregistrer ce protocole.');
    } finally {
      setEnCoursProto(false);
    }
  };

  const retirerProto = async (p) => {
    if (!window.confirm(`Retirer le protocole "${p.titre}" ?`)) return;
    try {
      await kineApi.retirerProtocole(p.id);
      toast.success('Protocole retiré.');
      charger();
    } catch { toast.error('Impossible de retirer ce protocole.'); }
  };

  if (loading) return <AppLayout title="Exercices & protocoles"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Exercices & protocoles">

      {/* ── Sous-onglets ── */}
      <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--border)', marginBottom:20 }}>
        {SECTIONS.map(s => (
          <button key={s.key}
            onClick={() => setSection(s.key)}
            style={{
              padding:'10px 16px', border:'none', background:'transparent',
              fontFamily:'var(--f-sans)', fontSize:'.82rem', fontWeight: section === s.key ? 700 : 500,
              color: section === s.key ? 'var(--blue)' : 'var(--ink-60)',
              borderBottom: section === s.key ? '2px solid var(--blue)' : '2px solid transparent',
              cursor:'pointer', display:'flex', alignItems:'center', gap:7, transition:'all .15s',
            }}>
            <i className={`fa-solid ${s.icon}`} style={{ fontSize:'.78rem' }} />
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Section : Bibliothèque d'exercices ── */}
      {section === 'exercices' && (
        <div className="card">
          <div className="card-head" style={{ paddingBottom:0 }}>
            <h3>Exercices ajoutés par vous ({exercices.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={ouvrirCreationEx}>
              <i className="fa-solid fa-plus" /> Nouvel exercice
            </button>
          </div>
          <p style={{ padding:'8px 20px 0', fontSize:'.78rem', color:'var(--ink-60)' }}>
            Vos employés voient aussi la bibliothèque globale de base — cette liste ne montre
            que le contenu que vous avez ajouté spécifiquement pour votre entreprise.
          </p>

          {showFormEx && (
            <form onSubmit={soumettreEx} style={{ padding:'16px 20px', borderTop:'1px solid var(--ink-10, #eee)',
              marginTop:12, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:14 }}>
              <label style={{ gridColumn:'1 / -1' }}>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Titre *</div>
                <input className="form-input" value={formEx.titre}
                  onChange={e => setFormEx(f => ({ ...f, titre: e.target.value }))} required />
              </label>
              <label style={{ gridColumn:'1 / -1' }}>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Description / instructions *</div>
                <textarea className="form-textarea" rows={3} value={formEx.description}
                  onChange={e => setFormEx(f => ({ ...f, description: e.target.value }))} required />
              </label>
              <label>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Zone du corps</div>
                <select className="form-select" value={formEx.zone}
                  onChange={e => setFormEx(f => ({ ...f, zone: e.target.value }))}>
                  {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                </select>
              </label>
              <label>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Durée (minutes)</div>
                <input className="form-input" type="number" min={1} value={formEx.dureeMinutes}
                  onChange={e => setFormEx(f => ({ ...f, dureeMinutes: parseInt(e.target.value) || 1 }))} />
              </label>
              <label>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Niveau de difficulté</div>
                <select className="form-select" value={formEx.niveauDifficulte}
                  onChange={e => setFormEx(f => ({ ...f, niveauDifficulte: parseInt(e.target.value) }))}>
                  <option value={1}>Facile</option>
                  <option value={2}>Moyen</option>
                  <option value={3}>Difficile</option>
                </select>
              </label>
              <label>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Fréquence recommandée</div>
                <input className="form-input" value={formEx.frequenceRecommandee} placeholder="Ex : 2× / jour"
                  onChange={e => setFormEx(f => ({ ...f, frequenceRecommandee: e.target.value }))} />
              </label>
              <label style={{ gridColumn:'1 / -1' }}>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Lien vidéo (YouTube ou autre)</div>
                <input className="form-input" value={formEx.urlVideo} placeholder="https://youtube.com/watch?v=…"
                  onChange={e => setFormEx(f => ({ ...f, urlVideo: e.target.value }))} />
              </label>
              <label style={{ gridColumn:'1 / -1' }}>
                <div style={{ fontSize:'.78rem', marginBottom:4 }}>Image de couverture (URL)</div>
                <input className="form-input" value={formEx.urlImage} placeholder="https://…"
                  onChange={e => setFormEx(f => ({ ...f, urlImage: e.target.value }))} />
              </label>
              <div style={{ gridColumn:'1 / -1', display:'flex', gap:10 }}>
                <button className="btn btn-primary" disabled={enCoursEx} type="submit">
                  {enCoursEx ? 'Enregistrement…' : editExId ? 'Mettre à jour' : 'Ajouter à la bibliothèque'}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setShowFormEx(false)}>Annuler</button>
              </div>
            </form>
          )}

          <div style={{ padding: showFormEx ? '20px 0 0' : '8px 0 0' }}>
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
                          <button className="btn btn-outline btn-sm" onClick={() => ouvrirEditionEx(ex)}>Modifier</button>
                          <button className="btn btn-outline btn-sm" style={{ color:'var(--danger, #C0392B)' }}
                            onClick={() => retirerEx(ex)}>Retirer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Section : Protocoles curatifs ── */}
      {section === 'protocoles' && (
        <div className="card">
          <div className="card-head" style={{ paddingBottom:0 }}>
            <h3>Protocoles ajoutés par vous ({protocoles.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={ouvrirCreationProto}>
              <i className="fa-solid fa-plus" /> Nouveau protocole
            </button>
          </div>
          <p style={{ padding:'8px 20px 0', fontSize:'.78rem', color:'var(--ink-60)' }}>
            Vos employés voient aussi les protocoles globaux de base — cette liste ne montre que
            ceux que vous avez créés pour votre entreprise.
          </p>

          {showFormProto && (
            <form onSubmit={soumettreProto} style={{ padding:'16px 20px', borderTop:'1px solid var(--ink-10, #eee)', marginTop:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:14, marginBottom:18 }}>
                <label style={{ gridColumn:'1 / -1' }}>
                  <div style={{ fontSize:'.78rem', marginBottom:4 }}>Titre *</div>
                  <input className="form-input" value={formProto.titre}
                    onChange={e => setFormProto(f => ({ ...f, titre: e.target.value }))} required />
                </label>
                <label style={{ gridColumn:'1 / -1' }}>
                  <div style={{ fontSize:'.78rem', marginBottom:4 }}>Description *</div>
                  <textarea className="form-textarea" rows={2} value={formProto.description}
                    onChange={e => setFormProto(f => ({ ...f, description: e.target.value }))} required />
                </label>
                <label>
                  <div style={{ fontSize:'.78rem', marginBottom:4 }}>Zone du corps</div>
                  <select className="form-select" value={formProto.zone}
                    onChange={e => setFormProto(f => ({ ...f, zone: e.target.value }))}>
                    {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                  </select>
                </label>
                <label>
                  <div style={{ fontSize:'.78rem', marginBottom:4 }}>Durée (semaines)</div>
                  <input className="form-input" type="number" min={1} value={formProto.dureeSemaines}
                    onChange={e => setFormProto(f => ({ ...f, dureeSemaines: parseInt(e.target.value) || 1 }))} />
                </label>
                <label style={{ gridColumn:'1 / -1' }}>
                  <div style={{ fontSize:'.78rem', marginBottom:4 }}>Avertissement médical (optionnel)</div>
                  <input className="form-input" value={formProto.avertissementMedical}
                    onChange={e => setFormProto(f => ({ ...f, avertissementMedical: e.target.value }))} />
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
                      {exercicesTous.map(ex => <option key={ex.id} value={ex.id}>{ex.titre}</option>)}
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
                <button className="btn btn-primary" disabled={enCoursProto} type="submit">
                  {enCoursProto ? 'Enregistrement…' : editProtoId ? 'Mettre à jour' : 'Créer le protocole'}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setShowFormProto(false)}>Annuler</button>
              </div>
            </form>
          )}

          <div style={{ padding: showFormProto ? '20px 0 0' : '8px 0 0' }}>
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
                          <button className="btn btn-outline btn-sm" onClick={() => ouvrirEditionProto(p)}>Modifier</button>
                          <button className="btn btn-outline btn-sm" style={{ color:'var(--danger, #C0392B)' }}
                            onClick={() => retirerProto(p)}>Retirer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
