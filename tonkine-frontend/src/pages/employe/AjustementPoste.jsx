/**
 * AjustementPoste — Aide au choix d'un siège/bureau ergonomique.
 * Deux modes indépendants :
 *  1. Scanner en direct : la webcam mesure l'angle du genou pendant que la
 *     personne est assise sur le meuble candidat (magasin, autre poste...).
 *     Une webcam 2D ne mesure pas de distance réelle — on évalue donc la
 *     posture obtenue, pas une hauteur en cm.
 *  2. Entrer les mesures : hauteur du siège/bureau candidat saisies à la
 *     main (ex. relevées en magasin), comparées à la recommandation calculée
 *     depuis le profil de l'employé.
 */
import { useState, useEffect } from 'react';
import { usePostureDetection } from '../../hooks/usePostureDetection';
import { ergonomieApi }        from '../../api/ergonomieApi';
import AppLayout                from '../../components/layout/AppLayout';
import toast                     from 'react-hot-toast';

const VERDICT_STYLE = {
  CORRECT:         { badge: 'green', label: 'Correct' },
  SIEGE_TROP_BAS:  { badge: 'danger', label: 'Siège trop bas' },
  SIEGE_TROP_HAUT: { badge: 'danger', label: 'Siège trop haut' },
  TROP_HAUT:       { badge: 'danger', label: 'Trop haut' },
  TROP_BAS:        { badge: 'danger', label: 'Trop bas' },
};

export default function AjustementPoste() {
  const [mode, setMode] = useState('scan'); // 'scan' | 'manuel'
  const [resultat, setResultat] = useState(null);
  const [enCours,  setEnCours]  = useState(false);
  const [erreur,   setErreur]   = useState('');

  // ── Mode scan ──
  const { isActive, activer, desactiver, angleGenou, videoRef } = usePostureDetection({
    // Pas de sessionId : ce scan n'est pas une mesure de la journée de
    // travail, on ne veut pas polluer l'historique de posture réel.
    sessionId: null,
    profil: null,
  });

  useEffect(() => () => desactiver(), []); // coupe la webcam en quittant la page

  const evaluer = async (payload) => {
    setEnCours(true);
    setErreur('');
    try {
      const { data } = await ergonomieApi.evaluerPoste(payload);
      setResultat(data);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Impossible d\'évaluer ce poste — complétez d\'abord votre profil.');
    } finally {
      setEnCours(false);
    }
  };

  const capturer = () => {
    if (angleGenou == null) { toast.error('Aucun angle détecté — vérifiez que vos genoux et chevilles sont visibles.'); return; }
    evaluer({ angleGenouMesure: angleGenou });
  };

  // ── Mode manuel ──
  const [hauteurSiegeCm,  setHauteurSiegeCm]  = useState('');
  const [hauteurBureauCm, setHauteurBureauCm] = useState('');

  const soumettreManuel = (e) => {
    e.preventDefault();
    const payload = {};
    if (hauteurSiegeCm)  payload.hauteurSiegeCm  = parseInt(hauteurSiegeCm, 10);
    if (hauteurBureauCm) payload.hauteurBureauCm = parseInt(hauteurBureauCm, 10);
    if (!payload.hauteurSiegeCm && !payload.hauteurBureauCm) {
      toast.error('Renseignez au moins une mesure.'); return;
    }
    evaluer(payload);
  };

  return (
    <AppLayout title="Ajuster mon poste">
      <div className="page-hero" style={{ marginBottom: 24 }}>
        <div className="ph-text">
          <div className="ph-eyebrow">Aide au choix de mobilier</div>
          <h1>Ce siège <em>vous convient-il</em> ?</h1>
          <p>Que vous testiez une chaise en magasin ou que vous vouliez vérifier votre poste actuel, scannez votre posture assise ou entrez les mesures du meuble pour savoir s'il vous correspond.</p>
        </div>
      </div>

      {/* Sous-onglets */}
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border)' }}>
        {[
          { key:'scan',   label:'Scanner en direct',      icon:'fa-camera' },
          { key:'manuel', label:'Entrer les mesures',     icon:'fa-ruler' },
        ].map(t => (
          <button key={t.key}
            onClick={() => { setMode(t.key); setResultat(null); setErreur(''); }}
            style={{
              padding:'10px 16px', border:'none', background:'transparent',
              fontFamily:'var(--f-sans)', fontSize:'.82rem', fontWeight: mode === t.key ? 700 : 500,
              color: mode === t.key ? 'var(--blue)' : 'var(--ink-60)',
              borderBottom: mode === t.key ? '2px solid var(--blue)' : '2px solid transparent',
              cursor:'pointer', display:'flex', alignItems:'center', gap:7,
            }}>
            <i className={`fa-solid ${t.icon}`} style={{ fontSize:'.78rem' }} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* ── Colonne action ── */}
        <div className="card">
          {mode === 'scan' ? (
            <>
              <div className="card-head" style={{ paddingBottom:14 }}>
                <h3>Scan de posture assise</h3>
                <span className={`badge ${isActive ? 'green' : 'gray'}`}>{isActive ? '● Active' : '○ Inactive'}</span>
              </div>
              <div style={{ padding:'0 20px 20px' }}>
                <p style={{ fontSize:'.78rem', color:'var(--ink-60)', marginBottom:14, lineHeight:1.6 }}>
                  Asseyez-vous normalement sur le siège à tester, à votre bureau habituel, puis activez la caméra.
                </p>
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
                {isActive && (
                  <div style={{ textAlign:'center', marginBottom:14 }}>
                    <div style={{ fontSize:'.68rem', color:'var(--ink-60)', textTransform:'uppercase', letterSpacing:'.06em' }}>Angle du genou détecté</div>
                    <div style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--blue)' }}>
                      {angleGenou != null ? `${Math.round(angleGenou)}°` : '—'}
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', gap:10 }}>
                  <button className={`btn ${isActive ? 'btn-outline' : 'btn-primary'}`} style={{ flex:1 }}
                    onClick={isActive ? desactiver : activer}>
                    <i className={`fa-solid ${isActive ? 'fa-camera-slash' : 'fa-camera'}`} />
                    {isActive ? 'Désactiver' : 'Activer la caméra'}
                  </button>
                  {isActive && (
                    <button className="btn btn-teal" style={{ flex:1 }} disabled={enCours || angleGenou == null} onClick={capturer}>
                      {enCours ? 'Analyse…' : 'Évaluer cette position'}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card-head" style={{ paddingBottom:14 }}>
                <h3>Mesures du meuble candidat</h3>
              </div>
              <form onSubmit={soumettreManuel} style={{ padding:'0 20px 20px' }}>
                <p style={{ fontSize:'.78rem', color:'var(--ink-60)', marginBottom:16, lineHeight:1.6 }}>
                  Relevez la hauteur d'assise du siège et/ou la hauteur du plan de bureau (souvent indiquées sur l'étiquette produit), en centimètres.
                </p>
                <div className="form-group">
                  <label className="form-label">Hauteur du siège (cm)</label>
                  <input className="form-input" type="number" min={30} max={70}
                    placeholder="Ex : 45" value={hauteurSiegeCm}
                    onChange={e => setHauteurSiegeCm(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hauteur du bureau (cm)</label>
                  <input className="form-input" type="number" min={50} max={120}
                    placeholder="Ex : 74" value={hauteurBureauCm}
                    onChange={e => setHauteurBureauCm(e.target.value)} />
                </div>
                <button className="btn btn-primary" style={{ width:'100%' }} disabled={enCours} type="submit">
                  {enCours ? 'Analyse…' : 'Évaluer ce meuble'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── Colonne résultat ── */}
        <div className="card">
          <div className="card-head" style={{ paddingBottom:14 }}><h3>Résultat</h3></div>
          <div style={{ padding:'0 20px 20px' }}>
            {erreur && <div className="inline-alert danger" style={{ marginBottom:14 }}>{erreur}</div>}

            {!resultat && !erreur ? (
              <div className="empty-state" style={{ padding:30 }}>
                <i className="fa-solid fa-chair" />
                <p>Scannez une position ou entrez des mesures pour voir le résultat.</p>
              </div>
            ) : resultat && (
              <>
                {resultat.verdictAngleGenou && (
                  <div style={{ marginBottom:16 }}>
                    <span className={`badge ${VERDICT_STYLE[resultat.verdictAngleGenou]?.badge || 'gray'}`}>
                      {VERDICT_STYLE[resultat.verdictAngleGenou]?.label || resultat.verdictAngleGenou}
                    </span>
                    <p style={{ fontSize:'.82rem', marginTop:8, lineHeight:1.6 }}>{resultat.messageAngleGenou}</p>
                  </div>
                )}

                {resultat.verdictSiege && (
                  <div style={{ marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'.82rem' }}>Hauteur du siège</span>
                    <span className={`badge ${VERDICT_STYLE[resultat.verdictSiege]?.badge || 'gray'}`}>
                      {VERDICT_STYLE[resultat.verdictSiege]?.label} {resultat.ecartSiegeCm !== 0 && `(${resultat.ecartSiegeCm > 0 ? '+' : ''}${resultat.ecartSiegeCm} cm)`}
                    </span>
                  </div>
                )}
                {resultat.verdictBureau && (
                  <div style={{ marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'.82rem' }}>Hauteur du bureau</span>
                    <span className={`badge ${VERDICT_STYLE[resultat.verdictBureau]?.badge || 'gray'}`}>
                      {VERDICT_STYLE[resultat.verdictBureau]?.label} {resultat.ecartBureauCm !== 0 && `(${resultat.ecartBureauCm > 0 ? '+' : ''}${resultat.ecartBureauCm} cm)`}
                    </span>
                  </div>
                )}

                <div style={{ marginTop:18, paddingTop:14, borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'.68rem', fontWeight:700, color:'var(--ink-60)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>
                    Vos recommandations théoriques
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    <div style={{ background:'var(--sand)', borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                      <div style={{ fontSize:'.65rem', color:'var(--ink-60)' }}>Siège</div>
                      <div style={{ fontWeight:700 }}>{resultat.hauteurSiegeIdealeCm ?? '—'} cm</div>
                    </div>
                    <div style={{ background:'var(--sand)', borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                      <div style={{ fontSize:'.65rem', color:'var(--ink-60)' }}>Bureau</div>
                      <div style={{ fontWeight:700 }}>{resultat.hauteurBureauIdealeCm ?? '—'} cm</div>
                    </div>
                    <div style={{ background:'var(--sand)', borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                      <div style={{ fontSize:'.65rem', color:'var(--ink-60)' }}>Écran</div>
                      <div style={{ fontWeight:700 }}>{resultat.hauteurEcranIdealeCm ?? '—'} cm</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
