/**
 * AideDecision — Tendances de posture par département, employés en
 * dégradation, taux de suivi des alertes. Dérivé des sessions/alertes déjà
 * collectées — pas de donnée sensible (pas d'âge).
 */
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import AppLayout     from '../../components/layout/AppLayout';
import toast          from 'react-hot-toast';

export default function AideDecision() {
  const [analyse, setAnalyse] = useState(null);
  const [loading, setLoading] = useState(true);

  const charger = useCallback(async () => {
    try {
      const { data } = await adminApi.getAnalyseDecision();
      setAnalyse(data);
    } catch { toast.error('Impossible de charger l\'analyse de tendance.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  if (loading) return <AppLayout title="Aide à la décision"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Aide à la décision">
      <div className="card">
        <div className="card-head" style={{ paddingBottom:0 }}>
          <h3>Tendances</h3>
          <button className="btn btn-outline btn-sm" onClick={charger}>
            <i className="fa-solid fa-rotate" /> Actualiser
          </button>
        </div>
        <div style={{ padding:'8px 20px 20px' }}>
          {!analyse || analyse.donneesInsuffisantes ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-chart-line" />
              <p>Pas encore assez de sessions enregistrées sur plusieurs semaines pour dégager une tendance fiable.</p>
            </div>
          ) : (
            <>
              {analyse.tendanceParDepartement.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize:'.85rem', marginBottom:10 }}>Score de posture moyen par département</h4>
                  {analyse.tendanceParDepartement.map(dept => (
                    <div key={dept.departement} style={{ marginBottom:14 }}>
                      <div style={{ fontSize:'.78rem', fontWeight:600, marginBottom:4 }}>{dept.departement}</div>
                      <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:60 }}>
                        {dept.points.map((p, i) => (
                          <div key={i} title={`${p.semaine} : ${p.valeur ?? '—'}%`}
                            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                            <div style={{
                              width:'100%', maxWidth:28,
                              height: p.valeur != null ? Math.max((p.valeur/100)*50, 3) : 2,
                              background: p.valeur == null ? 'var(--ink-10, #eee)'
                                : p.valeur < 60 ? '#C0392B' : p.valeur < 80 ? '#E1A100' : '#0B9B8A',
                              borderRadius:3,
                            }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        {dept.points.map((p, i) => (
                          <div key={i} style={{ flex:1, textAlign:'center', fontSize:'.65rem', color:'var(--ink-60)' }}>
                            {p.valeur != null ? `${p.valeur}%` : '—'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize:'.85rem', marginBottom:10 }}>Employés dont la posture se dégrade</h4>
                {analyse.employesADegradation.length === 0 ? (
                  <p style={{ fontSize:'.8rem', color:'var(--ink-60)' }}>Aucun signal de dégradation détecté sur la période.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Employé</th><th>Département</th><th>2 dern. semaines</th><th>2 semaines préc.</th><th>Variation</th></tr>
                      </thead>
                      <tbody>
                        {analyse.employesADegradation.map((e, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight:600 }}>{e.nomComplet}</td>
                            <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{e.departement || '—'}</td>
                            <td>{e.scoreRecent}%</td>
                            <td>{e.scorePrecedent}%</td>
                            <td><span className="badge" style={{ background:'#FCE8E6', color:'#C0392B' }}>{e.variation}%</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize:'.85rem', marginBottom:10 }}>Taux d'alertes suivies d'une pause</h4>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {analyse.tauxSuiviAlertes.map((p, i) => (
                    <div key={i} style={{ fontSize:'.78rem', color:'var(--ink-60)' }}>
                      {p.semaine} : <strong style={{ color:'var(--ink-90, #111)' }}>{p.valeur != null ? `${p.valeur}%` : '—'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
