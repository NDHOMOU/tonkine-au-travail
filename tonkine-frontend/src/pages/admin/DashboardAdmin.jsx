/**
 * DashboardAdmin — Tableau de bord RH
 * Vue globale de la santé posturale de l'entreprise
 */
import { useState, useEffect, useCallback } from 'react';
import { adminApi }  from '../../api/adminApi';
import AppLayout     from '../../components/layout/AppLayout';
import toast         from 'react-hot-toast';

export default function DashboardAdmin() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [envoi,   setEnvoi]   = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data: d } = await adminApi.getDashboard();
      setData(d);
    } catch { toast.error('Impossible de charger le tableau de bord.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const envoyerAlerte = async () => {
    if (!message.trim()) { toast.error('Rédigez un message.'); return; }
    setEnvoi(true);
    try {
      const { data: r } = await adminApi.envoyerAlerteCollective(message);
      toast.success(`Message envoyé à ${r.envoyees} employé(s) actifs.`);
      setMessage('');
    } catch { toast.error('Impossible d\'envoyer l\'alerte.'); }
    finally { setEnvoi(false); }
  };

  if (loading) return <AppLayout title="Tableau de bord RH"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  const d = data || {};

  return (
    <AppLayout title="Tableau de bord RH">

      {/* ── KPIs ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))' }}>
        <div className="kpi-card blue">
          <div className="kpi-label">Employés inscrits</div>
          <div className="kpi-value">{d.totalEmployesInscrits ?? '—'}</div>
          <div className="kpi-sub">Total dans l'entreprise</div>
        </div>
        <div className="kpi-card ok">
          <div className="kpi-label">Actifs aujourd'hui</div>
          <div className="kpi-value">{d.totalEmployesActifsAujourdhui ?? '—'}</div>
          <div className="kpi-sub">App lancée</div>
        </div>
        <div className="kpi-card" style={{ borderLeft: `3px solid ${(d.scoreMoyenEquipe ?? 0) >= 70 ? '#0B9B8A' : '#C47A00'}` }}>
          <div className="kpi-label">Score moyen équipe</div>
          <div className="kpi-value" style={{ color: (d.scoreMoyenEquipe ?? 0) >= 70 ? '#0B9B8A' : '#C47A00' }}>
            {d.scoreMoyenEquipe ?? '—'}%
          </div>
          <div className="kpi-sub">Posture globale</div>
        </div>
        <div className="kpi-card warn">
          <div className="kpi-label">Alertes non traitées</div>
          <div className="kpi-value" style={{ color:'var(--warn)' }}>{d.alertesActivesNonTraitees ?? '—'}</div>
          <div className="kpi-sub">Nécessitent attention</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-label">Employés à risque</div>
          <div className="kpi-value" style={{ color:'var(--bad)' }}>{d.employesARisqueEleve ?? '—'}</div>
          <div className="kpi-sub">Score postural &lt; 60%</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap:20, marginBottom:20 }}>

        {/* ── Stats par département ── */}
        <div className="card">
          <div className="card-head"><h3>Statistiques par département</h3></div>
          <div style={{ padding:'8px 0 0' }}>
            {(d.statsDepartements || []).length === 0 ? (
              <div className="empty-state" style={{ padding:30 }}>
                <i className="fa-solid fa-building" />
                <p>Aucune session active aujourd'hui</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Département</th>
                      <th>Employés actifs</th>
                      <th>Score moyen</th>
                      <th>Niveau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(d.statsDepartements || []).map(dept => (
                      <tr key={dept.departement}>
                        <td style={{ fontWeight:600 }}>{dept.departement}</td>
                        <td>{dept.nombreEmployes}</td>
                        <td style={{ fontWeight:700, color: dept.scoreMoyen >= 70 ? '#0B9B8A' : '#C47A00' }}>
                          {Math.round(dept.scoreMoyen)}%
                        </td>
                        <td>
                          <span className={`badge ${dept.scoreMoyen >= 70 ? 'green' : dept.scoreMoyen >= 50 ? 'warn' : 'danger'}`}>
                            {dept.scoreMoyen >= 70 ? 'Bon' : dept.scoreMoyen >= 50 ? 'À surveiller' : 'Risque élevé'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Alerte collective ── */}
        <div className="card">
          <div className="card-head"><h3>Alerte collective</h3></div>
          <div className="card-body" style={{ paddingTop:14 }}>
            <p style={{ fontSize:'.8rem', color:'var(--ink-60)', marginBottom:14, lineHeight:1.6 }}>
              Envoyez un message instantané à tous les employés actifs — rappel de pause, annonce, consigne de sécurité.
            </p>
            <textarea className="form-textarea" rows={4}
              placeholder="Ex : Il est 15h, prenez une pause de 10 minutes et faites vos exercices cervicaux."
              value={message} onChange={e => setMessage(e.target.value)} />
            <button className="btn btn-primary" style={{ marginTop:12, width:'100%' }}
              disabled={!message.trim() || envoi} onClick={envoyerAlerte}>
              {envoi
                ? <><i className="fa-solid fa-spinner fa-spin" /> Envoi en cours…</>
                : <><i className="fa-solid fa-bullhorn" /> Envoyer à tous ({d.totalEmployesActifsAujourdhui ?? 0} actifs)</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Suivi des employés ── */}
      <div className="card">
        <div className="card-head" style={{ paddingBottom:0 }}>
          <h3>Suivi des employés actifs</h3>
          <button className="btn btn-outline btn-sm" onClick={charger}>
            <i className="fa-solid fa-rotate" /> Actualiser
          </button>
        </div>
        <div style={{ padding:'8px 0 0' }}>
          {(d.employes || []).length === 0 ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-users" />
              <p>Aucun employé actif pour le moment.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Département</th>
                    <th>Poste</th>
                    <th>Score posture</th>
                    <th>Temps assis</th>
                    <th>Pauses</th>
                    <th>Session</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.employes || []).map(emp => {
                    const heures = Math.floor((emp.dureeAssisCourantSecondes || 0) / 3600);
                    const mins   = Math.floor(((emp.dureeAssisCourantSecondes || 0) % 3600) / 60);
                    const pauseOk = (emp.pausesEffectueesAujourdhui || 0) >= (emp.pausesObjectifAujourdhui || 4);
                    return (
                      <tr key={emp.userId}>
                        <td style={{ fontWeight:600 }}>{emp.nomComplet}</td>
                        <td>{emp.departement}</td>
                        <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{emp.poste}</td>
                        <td>
                          {emp.scorePostureGlobal != null ? (
                            <span style={{ fontWeight:700, color: emp.scorePostureGlobal >= 70 ? '#0B9B8A' : emp.scorePostureGlobal >= 50 ? '#C47A00' : '#C0392B' }}>
                              {Math.round(emp.scorePostureGlobal)}%
                            </span>
                          ) : <span style={{ color:'var(--ink-30)' }}>—</span>}
                        </td>
                        <td style={{ fontWeight: heures >= 2 ? 700 : 400, color: heures >= 2 ? 'var(--bad)' : 'var(--ink)' }}>
                          {`${heures}h${String(mins).padStart(2,'0')}`}
                        </td>
                        <td>
                          <span className={`badge ${pauseOk ? 'green' : 'warn'}`}>
                            {emp.pausesEffectueesAujourdhui}/{emp.pausesObjectifAujourdhui}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${emp.sessionActive ? 'green' : 'gray'}`}>
                            {emp.sessionActive ? '● En ligne' : '○ Hors ligne'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Alertes récentes ── */}
      {(d.alertesRecentes || []).length > 0 && (
        <div className="card" style={{ marginTop:20 }}>
          <div className="card-head"><h3>Alertes récentes non traitées</h3></div>
          <div style={{ padding:'8px 0 0' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Employé</th><th>Département</th><th>Type</th><th>Score</th><th>Durée assise</th><th>Heure</th></tr>
                </thead>
                <tbody>
                  {(d.alertesRecentes || []).map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight:600 }}>{a.nomEmploye}</td>
                      <td>{a.departement}</td>
                      <td><span className="badge warn">{a.type?.replace('_',' ')}</span></td>
                      <td>{a.scorePosture != null ? `${Math.round(a.scorePosture)}%` : '—'}</td>
                      <td>{a.dureeAssiSecondes ? `${Math.floor(a.dureeAssiSecondes/3600)}h${String(Math.floor((a.dureeAssiSecondes%3600)/60)).padStart(2,'0')}` : '—'}</td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>
                        {new Date(a.dateEnvoi).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
