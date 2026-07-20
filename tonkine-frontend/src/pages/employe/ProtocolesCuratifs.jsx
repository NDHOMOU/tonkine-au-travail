/**
 * ProtocolesCuratifs — Protocoles de rééducation multi-semaines
 * - Menu latéral par zone corporelle
 * - Protocoles avec progression par semaine
 * - Étapes verrouillées / déverrouillées
 */
import { useState, useEffect, useCallback } from 'react';
import AppLayout  from '../../components/layout/AppLayout';
import client     from '../../api/client';
import toast      from 'react-hot-toast';

const ZONES_MENU = [
  { value: 'DOS_LOMBAIRES',       label: 'Dos / Lombaires',  icon: 'fa-spine'           },
  { value: 'NUQUE_CERVICALES',    label: 'Nuque / Cervicales', icon: 'fa-head-side'      },
  { value: 'EPAULES',             label: 'Épaules',          icon: 'fa-person-rays'      },
  { value: 'POIGNETS_AVANT_BRAS', label: 'Poignets',         icon: 'fa-hand'             },
  { value: 'HANCHES_BASSIN',      label: 'Hanches / Bassin', icon: 'fa-person-walking'   },
];

export default function ProtocolesCuratifs() {
  const [zoneActive,    setZoneActive]    = useState('DOS_LOMBAIRES');
  const [protocoles,    setProtocoles]    = useState([]);
  const [progressions,  setProgressions]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [alerteDouleur, setAlerteDouleur] = useState(true);

  const charger = useCallback(async () => {
    try {
      const [pRes, prRes] = await Promise.all([
        client.get('/curatif/protocoles', { params: { zone: zoneActive } }),
        client.get('/curatif/mes-progressions'),
      ]);
      setProtocoles(pRes.data || []);
      setProgressions(prRes.data || []);
    } catch { toast.error('Impossible de charger les protocoles.'); }
    finally { setLoading(false); }
  }, [zoneActive]);

  useEffect(() => { charger(); }, [charger]);

  const demarrerProtocole = async (protocoleId) => {
    try {
      await client.post(`/curatif/protocoles/${protocoleId}/demarrer`);
      toast.success('Protocole démarré ! Bonne progression.');
      charger();
    } catch { toast.error('Impossible de démarrer le protocole.'); }
  };

  const getProgression = (protocoleId) =>
    progressions.find(p => p.protocoleId === protocoleId);

  return (
    <AppLayout title="Protocoles curatifs">

      {/* Alerte douleur */}
      {alerteDouleur && (
        <div className="inline-alert danger" style={{ marginBottom:20 }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ marginTop:1, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <strong>Douleur active détectée</strong>
            <div style={{ fontSize:'.78rem', marginTop:2 }}>
              Votre profil indique des douleurs déclarées. Ces protocoles sont des compléments — consultez votre kinésithérapeute pour un suivi personnalisé.
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ flexShrink:0 }}
            onClick={() => setAlerteDouleur(false)}>
            ✕
          </button>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20 }}>

        {/* ── Menu zones ── */}
        <div>
          <div style={{ fontSize:'.65rem', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'.08em', color:'var(--ink-60)', marginBottom:8, paddingLeft:4 }}>
            Zone corporelle
          </div>
          {ZONES_MENU.map(z => (
            <button key={z.value}
              onClick={() => setZoneActive(z.value)}
              style={{
                display:'flex', alignItems:'center', gap:10,
                width:'100%', padding:'10px 12px', borderRadius:9,
                border: zoneActive === z.value ? '1px solid var(--blue)' : '1px solid transparent',
                background: zoneActive === z.value ? 'var(--sky)' : 'transparent',
                color: zoneActive === z.value ? 'var(--blue)' : 'var(--ink-60)',
                fontFamily:'var(--f-sans)', fontSize:'.8rem', fontWeight: zoneActive === z.value ? 700 : 500,
                cursor:'pointer', marginBottom:4, transition:'all .15s',
              }}>
              <i className={`fa-solid ${z.icon}`} style={{ fontSize:'.76rem', width:16 }} />
              {z.label}
            </button>
          ))}
        </div>

        {/* ── Protocoles ── */}
        <div>
          {loading ? (
            <div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div>
          ) : protocoles.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding:40 }}>
                <i className="fa-solid fa-kit-medical" />
                <p>Aucun protocole disponible pour cette zone.</p>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {protocoles.map(proto => {
                const prog = getProgression(proto.id);
                const enCours = !!prog;
                const pct = enCours
                  ? Math.round((prog.etapesCompletees / Math.max(prog.etapesTotales,1)) * 100) : 0;

                return (
                  <div key={proto.id} className="card">
                    <div style={{ padding:'20px 22px' }}>
                      {/* Header */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                        <div>
                          <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                            <span className="badge blue">{proto.zone?.replace('_',' ')}</span>
                            <span className="badge gray">
                              <i className="fa-solid fa-calendar" /> {proto.dureeSemaines} semaines
                            </span>
                            {enCours && <span className="badge green">En cours — S{prog.semaineCourante}</span>}
                          </div>
                          <h3 style={{ fontFamily:'var(--f-serif)', fontSize:'1.05rem', fontWeight:300 }}>
                            {proto.titre}
                          </h3>
                        </div>
                        {!enCours && (
                          <button className="btn btn-primary btn-sm"
                            onClick={() => demarrerProtocole(proto.id)}>
                            <i className="fa-solid fa-play" /> Démarrer
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize:'.8rem', color:'var(--ink-60)', lineHeight:1.6, marginBottom:14 }}>
                        {proto.description}
                      </p>

                      {/* Progression si en cours */}
                      {enCours && (
                        <div style={{ marginBottom:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                            <span style={{ fontSize:'.74rem', fontWeight:600 }}>Progression globale</span>
                            <span style={{ fontSize:'.74rem', color:'var(--teal)', fontWeight:700 }}>{pct}%</span>
                          </div>
                          <div style={{ height:6, borderRadius:3, background:'var(--ink-08)', overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:3, background:'var(--teal)', width:`${pct}%`, transition:'width .4s' }} />
                          </div>
                          <div style={{ fontSize:'.7rem', color:'var(--ink-60)', marginTop:4 }}>
                            {prog.etapesCompletees} / {prog.etapesTotales} étapes · Semaine {prog.semaineCourante} sur {proto.dureeSemaines}
                          </div>
                        </div>
                      )}

                      {/* Avertissement médical */}
                      {proto.avertissementMedical && (
                        <div className="inline-alert warn" style={{ fontSize:'.75rem', marginBottom:0 }}>
                          <i className="fa-solid fa-circle-info" style={{ flexShrink:0 }} />
                          {proto.avertissementMedical}
                        </div>
                      )}

                      {/* Semaines du protocole */}
                      {enCours && proto.etapes && (
                        <div style={{ marginTop:16 }}>
                          <div style={{ fontSize:'.72rem', fontWeight:700, color:'var(--ink-60)', marginBottom:10,
                            textTransform:'uppercase', letterSpacing:'.06em' }}>
                            Programme semaine par semaine
                          </div>
                          {[...new Set((proto.etapes || []).map(e => e.semaine))].sort().map(sem => {
                            const etapesSem = (proto.etapes || []).filter(e => e.semaine === sem);
                            const estVerrouille = sem > prog.semaineCourante;
                            return (
                              <div key={sem} style={{
                                borderRadius:10, border:`1px solid var(--border)`,
                                padding:'12px 16px', marginBottom:8,
                                opacity: estVerrouille ? 0.5 : 1,
                                background: sem === prog.semaineCourante ? 'var(--sky)' : 'transparent',
                              }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                                  <span style={{ fontSize:'.78rem', fontWeight:700 }}>
                                    {estVerrouille ? <i className="fa-solid fa-lock" style={{ marginRight:6, fontSize:'.7rem' }} /> : null}
                                    {etapesSem[0]?.labelSemaine || `Semaine ${sem}`}
                                  </span>
                                  {sem === prog.semaineCourante && <span className="badge green">Semaine active</span>}
                                </div>
                                {etapesSem.map(e => (
                                  <div key={e.id} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                                    <i className="fa-solid fa-circle-check" style={{ color:'var(--teal)', fontSize:'.7rem', flexShrink:0 }} />
                                    <span style={{ fontSize:'.75rem', color:'var(--ink-60)' }}>
                                      {e.exercice?.titre || 'Exercice'} — {e.frequence}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
