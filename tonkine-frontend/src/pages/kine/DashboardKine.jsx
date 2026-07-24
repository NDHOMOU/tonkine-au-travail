/**
 * DashboardKine — Outil d'aide à la décision clinique
 * Le kinésithérapeute voit en temps réel :
 *   - Patients à risque postural (score < 60%)
 *   - Patients inactifs (app non lancée)
 *   - Planning RDV du jour
 * Les conseils, la bibliothèque d'exercices, les protocoles et les
 * recommandations produits ont chacun leur propre onglet dans la sidebar.
 */
import { useState, useEffect, useCallback } from 'react';
import { kineApi }    from '../../api/kineApi';
import AppLayout      from '../../components/layout/AppLayout';
import { useAuth }    from '../../context/AuthContext';
import { telechargerBlob } from '../../utils/telechargerFichier';
import toast          from 'react-hot-toast';

const ONGLETS = [
  { key:'risque',   label:'Posture à risque', icon:'fa-triangle-exclamation' },
  { key:'inactifs', label:'App inactive',      icon:'fa-circle-xmark'        },
  { key:'agenda',   label:'Mon agenda',        icon:'fa-calendar'            },
];

const STATUT_BADGE = { EN_ATTENTE:'warn', CONFIRME:'green', EFFECTUE:'blue', ANNULE:'gray' };
const STATUT_LABEL = { EN_ATTENTE:'En attente', CONFIRME:'Confirmé', EFFECTUE:'Effectué', ANNULE:'Annulé' };

export default function DashboardKine() {
  const { user } = useAuth();
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [onglet,      setOnglet]      = useState('risque');
  const [noteRdvId,   setNoteRdvId]   = useState(null);
  const [noteTexte,   setNoteTexte]   = useState('');
  const [telechargementEnCours, setTelechargementEnCours] = useState(false);

  const telechargerRapport = async () => {
    setTelechargementEnCours(true);
    try {
      const { data: blob } = await kineApi.telechargerRapportHebdomadaire();
      telechargerBlob(blob, `rapport-hebdomadaire-${new Date().toISOString().slice(0,10)}.csv`);
    } catch {
      toast.error('Impossible de générer le rapport.');
    } finally {
      setTelechargementEnCours(false);
    }
  };

  const charger = useCallback(async () => {
    try {
      const { data: d } = await kineApi.getDashboard();
      setData(d);
    } catch { toast.error('Impossible de charger le tableau de bord clinique.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // Auto-actualisation toutes les 60 secondes
  useEffect(() => {
    const id = setInterval(charger, 60000);
    return () => clearInterval(id);
  }, [charger]);

  const enregistrerNotes = async () => {
    if (!noteTexte.trim()) return;
    try {
      await kineApi.ajouterNotes(noteRdvId, noteTexte);
      toast.success('Notes de séance enregistrées.');
      setNoteRdvId(null); setNoteTexte('');
      charger();
    } catch { toast.error('Impossible d\'enregistrer les notes.'); }
  };

  if (loading) return (
    <AppLayout title="Tableau de bord clinique">
      <div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div>
    </AppLayout>
  );

  const d = data || {};

  return (
    <AppLayout title="Tableau de bord clinique">

      {/* ── Hero accueil ── */}
      <div style={{ marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontFamily:'var(--f-serif)', fontSize:'1.5rem', fontWeight:300, marginBottom:4 }}>
            Bonjour, <em style={{ fontStyle:'italic', color:'var(--blue)' }}>{user?.prenom}</em>
          </h1>
          <p style={{ fontSize:'.85rem', color:'var(--ink-60)' }}>
            Voici l'état postural de vos {d.totalEmployes ?? '—'} employés en temps réel.
            Actualisation automatique toutes les minutes.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" disabled={telechargementEnCours} onClick={telechargerRapport}>
          <i className="fa-solid fa-file-arrow-down" /> {telechargementEnCours ? 'Génération…' : 'Rapport hebdomadaire (CSV)'}
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', marginBottom:24 }}>
        <div className="kpi-card ok">
          <div className="kpi-label">App active</div>
          <div className="kpi-value" style={{ color:'var(--teal)' }}>{d.employesActifsAujourdhui ?? '—'}</div>
          <div className="kpi-sub">/ {d.totalEmployes ?? '—'} employés</div>
        </div>
        <div className="kpi-card warn">
          <div className="kpi-label">App inactive</div>
          <div className="kpi-value" style={{ color:'var(--warn)' }}>{d.employesAppInactive ?? '—'}</div>
          <div className="kpi-sub">Non connectés</div>
        </div>
        <div className="kpi-card" style={{ borderLeft:`3px solid ${(d.scoreMoyenEquipe ?? 0) >= 70 ? '#0B9B8A' : '#C47A00'}` }}>
          <div className="kpi-label">Score moyen</div>
          <div className="kpi-value" style={{ color: (d.scoreMoyenEquipe ?? 0) >= 70 ? '#0B9B8A' : '#C47A00' }}>
            {d.scoreMoyenEquipe ?? '—'}%
          </div>
          <div className="kpi-sub">Équipe</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-label">Posture à risque</div>
          <div className="kpi-value" style={{ color:'var(--bad)' }}>{d.employesARisquePostural ?? '—'}</div>
          <div className="kpi-sub">Score &lt; 60%</div>
        </div>
        <div className="kpi-card" style={{ borderLeft: d.conseilsUrgents > 0 ? '3px solid var(--bad)' : '3px solid var(--warn)' }}>
          <div className="kpi-label">Conseils en attente</div>
          <div className="kpi-value" style={{ color: d.conseilsUrgents > 0 ? 'var(--bad)' : 'var(--warn)' }}>
            {d.conseilsEnAttente ?? '—'}
            {d.conseilsUrgents > 0 && (
              <span style={{ fontSize:'.9rem', marginLeft:6, color:'var(--bad)' }}>
                ({d.conseilsUrgents} urgent{d.conseilsUrgents > 1 ? 's' : ''})
              </span>
            )}
          </div>
          <div className="kpi-sub">Voir l'onglet Conseils</div>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--border)', marginBottom:20 }}>
        {ONGLETS.map(t => {
          let count = 0;
          if (t.key === 'risque')   count = (d.patientsARisque || []).length;
          if (t.key === 'inactifs') count = (d.patientsInactifs || []).length;
          if (t.key === 'agenda')   count = (d.prochainRdv || []).length;
          return (
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
              {count > 0 && (
                <span style={{
                  background: t.key === 'risque' ? 'var(--bad)' : 'var(--warn)',
                  color:'white', borderRadius:20, padding:'1px 6px', fontSize:'.6rem', fontWeight:700
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Onglet : Patients à risque ── */}
      {onglet === 'risque' && (
        <div>
          {(d.patientsARisque || []).length === 0 ? (
            <div className="card"><div className="empty-state" style={{ padding:40 }}>
              <i className="fa-solid fa-check-circle" style={{ color:'var(--teal)' }} />
              <p>Aucun patient à risque postural en ce moment. Bonne posture générale !</p>
            </div></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {(d.patientsARisque || []).map(p => (
                <div key={p.userId} className="card" style={{ borderLeft: p.scorePostureGlobal < 40 ? '3px solid var(--bad)' : '3px solid var(--warn)' }}>
                  <div style={{ padding:'16px 20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                      <div>
                        <div style={{ display:'flex', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                          <span style={{ fontWeight:700, fontSize:'.92rem' }}>{p.nomComplet}</span>
                          <span className="badge gray">{p.departement}</span>
                          <span className="badge gray">{p.poste}</span>
                          {p.aConseilEnAttente && (
                            <span className={p.niveauUrgenceConseil === 'URGENT' ? 'pill-urgent' : 'badge warn'}>
                              <i className="fa-solid fa-comment-medical" style={{ marginRight:3 }} />
                              {p.niveauUrgenceConseil === 'URGENT' ? 'Conseil urgent' : 'Conseil en attente'}
                            </span>
                          )}
                        </div>
                        {p.douleursDeclarees && (
                          <div style={{ fontSize:'.74rem', color:'var(--bad)', marginBottom:8 }}>
                            <i className="fa-solid fa-circle-exclamation" style={{ marginRight:5 }} />
                            Douleurs déclarées : {p.douleursDeclarees}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:'1.4rem', fontWeight:700, color: p.scorePostureGlobal < 40 ? 'var(--bad)' : 'var(--warn)' }}>
                          {Math.round(p.scorePostureGlobal ?? 0)}%
                        </div>
                        <div style={{ fontSize:'.65rem', color:'var(--ink-60)' }}>score global</div>
                      </div>
                    </div>
                    {/* Scores par zone */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:8, marginTop:8 }}>
                      {[
                        { label:'Dos',      val: p.scoreDos      },
                        { label:'Nuque',    val: p.scoreNuque    },
                        { label:'Épaules',  val: p.scoreEpaules  },
                        { label:'Poignets', val: p.scorePoignets },
                      ].filter(s => s.val != null).map(s => (
                        <div key={s.label} style={{ background:'var(--ink-08)', borderRadius:8, padding:'8px 10px' }}>
                          <div style={{ fontSize:'.65rem', color:'var(--ink-60)', marginBottom:3 }}>{s.label}</div>
                          <div style={{ fontSize:'.9rem', fontWeight:700,
                            color: s.val >= 70 ? '#0B9B8A' : s.val >= 50 ? '#C47A00' : '#C0392B' }}>
                            {Math.round(s.val)}%
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Infos session */}
                    <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap' }}>
                      {p.dureeAssisCourantSecondes > 0 && (
                        <span style={{ fontSize:'.75rem', color: p.depassementTempsAssis ? 'var(--bad)' : 'var(--ink-60)' }}>
                          <i className="fa-solid fa-clock" style={{ marginRight:5 }} />
                          Assis depuis {Math.floor(p.dureeAssisCourantSecondes/3600)}h{String(Math.floor((p.dureeAssisCourantSecondes%3600)/60)).padStart(2,'0')}
                          {p.depassementTempsAssis && ' ⚠ Dépasse 2h !'}
                        </span>
                      )}
                      <span style={{ fontSize:'.75rem', color: p.respectePausesActives ? 'var(--teal)' : 'var(--warn)' }}>
                        <i className="fa-solid fa-person-walking" style={{ marginRight:5 }} />
                        {p.pausesEffectueesAujourdhui}/{p.pausesObjectifAujourdhui} pauses
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Onglet : Inactifs ── */}
      {onglet === 'inactifs' && (
        <div className="card">
          {(d.patientsInactifs || []).length === 0 ? (
            <div className="empty-state" style={{ padding:40 }}>
              <i className="fa-solid fa-check-circle" style={{ color:'var(--teal)' }} />
              <p>Tous les employés ont lancé l'application aujourd'hui.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employé</th><th>Département</th><th>Poste</th>
                    <th>Douleurs déclarées</th><th>État</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.patientsInactifs || []).map(p => (
                    <tr key={p.userId}>
                      <td style={{ fontWeight:600 }}>{p.nomComplet}</td>
                      <td>{p.departement}</td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{p.poste}</td>
                      <td>
                        {p.douleursDeclarees
                          ? <span style={{ fontSize:'.75rem', color:'var(--bad)' }}>{p.douleursDeclarees}</span>
                          : <span style={{ color:'var(--ink-30)' }}>—</span>}
                      </td>
                      <td><span className="badge gray">○ Inactif</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Onglet : Agenda ── */}
      {onglet === 'agenda' && (
        <div className="card">
          {(d.prochainRdv || []).length === 0 ? (
            <div className="empty-state" style={{ padding:40 }}>
              <i className="fa-solid fa-calendar" />
              <p>Aucun rendez-vous prévu dans les 7 prochains jours.</p>
            </div>
          ) : (
            <div style={{ padding:'8px 0 0' }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th><th>Heure</th><th>Patient</th><th>Département</th>
                      <th>Motif</th><th>Douleurs déclarées</th><th>Statut</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(d.prochainRdv || []).map(rdv => (
                      <tr key={rdv.id}>
                        <td style={{ fontWeight:600 }}>
                          {new Date(rdv.dateRdv).toLocaleDateString('fr-FR', { weekday:'short', day:'2-digit', month:'short' })}
                        </td>
                        <td style={{ fontWeight:700 }}>{rdv.heureDebut?.toString().substring(0,5)}</td>
                        <td style={{ fontWeight:600 }}>{rdv.nomEmploye}</td>
                        <td>{rdv.departement}</td>
                        <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{rdv.motif || '—'}</td>
                        <td>
                          {rdv.douleursDeclarees
                            ? <span style={{ fontSize:'.74rem', color:'var(--bad)' }}>{rdv.douleursDeclarees}</span>
                            : <span style={{ color:'var(--ink-30)' }}>—</span>}
                        </td>
                        <td><span className={`badge ${STATUT_BADGE[rdv.statut] || 'gray'}`}>{STATUT_LABEL[rdv.statut] || rdv.statut}</span></td>
                        <td>
                          {rdv.statut === 'CONFIRME' && (
                            <button className="btn btn-outline btn-sm"
                              onClick={() => { setNoteRdvId(rdv.id); setNoteTexte(rdv.notesSeance || ''); }}>
                              <i className="fa-solid fa-pen" /> Notes
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modale notes de séance ── */}
      {noteRdvId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,25,35,.5)', display:'flex',
          alignItems:'center', justifyContent:'center', zIndex:200, padding:20, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'white', borderRadius:14, padding:28, maxWidth:480, width:'100%',
            boxShadow:'0 20px 60px rgba(15,25,35,.2)' }}>
            <h3 style={{ fontFamily:'var(--f-serif)', fontSize:'1.1rem', fontWeight:300, marginBottom:14 }}>
              Notes de séance
            </h3>
            <textarea className="form-textarea" rows={5}
              placeholder="Observations cliniques, exercices donnés, évolution, consignes de suivi…"
              value={noteTexte} onChange={e => setNoteTexte(e.target.value)} />
            <div style={{ display:'flex', gap:10, marginTop:14 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={enregistrerNotes}>
                <i className="fa-solid fa-save" /> Enregistrer
              </button>
              <button className="btn btn-outline" onClick={() => setNoteRdvId(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
