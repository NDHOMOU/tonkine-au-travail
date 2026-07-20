/**
 * Dashboard Employé — données 100% issues de l'API Spring Boot
 * Intègre : timer 2h, détection posture TensorFlow.js, alertes, exercices
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth }               from '../../context/AuthContext';
import { dashboardApi }          from '../../api/dashboardApi';
import { postureApi }            from '../../api/postureApi';
import { useTimer }              from '../../hooks/useTimer';
import { usePostureDetection }   from '../../hooks/usePostureDetection';
import AppLayout                 from '../../components/layout/AppLayout';
import toast                     from 'react-hot-toast';

export default function DashboardEmploye() {
  const { user }                = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [alerteOuverte, setAlerteOuverte] = useState(false);
  const [alerteActive, setAlerteActive]   = useState(null);

  // ── Charge les données du tableau de bord ──
  const chargerDashboard = useCallback(async () => {
    try {
      const { data } = await dashboardApi.getDashboardEmploye();
      setDashboard(data);
    } catch (err) {
      toast.error('Impossible de charger le tableau de bord.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { chargerDashboard(); }, [chargerDashboard]);

  // ── Timer 2h ──
  const { formatted, progressPct, reset: resetTimer } = useTimer({
    onAlert: () => {
      setAlerteOuverte(true);
      jouerSon();
    },
  });

  // ── Détection posture TensorFlow.js ──
  const { isActive, activer, desactiver, lastScores, videoRef } =
    usePostureDetection({
      sessionId:       dashboard?.sessionId,
      profil:          null,
      onPostureChange: (scores) => {
        // Met à jour les scores en temps réel (sans re-fetch complet)
        setDashboard(prev => prev ? { ...prev, ...scores } : prev);
      },
      onStanding: () => {
        // Détection debout → remet le timer à zéro
        resetTimer();
      },
    });

  // ── Confirmation pause ──
  const confirmerPause = async () => {
    try {
      if (alerteActive?.id) {
        await postureApi.confirmerPause(alerteActive.id);
      }
      resetTimer();
      setAlerteOuverte(false);
      toast.success('Pause enregistrée — bon retour au travail !');
      chargerDashboard(); // Rafraîchit les stats
    } catch {
      // La confirmation locale suffit si l'API est momentanément indisponible
      resetTimer();
      setAlerteOuverte(false);
    }
  };

  const snoozer = async () => {
    try {
      if (alerteActive?.id) {
        await postureApi.snoozer(alerteActive.id, 600);
      }
      setAlerteOuverte(false);
      toast('Rappel dans 10 minutes.', { icon: '⏱' });
    } catch {
      setAlerteOuverte(false);
    }
  };

  const jouerSon = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [523, 659, 784].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq;
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.15, t + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        o.start(t); o.stop(t + 0.5);
      });
    } catch {}
  };

  if (loading) return (
    <AppLayout title="Mon tableau de bord">
      <div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div>
    </AppLayout>
  );
  if (!dashboard) return null;

  const exerciceAlerte = dashboard.alertesSession?.[0]?.exerciceSuggere
    || dashboard.exercicesDuJour?.[0]
    || null;

  const scoreGlobal = dashboard.scoreGlobal ?? 0;
  const scoreColor  = scoreGlobal >= 80 ? 'var(--teal)' : scoreGlobal >= 60 ? 'var(--warn)' : 'var(--bad)';
  const scoreLabel  = scoreGlobal >= 80 ? 'Bonne posture' : scoreGlobal >= 60 ? 'Posture à surveiller' : 'Posture critique — agissez';

  return (
    <AppLayout title="Mon tableau de bord">

      {/* ── Bannière score + timer ── */}
      <div className="card" style={{ marginBottom: 20, borderLeft: `4px solid ${scoreColor}` }}>
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--ink-60)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h2 style={{ fontFamily: 'var(--f-serif)', fontSize: '1.35rem', fontWeight: 300, marginBottom: 14, color: scoreColor }}>
              {scoreLabel}
            </h2>
            {/* Scores par zone */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Dos',      val: dashboard.scoreDosColonne },
                { label: 'Nuque',    val: dashboard.scoreNuque      },
                { label: 'Épaules',  val: dashboard.scoreEpaules    },
                { label: 'Poignets', val: dashboard.scorePoignets   },
                { label: 'Hanches',  val: dashboard.scoreHanches    },
              ].filter(s => s.val != null).map(s => (
                <div key={s.label} style={{ background: 'var(--ink-08)', borderRadius: 8, padding: '6px 12px', minWidth: 70, textAlign: 'center' }}>
                  <div style={{ fontSize: '.6rem', color: 'var(--ink-60)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: '.88rem', fontWeight: 700,
                    color: s.val >= 80 ? '#0B9B8A' : s.val >= 60 ? '#C47A00' : '#C0392B' }}>
                    {Math.round(s.val)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Score global ring */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: scoreColor }}>
              {Math.round(scoreGlobal)}
            </div>
            <div style={{ fontSize: '.7rem', color: 'var(--ink-60)' }}>/ 100</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>

        {/* ── Surveillance webcam + timer ── */}
        <div className="card">
          <div className="card-head">
            <h3>Surveillance posturale</h3>
            <span className={`badge ${isActive ? 'green' : 'gray'}`}>
              {isActive ? '● Active' : '○ Inactive'}
            </span>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            {/* Webcam */}
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden',
              background: 'var(--ink)', height: 180, marginBottom: 14 }}>
              <video ref={videoRef} autoPlay muted playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: isActive ? 'block' : 'none' }} />
              {!isActive && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)', gap: 8 }}>
                  <i className="fa-solid fa-video-slash" style={{ fontSize: '1.6rem' }} />
                  <span style={{ fontSize: '.75rem' }}>Caméra désactivée</span>
                </div>
              )}
            </div>
            {/* Timer */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '.72rem', color: 'var(--ink-60)' }}>Assis depuis</span>
                <span style={{ fontSize: '.8rem', fontWeight: 700,
                  color: progressPct > 80 ? 'var(--bad)' : progressPct > 50 ? 'var(--warn)' : 'var(--teal)' }}>
                  {formatted}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--ink-08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, transition: 'width .5s',
                  width: `${progressPct}%`,
                  background: progressPct < 50 ? 'var(--teal)' : progressPct < 80 ? 'var(--warn)' : 'var(--bad)' }} />
              </div>
              <div style={{ fontSize: '.65rem', color: 'var(--ink-30)', marginTop: 4 }}>Alerte à 2h00</div>
            </div>
            <button className={`btn ${isActive ? 'btn-outline' : 'btn-teal'}`} style={{ width: '100%' }}
              onClick={isActive ? desactiver : activer}>
              <i className={`fa-solid ${isActive ? 'fa-video-slash' : 'fa-video'}`} />
              {isActive ? 'Désactiver la surveillance' : 'Activer la surveillance'}
            </button>
          </div>
        </div>

        {/* ── KPIs session ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="kpi-card ok">
            <div className="kpi-label">Pauses effectuées</div>
            <div className="kpi-value" style={{ color: 'var(--teal)' }}>
              {dashboard.nombrePausesEffectuees ?? 0}
            </div>
            <div className="kpi-sub">Objectif : 4 / jour</div>
          </div>
          <div className="kpi-card" style={{ borderLeft: '3px solid var(--blue)' }}>
            <div className="kpi-label">Exercices complétés</div>
            <div className="kpi-value" style={{ color: 'var(--blue)' }}>
              {dashboard.exercicesCompletesAujourdhui ?? 0}
            </div>
            <div className="kpi-sub">Aujourd'hui</div>
          </div>
          <div className={`kpi-card ${(dashboard.alertesSession ?? []).length > 0 ? 'warn' : 'ok'}`}>
            <div className="kpi-label">Alertes posture</div>
            <div className="kpi-value" style={{ color: (dashboard.alertesSession ?? []).length > 0 ? 'var(--warn)' : 'var(--teal)' }}>
              {(dashboard.alertesSession ?? []).length}
            </div>
            <div className="kpi-sub">Non traitées</div>
          </div>
        </div>
      </div>

      {/* ── Exercices du jour ── */}
      <div className="card">
        <div className="card-head">
          <h3>Exercices du jour</h3>
          <a href="/employe/exercices" style={{ fontSize: '.75rem', color: 'var(--blue)', textDecoration: 'none' }}>
            Voir tout →
          </a>
        </div>
        <div style={{ padding: '8px 0 0' }}>
          {(dashboard.exercicesDuJour ?? []).length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <i className="fa-solid fa-dumbbell" />
              <p>Aucun exercice assigné aujourd'hui.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <tbody>
                  {(dashboard.exercicesDuJour ?? []).map(ex => (
                    <tr key={ex.id}>
                      <td style={{ width: 44, padding: '10px 12px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'var(--sand)' }}>
                          {ex.urlImage
                            ? <img src={ex.urlImage} alt={ex.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa-solid fa-dumbbell" style={{ color: 'var(--ink-30)' }} />
                              </div>}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{ex.titre}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--ink-60)' }}>
                          {ex.zone?.replace('_', ' ')} · {ex.dureeMinutes} min
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: 16 }}>
                        <button className="btn btn-teal btn-sm"
                          onClick={() => toast.success(`"${ex.titre}" démarré !`)}>
                          <i className="fa-solid fa-play" /> Commencer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══ MODALE ALERTE PAUSE 2H ══ */}
      {alerteOuverte && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, padding: 20, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 480, width: '100%',
            overflow: 'hidden', boxShadow: '0 30px 80px rgba(15,25,35,.25)' }}>
            {/* Image hero */}
            <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=580&h=200&fit=crop"
                alt="Pause active" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(15,25,35,.7))',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '16px 20px' }}>
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.2)',
                  backdropFilter: 'blur(4px)', borderRadius: 20, padding: '3px 12px',
                  fontSize: '.7rem', color: 'white', marginBottom: 6, width: 'fit-content' }}>
                  ⏰ 2 heures de position assise
                </div>
                <h2 style={{ color: 'white', fontFamily: 'var(--f-serif)', fontWeight: 300, fontSize: '1.2rem' }}>
                  {user?.prenom}, il est temps de bouger !
                </h2>
              </div>
            </div>
            {/* Corps */}
            <div style={{ padding: 24 }}>
              {exerciceAlerte && (
                <div style={{ background: 'var(--teal-bg)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--teal)', marginBottom: 4 }}>EXERCICE SUGGÉRÉ</div>
                  <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 2 }}>
                    {exerciceAlerte.titre} — {exerciceAlerte.dureeMinutes} min
                  </div>
                  <p style={{ fontSize: '.78rem', color: 'var(--ink-60)', lineHeight: 1.55 }}>
                    {exerciceAlerte.description}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-teal" style={{ flex: 1 }} onClick={confirmerPause}>
                  <i className="fa-solid fa-person-walking" /> Commencer ma pause
                </button>
                <button className="btn btn-outline" onClick={snoozer}>
                  <i className="fa-solid fa-clock" /> Dans 10 min
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
