/**
 * MaPosture — Analyse posturale détaillée de l'employé
 * - Score global + par zone corporelle
 * - Surveillance webcam live (TensorFlow.js MoveNet)
 * - Historique des 7 dernières sessions
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth }              from '../../context/AuthContext';
import { dashboardApi }         from '../../api/dashboardApi';
import { usePostureDetection }  from '../../hooks/usePostureDetection';
import { useTimer }             from '../../hooks/useTimer';
import AppLayout                from '../../components/layout/AppLayout';
import toast                    from 'react-hot-toast';

const ZONES = [
  { key: 'scoreDosColonne', label: 'Dos / Colonne',   icon: 'fa-spine' },
  { key: 'scoreNuque',      label: 'Nuque / Cou',      icon: 'fa-head-side' },
  { key: 'scoreEpaules',    label: 'Épaules',          icon: 'fa-person-rays' },
  { key: 'scorePoignets',   label: 'Poignets',         icon: 'fa-hand' },
  { key: 'scoreHanches',    label: 'Hanches',          icon: 'fa-person-walking' },
  { key: 'scoreYeux',       label: 'Yeux / Vision',    icon: 'fa-eye' },
];

function ScoreRing({ value, size = 100 }) {
  const pct  = Math.min(Math.max(value ?? 0, 0), 100);
  const r    = 38;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  const color = pct >= 80 ? '#0B9B8A' : pct >= 60 ? '#C47A00' : '#C0392B';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(15,25,35,.08)" strokeWidth="8"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      <text x="50" y="54" textAnchor="middle" fill={color}
        fontSize="20" fontWeight="700" style={{ transform: 'rotate(90deg) translate(0, -100px)' }}>
        {Math.round(pct)}
      </text>
    </svg>
  );
}

export default function MaPosture() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [liveScores, setLiveScores] = useState({});

  const charger = useCallback(async () => {
    try {
      const { data } = await dashboardApi.getDashboardEmploye();
      setDashboard(data);
    } catch { toast.error('Impossible de charger les données posturales.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const { formatted, progressPct, reset: resetTimer } = useTimer({ onAlert: () => {} });

  const { isActive, activer, desactiver, lastScores, videoRef } = usePostureDetection({
    sessionId: dashboard?.sessionId,
    profil: null,
    onPostureChange: (scores) => setLiveScores(scores),
    onStanding: resetTimer,
  });

  const scores = { ...dashboard, ...Object.fromEntries(
    Object.entries(liveScores).map(([k, v]) => {
      const map = { NUQUE_CERVICALES: 'scoreNuque', DOS_LOMBAIRES: 'scoreDosColonne', EPAULES: 'scoreEpaules' };
      return [map[k] || k, v];
    })
  )};

  if (loading) return <AppLayout title="Ma posture"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  const global = scores?.scoreGlobal ?? 0;
  const statutGlobal = global >= 80 ? { label: 'Excellente posture', color: '#0B9B8A' }
    : global >= 60 ? { label: 'Posture correcte', color: '#C47A00' }
    : { label: 'Posture à risque', color: '#C0392B' };

  return (
    <AppLayout title="Ma posture">

      {/* ── Bannière hero ── */}
      <div className="page-hero" style={{ marginBottom: 24 }}>
        <div className="ph-text">
          <div className="ph-eyebrow">Analyse posturale</div>
          <h1>Bonjour <em>{user?.prenom}</em>,<br />voici votre état postural</h1>
          <p>La surveillance en temps réel via votre webcam permet de détecter les déviations posturales et de vous alerter avant qu'elles ne deviennent douloureuses.</p>
        </div>
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(15,25,35,.08)" strokeWidth="9"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke={statutGlobal.color} strokeWidth="9"
                strokeDasharray={`${2*Math.PI*40*(global/100)} ${2*Math.PI*40}`} strokeLinecap="round"/>
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'1.6rem', fontWeight:700, color: statutGlobal.color }}>{Math.round(global)}</span>
              <span style={{ fontSize:'.62rem', color:'var(--ink-60)' }}>/100</span>
            </div>
          </div>
          <div style={{ fontSize:'.78rem', fontWeight:700, color: statutGlobal.color }}>{statutGlobal.label}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>

        {/* ── Webcam ── */}
        <div className="card">
          <div className="card-head" style={{ paddingBottom: 14 }}>
            <h3>Surveillance webcam</h3>
            <span className={`badge ${isActive ? 'green' : 'gray'}`}>
              {isActive ? '● Active' : '○ Inactive'}
            </span>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ position:'relative', borderRadius:10, overflow:'hidden', background:'#0F1923', aspectRatio:'16/9', marginBottom:14 }}>
              <video ref={videoRef} autoPlay muted playsInline
                style={{ width:'100%', height:'100%', objectFit:'cover', display: isActive ? 'block' : 'none' }} />
              {!isActive && (
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.4)', gap:10 }}>
                  <i className="fa-solid fa-camera" style={{ fontSize:'2rem' }} />
                  <span style={{ fontSize:'.8rem' }}>Caméra désactivée</span>
                </div>
              )}
            </div>
            {/* Timer */}
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:'.75rem', color:'var(--ink-60)' }}>Position assise</span>
                <span style={{ fontSize:'.82rem', fontWeight:700 }}>{formatted}</span>
              </div>
              <div style={{ height:5, borderRadius:3, background:'var(--ink-08)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:3, width:`${progressPct}%`,
                  background: progressPct < 50 ? '#0B9B8A' : progressPct < 80 ? '#C47A00' : '#C0392B',
                  transition:'width .5s' }} />
              </div>
              <div style={{ fontSize:'.68rem', color:'var(--ink-60)', marginTop:4 }}>Alerte à 2h00 de position assise</div>
            </div>
            <button className={`btn ${isActive ? 'btn-outline' : 'btn-primary'}`}
              style={{ width:'100%' }} onClick={isActive ? desactiver : activer}>
              <i className={`fa-solid ${isActive ? 'fa-camera-slash' : 'fa-camera'}`} />
              {isActive ? 'Désactiver la surveillance' : 'Activer la surveillance'}
            </button>
          </div>
        </div>

        {/* ── Scores par zone ── */}
        <div className="card">
          <div className="card-head" style={{ paddingBottom:14 }}>
            <h3>Scores par zone</h3>
            <span style={{ fontSize:'.72rem', color:'var(--ink-60)' }}>Session en cours</span>
          </div>
          <div style={{ padding:'4px 20px 20px' }}>
            {ZONES.map(z => {
              const val = scores?.[z.key];
              if (val == null) return null;
              const pct = Math.round(val);
              const color = pct >= 80 ? '#0B9B8A' : pct >= 60 ? '#C47A00' : '#C0392B';
              return (
                <div key={z.key} className="score-bar-wrap" style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:120 }}>
                    <i className={`fa-solid ${z.icon}`} style={{ fontSize:'.72rem', color:'var(--ink-30)', width:14 }} />
                    <span className="score-bar-label">{z.label}</span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width:`${pct}%`, background: color }} />
                  </div>
                  <span className="score-bar-val" style={{ color }}>{pct}%</span>
                </div>
              );
            })}
            {ZONES.every(z => scores?.[z.key] == null) && (
              <div className="empty-state">
                <i className="fa-solid fa-person-rays" />
                <p>Activez la surveillance webcam pour voir vos scores en temps réel</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Conseils posturaux ── */}
      <div className="card">
        <div className="card-head" style={{ paddingBottom:14 }}>
          <h3>Conseils d'amélioration</h3>
        </div>
        <div style={{ padding:'8px 20px 20px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:12 }}>
          {[
            { icon:'fa-chair', title:'Hauteur du siège', tip: `Réglez votre siège à ${dashboard?.profil?.hauteurSiegeRecommandeCm || '—'} cm — genoux à 90°, pieds à plat.` },
            { icon:'fa-desktop', title:'Position de l\'écran', tip: `Écran à ${dashboard?.profil?.hauteurEcranRecommandeCm || '—'} cm — sommet de l'écran au niveau des yeux.` },
            { icon:'fa-keyboard', title:'Poignets', tip:'Poignets dans le prolongement des avant-bras — pas de flexion ni d\'extension.' },
            { icon:'fa-eye', title:'Règle 20-20-20', tip:'Toutes les 20 min, regardez à 6 m pendant 20 sec pour reposer vos yeux.' },
          ].map(c => (
            <div key={c.title} style={{ background:'var(--sand)', borderRadius:10, padding:'14px 16px' }}>
              <i className={`fa-solid ${c.icon}`} style={{ color:'var(--teal)', marginBottom:8, display:'block' }} />
              <div style={{ fontSize:'.8rem', fontWeight:700, marginBottom:4 }}>{c.title}</div>
              <div style={{ fontSize:'.74rem', color:'var(--ink-60)', lineHeight:1.55 }}>{c.tip}</div>
            </div>
          ))}
        </div>
      </div>

    </AppLayout>
  );
}
