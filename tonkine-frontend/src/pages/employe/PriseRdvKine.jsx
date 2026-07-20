/**
 * PriseRdvKine — Prise de rendez-vous + Conseils santé en ligne
 * Le kiné est unique (pas d'annuaire) — auto-déterminé depuis l'entreprise.
 * Deux fonctionnalités sur la même page :
 *   1. Réserver un créneau avec le kiné
 *   2. Poser une question de conseil santé en ligne
 */
import { useState, useEffect, useCallback } from 'react';
import { rdvApi }     from '../../api/rdvApi';
import { conseilApi } from '../../api/conseilApi';
import AppLayout      from '../../components/layout/AppLayout';
import toast          from 'react-hot-toast';

const ZONES = [
  { value: '',                    label: 'Zone non précisée'     },
  { value: 'DOS_LOMBAIRES',       label: 'Dos / Lombaires'       },
  { value: 'NUQUE_CERVICALES',    label: 'Nuque / Cervicales'    },
  { value: 'EPAULES',             label: 'Épaules'               },
  { value: 'POIGNETS_AVANT_BRAS', label: 'Poignets / Avant-bras' },
  { value: 'HANCHES_BASSIN',      label: 'Hanches / Bassin'      },
  { value: 'YEUX_VISION',         label: 'Yeux / Vision'         },
];

const STATUT_LABEL = { EN_ATTENTE:'En attente', CONFIRME:'Confirmé', EFFECTUE:'Effectué', ANNULE:'Annulé' };
const STATUT_BADGE = { EN_ATTENTE:'warn', CONFIRME:'green', EFFECTUE:'blue', ANNULE:'gray' };
const CONSEIL_BADGE = { EN_ATTENTE:'warn', VU:'blue', REPONDU:'green' };
const CONSEIL_LABEL = { EN_ATTENTE:'En attente', VU:'Lu par le kiné', REPONDU:'Répondu' };

export default function PriseRdvKine({ defaultTab }) {
  const [onglet,      setOnglet]      = useState(defaultTab === 'conseils' ? 'conseils' : 'rdv');
  const [kineInfo,    setKineInfo]    = useState(null);
  const [dateChoisie, setDateChoisie] = useState('');
  const [creneaux,    setCreneaux]    = useState([]);
  const [creneauSel,  setCreneauSel]  = useState('');
  const [motif,       setMotif]       = useState('');
  const [mesRdv,      setMesRdv]      = useState([]);
  const [mesConseils, setMesConseils] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [envoi,       setEnvoi]       = useState(false);

  // Formulaire conseil
  const [question,    setQuestion]    = useState('');
  const [zoneCons,    setZoneCons]    = useState('');
  const [urgence,     setUrgence]     = useState('NORMAL');
  const [envoiCons,   setEnvoiCons]   = useState(false);

  const charger = useCallback(async () => {
    try {
      const [kRes, rdvRes, cRes] = await Promise.all([
        rdvApi.getKineInfo(),
        rdvApi.getMesRdv(),
        conseilApi.getMesConseils(),
      ]);
      setKineInfo(kRes.data);
      setMesRdv(rdvRes.data);
      setMesConseils(cRes.data);
    } catch { /* kine peut ne pas encore être configuré */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  useEffect(() => {
    if (!dateChoisie) return;
    rdvApi.getCreneaux(dateChoisie)
      .then(r => setCreneaux(r.data))
      .catch(() => setCreneaux([]));
  }, [dateChoisie]);

  const reserver = async () => {
    if (!creneauSel || !dateChoisie) { toast.error('Choisissez une date et un créneau.'); return; }
    setEnvoi(true);
    try {
      await rdvApi.reserver({ dateRdv: dateChoisie, heureDebut: creneauSel + ':00', motif });
      toast.success('Rendez-vous confirmé !');
      setCreneauSel(''); setMotif(''); setDateChoisie(''); setCreneaux([]);
      charger();
    } catch (e) {
      toast.error(e.response?.data?.erreur || 'Créneau indisponible, veuillez en choisir un autre.');
    } finally { setEnvoi(false); }
  };

  const annuler = async (id) => {
    try {
      await rdvApi.annuler(id);
      toast.success('RDV annulé.');
      charger();
    } catch { toast.error('Impossible d\'annuler ce RDV.'); }
  };

  const envoyerConseil = async () => {
    if (!question.trim()) { toast.error('Rédigez votre question.'); return; }
    setEnvoiCons(true);
    try {
      await conseilApi.poserQuestion({ question, zoneConcernee: zoneCons || undefined, niveauUrgence: urgence });
      toast.success('Question envoyée ! Votre kiné vous répondra dès que possible.');
      setQuestion(''); setZoneCons(''); setUrgence('NORMAL');
      charger();
    } catch { toast.error('Impossible d\'envoyer la question.'); }
    finally { setEnvoiCons(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return <AppLayout title="Mon Kiné"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Mon Kiné">

      {/* Hero : infos kiné */}
      <div className="card" style={{ marginBottom:24, padding:'22px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--sky)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <i className="fa-solid fa-user-doctor" style={{ fontSize:'1.4rem', color:'var(--blue)' }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--teal)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>
              Votre kinésithérapeute
            </div>
            <h2 style={{ fontFamily:'var(--f-serif)', fontSize:'1.2rem', fontWeight:300, marginBottom:4 }}>
              {kineInfo ? kineInfo.nomComplet : 'Kinésithérapeute non encore assigné'}
            </h2>
            {kineInfo && <div style={{ fontSize:'.78rem', color:'var(--ink-60)' }}>{kineInfo.email}</div>}
          </div>
          {!kineInfo && (
            <div className="inline-alert warn" style={{ margin:0 }}>
              <i className="fa-solid fa-circle-info" />
              Votre administrateur RH doit d'abord créer le compte du kinésithérapeute.
            </div>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border)', paddingBottom:0 }}>
        {[
          { key:'rdv',      label:'Prendre un RDV',    icon:'fa-calendar-plus' },
          { key:'mes-rdv',  label:'Mes rendez-vous',   icon:'fa-calendar-check' },
          { key:'conseils', label:'Conseils santé',     icon:'fa-comment-medical' },
        ].map(t => (
          <button key={t.key}
            onClick={() => setOnglet(t.key)}
            style={{
              padding:'10px 16px', border:'none', background:'transparent',
              fontFamily:'var(--f-sans)', fontSize:'.82rem', fontWeight: onglet === t.key ? 700 : 500,
              color: onglet === t.key ? 'var(--blue)' : 'var(--ink-60)',
              borderBottom: onglet === t.key ? '2px solid var(--blue)' : '2px solid transparent',
              cursor:'pointer', display:'flex', alignItems:'center', gap:7, transition:'all .15s',
            }}>
            <i className={`fa-solid ${t.icon}`} style={{ fontSize:'.78rem' }} />
            {t.label}
            {t.key === 'conseils' && mesConseils.filter(c => c.statut === 'EN_ATTENTE').length > 0 && (
              <span style={{ background:'var(--bad)', color:'white', borderRadius:'50%',
                width:16, height:16, fontSize:'.6rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {mesConseils.filter(c => c.statut === 'EN_ATTENTE').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Onglet : Prendre un RDV ── */}
      {onglet === 'rdv' && (
        <div className="grid-2" style={{ alignItems:'start' }}>
          <div className="card">
            <div className="card-head"><h3>Choisir un créneau</h3></div>
            <div className="card-body" style={{ paddingTop:16 }}>
              <div className="form-group">
                <label className="form-label">Date souhaitée</label>
                <input type="date" className="form-input"
                  value={dateChoisie} min={today}
                  onChange={e => { setDateChoisie(e.target.value); setCreneauSel(''); }} />
              </div>
              {creneaux.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Créneaux disponibles</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {creneaux.map(c => (
                      <button key={c}
                        className={`btn ${creneauSel === c ? 'btn-teal' : 'btn-outline'} btn-sm`}
                        onClick={() => setCreneauSel(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {dateChoisie && creneaux.length === 0 && (
                <div className="inline-alert warn">
                  <i className="fa-solid fa-calendar-xmark" />
                  Aucun créneau disponible à cette date. Essayez une autre date.
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Motif de consultation (optionnel)</label>
                <textarea className="form-textarea" rows={3}
                  placeholder="Douleurs lombaires, prévention, bilan postural…"
                  value={motif} onChange={e => setMotif(e.target.value)} />
              </div>
              <button className="btn btn-primary" style={{ width:'100%' }}
                disabled={!creneauSel || envoi || !kineInfo}
                onClick={reserver}>
                {envoi ? <><i className="fa-solid fa-spinner fa-spin" /> Réservation…</>
                       : <><i className="fa-solid fa-calendar-check" /> Confirmer le RDV — {creneauSel || '—'}</>}
              </button>
            </div>
          </div>
          {/* Info pratique */}
          <div>
            {[
              { icon:'fa-clock',     title:'Durée', text:'45 minutes par séance' },
              { icon:'fa-map-pin',   title:'Lieu',  text:'Dans votre entreprise' },
              { icon:'fa-calendar',  title:'Délai', text:'Réservation jusqu\'à la veille' },
              { icon:'fa-comment',   title:'Conseil rapide', text:'Posez une question sans RDV via l\'onglet "Conseils santé"' },
            ].map(i => (
              <div key={i.title} style={{ display:'flex', gap:14, padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'var(--sky)',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`fa-solid ${i.icon}`} style={{ color:'var(--blue)', fontSize:'.85rem' }} />
                </div>
                <div>
                  <div style={{ fontSize:'.78rem', fontWeight:700, marginBottom:2 }}>{i.title}</div>
                  <div style={{ fontSize:'.74rem', color:'var(--ink-60)' }}>{i.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Onglet : Mes RDV ── */}
      {onglet === 'mes-rdv' && (
        <div className="card">
          {mesRdv.length === 0 ? (
            <div className="empty-state" style={{ padding:40 }}>
              <i className="fa-solid fa-calendar" />
              <p>Aucun rendez-vous pour l'instant.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Heure</th><th>Durée</th>
                    <th>Motif</th><th>Kiné</th><th>Statut</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {mesRdv.map(rdv => (
                    <tr key={rdv.id}>
                      <td>{new Date(rdv.dateRdv).toLocaleDateString('fr-FR', { day:'2-digit', month:'long' })}</td>
                      <td style={{ fontWeight:700 }}>{rdv.heureDebut?.substring(0,5)}</td>
                      <td>{rdv.dureeMinutes} min</td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{rdv.motif || '—'}</td>
                      <td style={{ fontSize:'.8rem' }}>{rdv.kineNom}</td>
                      <td><span className={`badge ${STATUT_BADGE[rdv.statut] || 'gray'}`}>{STATUT_LABEL[rdv.statut] || rdv.statut}</span></td>
                      <td>
                        {rdv.statut === 'CONFIRME' && (
                          <button className="btn btn-outline btn-sm" style={{ color:'var(--bad)', borderColor:'rgba(192,57,43,.2)' }}
                            onClick={() => annuler(rdv.id)}>
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Onglet : Conseils santé ── */}
      {onglet === 'conseils' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Formulaire nouvelle question */}
          <div className="card">
            <div className="card-head"><h3>Poser une question à votre kiné</h3></div>
            <div className="card-body" style={{ paddingTop:14 }}>
              <p style={{ fontSize:'.8rem', color:'var(--ink-60)', marginBottom:16, lineHeight:1.6 }}>
                Votre kinésithérapeute vous répond sans déplacement — depuis son poste, en temps différé. Idéal pour une douleur soudaine ou une question posturale urgente.
              </p>
              <div className="form-group">
                <label className="form-label">Votre question</label>
                <textarea className="form-textarea" rows={4}
                  placeholder="Ex : J'ai une douleur au niveau de l'épaule droite depuis ce matin, est-ce que je dois arrêter de travailler ?"
                  value={question} onChange={e => setQuestion(e.target.value)} />
              </div>
              <div className="grid-2" style={{ gap:12 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Zone concernée</label>
                  <select className="form-select" value={zoneCons} onChange={e => setZoneCons(e.target.value)}>
                    {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Niveau d'urgence</label>
                  <select className="form-select" value={urgence} onChange={e => setUrgence(e.target.value)}>
                    <option value="NORMAL">Normal — pas urgent</option>
                    <option value="URGENT">Urgent — douleur vive</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop:16 }}
                disabled={!question.trim() || envoiCons || !kineInfo}
                onClick={envoyerConseil}>
                {envoiCons ? <><i className="fa-solid fa-spinner fa-spin" /> Envoi…</>
                           : <><i className="fa-solid fa-paper-plane" /> Envoyer la question</>}
              </button>
            </div>
          </div>

          {/* Historique conseils */}
          {mesConseils.length > 0 && (
            <div className="card">
              <div className="card-head" style={{ paddingBottom:0 }}>
                <h3>Mes questions ({mesConseils.length})</h3>
              </div>
              <div style={{ padding:'8px 20px 16px' }}>
                {mesConseils.map(c => (
                  <div key={c.id} style={{ padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, gap:8 }}>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <span className={`badge ${CONSEIL_BADGE[c.statut]}`}>{CONSEIL_LABEL[c.statut]}</span>
                        {c.niveauUrgence === 'URGENT' && <span className="pill-urgent">Urgent</span>}
                        {c.zoneConcernee && <span className="badge gray">{c.zoneConcernee.replace('_',' ')}</span>}
                      </div>
                      <span style={{ fontSize:'.7rem', color:'var(--ink-60)', flexShrink:0 }}>
                        {c.minutesDepuisQuestion < 60
                          ? `Il y a ${c.minutesDepuisQuestion} min`
                          : new Date(c.dateQuestion).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p style={{ fontSize:'.82rem', marginBottom: c.reponse ? 10 : 0, lineHeight:1.55 }}>{c.question}</p>
                    {c.reponse && (
                      <div style={{ background:'var(--teal-bg)', borderRadius:8, padding:'10px 14px', marginTop:8 }}>
                        <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--teal)', marginBottom:4, textTransform:'uppercase' }}>
                          Réponse de votre kiné
                        </div>
                        <p style={{ fontSize:'.82rem', lineHeight:1.55 }}>{c.reponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </AppLayout>
  );
}
