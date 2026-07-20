/**
 * Exercices — Bibliothèque d'exercices de pause active
 * - Filtres par zone corporelle
 * - Cartes avec image + description
 * - Modale de détail avec étapes guidées
 */
import { useState, useEffect } from 'react';
import { exerciceApi }  from '../../api/exerciceApi';
import AppLayout        from '../../components/layout/AppLayout';
import toast            from 'react-hot-toast';

const ZONES = [
  { value: '',                   label: 'Tous', icon: 'fa-layer-group' },
  { value: 'DOS_LOMBAIRES',      label: 'Dos',      icon: 'fa-spine' },
  { value: 'NUQUE_CERVICALES',   label: 'Nuque',    icon: 'fa-head-side' },
  { value: 'EPAULES',            label: 'Épaules',  icon: 'fa-person-rays' },
  { value: 'POIGNETS_AVANT_BRAS',label: 'Poignets', icon: 'fa-hand' },
  { value: 'HANCHES_BASSIN',     label: 'Hanches',  icon: 'fa-person-walking' },
  { value: 'YEUX_VISION',        label: 'Yeux',     icon: 'fa-eye' },
];

const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé'];

export default function Exercices() {
  const [exercices,   setExercices]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [zoneActive,  setZoneActive]  = useState('');
  const [selExercice, setSelExercice] = useState(null);
  const [enCours,     setEnCours]     = useState(null);
  const [etapeIdx,    setEtapeIdx]    = useState(0);

  useEffect(() => {
    exerciceApi.getExercices(zoneActive || null)
      .then(r => setExercices(r.data))
      .catch(() => toast.error('Impossible de charger les exercices.'))
      .finally(() => setLoading(false));
  }, [zoneActive]);

  const demarrer = (ex) => {
    setEnCours(ex);
    setEtapeIdx(0);
  };

  const etapes = enCours
    ? (typeof enCours.etapesJson === 'string'
        ? JSON.parse(enCours.etapesJson || '[]')
        : enCours.etapesJson || [])
    : [];

  return (
    <AppLayout title="Exercices">

      {/* Hero */}
      <div className="page-hero">
        <div className="ph-text">
          <div className="ph-eyebrow">Pause active</div>
          <h1>Vos exercices <em>personnalisés</em></h1>
          <p>Des exercices adaptés à votre profil corporel et vos hobbies. Quelques minutes suffisent pour relancer la circulation et décompresser votre colonne.</p>
        </div>
      </div>

      {/* Filtres zones */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        {ZONES.map(z => (
          <button key={z.value}
            className={`btn ${zoneActive === z.value ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setZoneActive(z.value)}>
            <i className={`fa-solid ${z.icon}`} />
            {z.label}
          </button>
        ))}
      </div>

      {/* Grille exercices */}
      {loading ? (
        <div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div>
      ) : exercices.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-dumbbell" />
          <p>Aucun exercice pour cette zone.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:16 }}>
          {exercices.map(ex => {
            const etapesEx = typeof ex.etapesJson === 'string'
              ? JSON.parse(ex.etapesJson || '[]') : (ex.etapesJson || []);
            return (
              <div key={ex.id} className="card" style={{ cursor:'pointer' }}
                onClick={() => setSelExercice(ex)}>
                {/* Image */}
                <div style={{ height:140, overflow:'hidden', background:'var(--sand)' }}>
                  {ex.urlImage
                    ? <img src={ex.urlImage} alt={ex.titre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <i className="fa-solid fa-dumbbell" style={{ fontSize:'2rem', color:'var(--ink-30)' }} />
                      </div>
                  }
                </div>
                <div style={{ padding:'14px 16px' }}>
                  {/* Zone + niveau */}
                  <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
                    <span className="badge blue" style={{ fontSize:'.58rem' }}>
                      {ex.zone?.replace('_', ' ')}
                    </span>
                    <span className="badge gray" style={{ fontSize:'.58rem' }}>
                      {NIVEAUX[(ex.niveauDifficulte || 1) - 1]}
                    </span>
                    <span className="badge gray" style={{ fontSize:'.58rem' }}>
                      <i className="fa-solid fa-clock" /> {ex.dureeMinutes} min
                    </span>
                  </div>
                  <h4 style={{ fontSize:'.88rem', fontWeight:700, marginBottom:6 }}>{ex.titre}</h4>
                  <p style={{ fontSize:'.75rem', color:'var(--ink-60)', lineHeight:1.55,
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {ex.description}
                  </p>
                  <div style={{ display:'flex', gap:8, marginTop:12 }}>
                    <button className="btn btn-teal btn-sm" style={{ flex:1 }}
                      onClick={e => { e.stopPropagation(); demarrer(ex); }}>
                      <i className="fa-solid fa-play" /> Commencer
                    </button>
                    <button className="btn btn-outline btn-sm"
                      onClick={e => { e.stopPropagation(); setSelExercice(ex); }}>
                      <i className="fa-solid fa-list" /> Étapes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modale détail exercice ── */}
      {selExercice && (
        <div style={overlay} onClick={() => setSelExercice(null)}>
          <div style={{ ...modal, maxWidth:540 }} onClick={e => e.stopPropagation()}>
            {selExercice.urlImage && (
              <div style={{ height:180, overflow:'hidden', borderRadius:'12px 12px 0 0' }}>
                <img src={selExercice.urlImage} alt={selExercice.titre}
                  style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
            )}
            <div style={{ padding:24 }}>
              <div style={{ display:'flex', gap:6, marginBottom:12 }}>
                <span className="badge blue">{selExercice.zone?.replace('_',' ')}</span>
                <span className="badge gray"><i className="fa-solid fa-clock" /> {selExercice.dureeMinutes} min</span>
                <span className="badge gray">{selExercice.frequenceRecommandee}</span>
              </div>
              <h3 style={{ fontFamily:'var(--f-serif)', fontSize:'1.2rem', fontWeight:300, marginBottom:8 }}>
                {selExercice.titre}
              </h3>
              <p style={{ fontSize:'.82rem', color:'var(--ink-60)', lineHeight:1.65, marginBottom:16 }}>
                {selExercice.description}
              </p>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-teal" style={{ flex:1 }}
                  onClick={() => { demarrer(selExercice); setSelExercice(null); }}>
                  <i className="fa-solid fa-play" /> Commencer l'exercice
                </button>
                <button className="btn btn-outline" onClick={() => setSelExercice(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale exercice en cours (étapes guidées) ── */}
      {enCours && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth:480 }}>
            <div style={{ padding:'22px 24px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:'.68rem', fontWeight:700, color:'var(--teal)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>
                  Exercice en cours · Étape {etapeIdx + 1}/{etapes.length}
                </div>
                <h3 style={{ fontFamily:'var(--f-serif)', fontSize:'1.1rem', fontWeight:300 }}>{enCours.titre}</h3>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => { setEnCours(null); toast.success('Exercice terminé ! Bien joué 💪'); }}>
                ✕ Terminer
              </button>
            </div>
            {/* Barre de progression */}
            <div style={{ margin:'16px 24px 0' }}>
              <div style={{ height:4, borderRadius:2, background:'var(--ink-08)' }}>
                <div style={{ height:'100%', borderRadius:2, background:'var(--teal)',
                  width:`${((etapeIdx+1)/etapes.length)*100}%`, transition:'width .3s' }} />
              </div>
            </div>
            {/* Étape actuelle */}
            <div style={{ padding:'20px 24px 24px' }}>
              {etapes[etapeIdx] && (
                <div style={{ background:'var(--teal-bg)', borderRadius:10, padding:'18px 20px', marginBottom:20 }}>
                  <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--teal)', marginBottom:8 }}>
                    ÉTAPE {etapeIdx + 1}
                  </div>
                  <p style={{ fontSize:'.9rem', lineHeight:1.65, color:'var(--ink)' }}>
                    {etapes[etapeIdx].instruction}
                  </p>
                </div>
              )}
              <div style={{ display:'flex', gap:10 }}>
                {etapeIdx > 0 && (
                  <button className="btn btn-outline" onClick={() => setEtapeIdx(i => i - 1)}>
                    ← Précédent
                  </button>
                )}
                {etapeIdx < etapes.length - 1 ? (
                  <button className="btn btn-teal" style={{ flex:1 }} onClick={() => setEtapeIdx(i => i + 1)}>
                    Étape suivante →
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ flex:1 }}
                    onClick={() => { setEnCours(null); toast.success('Exercice terminé ! Bien joué 💪'); }}>
                    <i className="fa-solid fa-check" /> Terminer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}

const overlay = {
  position:'fixed', inset:0, background:'rgba(15,25,35,.5)',
  display:'flex', alignItems:'center', justifyContent:'center',
  zIndex:200, backdropFilter:'blur(4px)', padding:20,
};
const modal = {
  background:'white', borderRadius:14, width:'100%',
  maxHeight:'90vh', overflowY:'auto',
  boxShadow:'0 20px 60px rgba(15,25,35,.2)',
};
