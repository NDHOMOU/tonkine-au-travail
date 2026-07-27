/**
 * MesProgres — Évolution personnelle de l'employé dans le temps (son propre
 * score de posture, ses propres pauses) — équivalent individuel de l'aide à
 * la décision de l'admin.
 */
import { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import AppLayout          from '../../components/layout/AppLayout';
import toast               from 'react-hot-toast';

export default function MesProgres() {
  const [progres, setProgres] = useState(null);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getMesProgres()
      .then(r => setProgres(r.data))
      .catch(() => toast.error('Impossible de charger vos progrès.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout title="Mes progrès"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Mes progrès">
      <div className="page-hero" style={{ marginBottom: 24 }}>
        <div className="ph-text">
          <div className="ph-eyebrow">Votre évolution</div>
          <h1>Suis-je en <em>progrès</em> ?</h1>
          <p>Votre score de posture et vos pauses, semaine par semaine, sur les 6 dernières semaines.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Tendances</h3></div>
        <div style={{ padding:'8px 20px 20px' }}>
          {!progres || progres.donneesInsuffisantes ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-chart-line" />
              <p>Pas encore assez de sessions enregistrées sur plusieurs semaines pour dégager une tendance fiable — revenez dans quelques jours d'utilisation régulière.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize:'.85rem', marginBottom:10 }}>Score de posture moyen</h4>
                <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:80 }}>
                  {progres.tendanceScore.map((p, i) => (
                    <div key={i} title={`${p.semaine} : ${p.valeur ?? '—'}%`}
                      style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{
                        width:'100%', maxWidth:36,
                        height: p.valeur != null ? Math.max((p.valeur/100)*70, 4) : 2,
                        background: p.valeur == null ? 'var(--ink-10, #eee)'
                          : p.valeur < 60 ? '#C0392B' : p.valeur < 80 ? '#E1A100' : '#0B9B8A',
                        borderRadius:4,
                      }} />
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  {progres.tendanceScore.map((p, i) => (
                    <div key={i} style={{ flex:1, textAlign:'center', fontSize:'.62rem', color:'var(--ink-60)' }}>
                      {p.valeur != null ? `${p.valeur}%` : '—'}
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8, marginTop:2 }}>
                  {progres.tendanceScore.map((p, i) => (
                    <div key={i} style={{ flex:1, textAlign:'center', fontSize:'.58rem', color:'var(--ink-30)' }}>
                      {p.semaine.replace('Il y a ', '-').replace(' semaines', 's').replace(' semaine', 's')}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize:'.85rem', marginBottom:10 }}>Pauses effectuées</h4>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {progres.tendancePauses.map((p, i) => (
                    <div key={i} style={{ fontSize:'.78rem', color:'var(--ink-60)' }}>
                      {p.semaine} : <strong style={{ color:'var(--ink-90, #111)' }}>{p.valeur != null ? Math.round(p.valeur) : 0}</strong>
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
