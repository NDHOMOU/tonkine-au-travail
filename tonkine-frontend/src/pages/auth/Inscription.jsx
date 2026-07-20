/**
 * Inscription — Wizard 5 étapes
 * Toutes les données sont envoyées à l'API Spring Boot à l'étape finale.
 * Les photos posture sont uploadées séparément via /profil/photos.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth }           from '../../context/AuthContext';
import { authApi }           from '../../api/authApi';
import { profilApi }         from '../../api/profilApi';
import toast                 from 'react-hot-toast';
import './auth.css';

const ETAPES = [
  'Informations',
  'Photos posture',
  'Morphologie',
  'Hobbies & planning',
  'Récapitulatif',
];

const HOBBIES = [
  { id:'musique',    label:'Musique',           img:'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=96&h=96&fit=crop', desc:'Exercices rythmés, pauses avec playlist' },
  { id:'sport',      label:'Sport / Fitness',   img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=96&h=96&fit=crop', desc:'Étirements dynamiques, cardio léger' },
  { id:'lecture',    label:'Lecture',            img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop', desc:'Pauses yeux, nuque, luminosité écran' },
  { id:'gastronomie',label:'Gastronomie',        img:'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=96&h=96&fit=crop', desc:'Pauses café/eau, micro-collations' },
  { id:'yoga',       label:'Yoga / Méditation', img:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=96&h=96&fit=crop', desc:'Respiration, relaxation, pleine conscience' },
  { id:'marche',     label:'Marche / Nature',    img:'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=96&h=96&fit=crop', desc:'Micro-sorties, tours de couloir' },
  { id:'art',        label:'Art / Créativité',   img:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=96&h=96&fit=crop', desc:'Pauses dessin, doodling' },
  { id:'social',     label:'Social / Équipe',    img:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=96&h=96&fit=crop', desc:'Pauses collègues, activités de groupe' },
];

const VUES_PHOTO = [
  { id:'FACE',         label:'Vue de face',    img:'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=96&h=120&fit=crop&crop=top' },
  { id:'DOS',          label:'Vue de dos',     img:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=96&h=120&fit=crop&crop=top' },
  { id:'PROFIL_GAUCHE',label:'Profil gauche',  img:'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=96&h=120&fit=crop&crop=top' },
  { id:'PROFIL_DROIT', label:'Profil droit',   img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=96&h=120&fit=crop&crop=top' },
];

export default function Inscription() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [etape, setEtape] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [entreprises, setEntreprises] = useState([]);

  // Chargement de la liste des entreprises (endpoint public)
  useEffect(() => {
    authApi.getEntreprises()
      .then(r => setEntreprises(r.data || []))
      .catch(() => {}); // silencieux
  }, []);

  // Données du formulaire
  const [form, setForm] = useState({
    prenom:'', nom:'', email:'', motDePasse:'',
    entrepriseId:'',
    departement:'', poste:'', langue:'fr',
    tailleCm:170, longueurJambeCm:44, longueurAvantBrasCm:28,
    typeSiege:'', typeEcran:'', bureauReglable:false, reposePieds:false,
    heuresAssiParJour:'8 à 9 heures', douleursDeclarees:'',
    hobbies:[], joursTravailes:'1,2,3,4,5',
    heureArrivee:'08:00', heureDepart:'17:00',
  });

  // Photos : { VUE: File }
  const [photos, setPhotos] = useState({});
  const [photoPreviews, setPhotoPreviews] = useState({});
  const fileRefs = { FACE:{}, DOS:{}, PROFIL_GAUCHE:{}, PROFIL_DROIT:{} };
  const inputRefs = {
    FACE:          useRef(), DOS:          useRef(),
    PROFIL_GAUCHE: useRef(), PROFIL_DROIT: useRef(),
  };

  const upd = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleHobbie = (id) => {
    setForm(f => ({
      ...f,
      hobbies: f.hobbies.includes(id)
        ? f.hobbies.filter(h => h !== id)
        : [...f.hobbies, id],
    }));
  };

  const handlePhoto = (vue, file) => {
    if (!file) return;
    setPhotos(p => ({ ...p, [vue]: file }));
    setPhotoPreviews(p => ({ ...p, [vue]: URL.createObjectURL(file) }));
  };

  const validerEtape = () => {
    const errs = {};
    if (etape === 0) {
      if (!form.prenom.trim())  errs.prenom     = 'Obligatoire';
      if (!form.nom.trim())     errs.nom        = 'Obligatoire';
      if (!form.email.includes('@')) errs.email = 'Email invalide';
      if (form.motDePasse.length < 8) errs.motDePasse = 'Min. 8 caractères';
      if (!form.entrepriseId)   errs.entrepriseId = 'Sélectionnez votre entreprise';
      if (!form.departement)    errs.departement = 'Obligatoire';
    }
    if (etape === 2) {
      if (!form.tailleCm || form.tailleCm < 100 || form.tailleCm > 250)
        errs.tailleCm = 'Taille invalide (100–250 cm)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const suivant = () => { if (validerEtape()) setEtape(e => e + 1); };
  const precedent = () => setEtape(e => e - 1);

  // Calcul config optimale (affichage temps réel)
  const siege  = form.longueurJambeCm;
  const bureau = form.longueurJambeCm + form.longueurAvantBrasCm;
  const ecran  = form.longueurJambeCm + 70;

  // Soumission finale
  const soumettre = async () => {
    setLoading(true);
    try {
      // 1. Inscription → obtenir token
      const { data: auth } = await authApi.inscrire({
        ...form,
        hobbies: form.hobbies.join(','),
      });
      login(auth);

      // 2. Upload des photos (en parallèle)
      const uploads = Object.entries(photos).map(([vue, fichier]) =>
        profilApi.uploadPhoto(vue, fichier).catch(() => {})
      );
      await Promise.all(uploads);

      toast.success('Profil créé avec succès — bienvenue !');
      navigate('/employe/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la création du profil.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const nbPhotos = Object.keys(photos).length;

  return (
    <div className="inscription-page">
      {/* Header */}
      <header className="inscription-header">
        <Link to="/" className="logo-link">
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=64&h=64&fit=crop" alt="" />
          <span>TonKiné <strong>au Travail</strong></span>
        </Link>
        <span className="header-login">Déjà inscrit ? <Link to="/connexion">Se connecter</Link></span>
      </header>

      {/* Stepper */}
      <nav className="stepper">
        {ETAPES.map((label, i) => (
          <div key={i} className={`step ${i < etape ? 'done' : i === etape ? 'active' : ''}`}>
            <div className="step-num">
              {i < etape ? '✓' : i + 1}
            </div>
            <span className="step-label">{label}</span>
            {i < ETAPES.length - 1 && <div className={`step-sep ${i < etape ? 'done' : ''}`} />}
          </div>
        ))}
      </nav>

      <div className="inscription-wrap">

        {/* ══ ÉTAPE 0 — INFORMATIONS ══ */}
        {etape === 0 && (
          <div className="panel">
            <div className="panel-head">
              <div className="eyebrow">Étape 1 sur 5</div>
              <h2>Vos <em>informations</em> personnelles</h2>
              <p>Ces données personnalisent votre programme de prévention TMS.</p>
            </div>
            <div className="form-section">
              <h3>Identité et poste de travail</h3>
              <div className="grid-2">
                <label>Prénom *
                  <input value={form.prenom} onChange={e=>upd('prenom',e.target.value)} placeholder="Jean-Paul" />
                  {errors.prenom && <span className="err">{errors.prenom}</span>}
                </label>
                <label>Nom *
                  <input value={form.nom} onChange={e=>upd('nom',e.target.value)} placeholder="Kamga" />
                  {errors.nom && <span className="err">{errors.nom}</span>}
                </label>
                <label>E-mail professionnel *
                  <input type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="prenom.nom@entreprise.cm" />
                  {errors.email && <span className="err">{errors.email}</span>}
                </label>
                <label>Mot de passe *
                  <input type="password" value={form.motDePasse} onChange={e=>upd('motDePasse',e.target.value)} placeholder="Min. 8 caractères" />
                  {errors.motDePasse && <span className="err">{errors.motDePasse}</span>}
                </label>
                <label>Votre entreprise *
                  <select value={form.entrepriseId} onChange={e=>upd('entrepriseId', e.target.value)}>
                    <option value="">Sélectionner votre entreprise…</option>
                    {entreprises.map(ent => (
                      <option key={ent.id} value={ent.id}>{ent.nom}</option>
                    ))}
                  </select>
                  {errors.entrepriseId && <span className="err">{errors.entrepriseId}</span>}
                </label>
                <label>Département *
                  <select value={form.departement} onChange={e=>upd('departement',e.target.value)}>
                    <option value="">Sélectionner…</option>
                    {['Informatique / IT','Banque / Finance','Service client','Direction / Administration','Support technique','Ressources Humaines'].map(d=>(
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  {errors.departement && <span className="err">{errors.departement}</span>}
                </label>
                <label>Poste / Fonction
                  <input value={form.poste} onChange={e=>upd('poste',e.target.value)} placeholder="Développeur, Analyste…" />
                </label>
                <label>Langue préférée
                  <select value={form.langue} onChange={e=>upd('langue',e.target.value)}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <label>Heures assises / jour
                  <select value={form.heuresAssiParJour} onChange={e=>upd('heuresAssiParJour',e.target.value)}>
                    {['4 à 5 heures','6 à 7 heures','8 à 9 heures','Plus de 9 heures'].map(h=>(
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>Douleurs existantes (facultatif)
                <textarea value={form.douleursDeclarees} onChange={e=>upd('douleursDeclarees',e.target.value)}
                  placeholder="Ex. : douleurs cervicales, tension lombaire…" rows={3} />
                <span className="hint">Confidentiel — utilisé uniquement pour adapter vos exercices curatifs.</span>
              </label>
            </div>
            <div className="step-nav">
              <span className="step-counter">Étape 1 / 5</span>
              <button className="btn-next" onClick={suivant}>Continuer →</button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 1 — PHOTOS ══ */}
        {etape === 1 && (
          <div className="panel">
            <div className="panel-head">
              <div className="eyebrow">Étape 2 sur 5</div>
              <h2>Photos de votre <em>posture assise</em></h2>
              <p>4 photos de vous assis à votre poste habituel. Le système les compare aux normes ergonomiques pour établir votre diagnostic.</p>
            </div>

            <div className="photo-guide">
              <img src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=200&h=260&fit=crop&crop=top" alt="exemple" />
              <div>
                <h4>Comment prendre les photos</h4>
                <ul>
                  <li>Asseyez-vous dans votre position de travail <strong>habituelle</strong> (naturelle, pas forcée)</li>
                  <li>Demandez à un collègue ou utilisez un trépied</li>
                  <li>Le corps doit être <strong>entièrement visible</strong> de la tête aux pieds</li>
                  <li>Fond neutre, bonne lumière, pas de contre-jour</li>
                </ul>
              </div>
            </div>

            <div className="photos-grid">
              {VUES_PHOTO.map(v => (
                <div
                  key={v.id}
                  className={`photo-slot ${photoPreviews[v.id] ? 'filled' : ''}`}
                  onClick={() => inputRefs[v.id].current?.click()}
                >
                  {photoPreviews[v.id]
                    ? <img src={photoPreviews[v.id]} alt={v.label} className="preview-img" />
                    : (
                      <div className="slot-placeholder">
                        <img src={v.img} alt={v.label} />
                        <div className="slot-label">{v.label}</div>
                      </div>
                    )
                  }
                  {photoPreviews[v.id] && <div className="check-badge">✓</div>}
                  <input
                    ref={inputRefs[v.id]}
                    type="file"
                    accept="image/*"
                    style={{ display:'none' }}
                    onChange={e => handlePhoto(v.id, e.target.files[0])}
                  />
                </div>
              ))}
            </div>

            <p className="photo-count">{nbPhotos} / 4 photos téléversées</p>

            <div className="step-nav">
              <button className="btn-prev" onClick={precedent}>← Retour</button>
              <span className="step-counter">Étape 2 / 5</span>
              <button className="btn-next" onClick={suivant}>
                {nbPhotos < 4 ? 'Ignorer pour l\'instant →' : 'Continuer →'}
              </button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 2 — MORPHOLOGIE ══ */}
        {etape === 2 && (
          <div className="panel">
            <div className="panel-head">
              <div className="eyebrow">Étape 3 sur 5</div>
              <h2>Votre <em>profil morphologique</em></h2>
              <p>Ces mesures calculent vos angles posturaux de référence et la configuration optimale de votre poste.</p>
            </div>

            <div className="form-section">
              <h3>Mesures corporelles</h3>
              {[
                { field:'tailleCm',           label:'Taille', min:150, max:200, unit:'cm' },
                { field:'longueurJambeCm',     label:'Sol → Genou', min:30, max:65, unit:'cm' },
                { field:'longueurAvantBrasCm', label:'Coude → Poignet', min:20, max:40, unit:'cm' },
              ].map(r => (
                <div className="range-row" key={r.field}>
                  <div className="range-head">
                    <label>{r.label}</label>
                    <strong className="range-val">{form[r.field]} {r.unit}</strong>
                  </div>
                  <input type="range" min={r.min} max={r.max} value={form[r.field]}
                    onChange={e => upd(r.field, parseInt(e.target.value))} />
                  <div className="range-labels"><span>{r.min} {r.unit}</span><span>{r.max} {r.unit}</span></div>
                  {errors[r.field] && <span className="err">{errors[r.field]}</span>}
                </div>
              ))}
            </div>

            <div className="form-section">
              <h3>Configuration de votre poste actuel</h3>
              <div className="grid-3">
                <label>Type de siège
                  <select value={form.typeSiege} onChange={e=>upd('typeSiege',e.target.value)}>
                    <option value="">Sélectionner…</option>
                    {['Chaise classique','Chaise ergonomique','Tabouret réglable','Autre'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>Type d'écran
                  <select value={form.typeEcran} onChange={e=>upd('typeEcran',e.target.value)}>
                    <option value="">Sélectionner…</option>
                    {['Écran fixe','Ordinateur portable','Double écran','Tablette'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>Bureau réglable ?
                  <select value={form.bureauReglable} onChange={e=>upd('bureauReglable',e.target.value==='true')}>
                    <option value="false">Non</option>
                    <option value="true">Oui</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Aperçu configuration optimale */}
            <div className="config-preview">
              <img src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=160&h=200&fit=crop&crop=top" alt="" />
              <div>
                <h4>Configuration optimale calculée pour votre profil</h4>
                <div className="config-specs">
                  <div><span>Hauteur siège</span><strong>{siege} cm</strong></div>
                  <div><span>Hauteur bureau</span><strong>{bureau} cm</strong></div>
                  <div><span>Hauteur écran (sommet)</span><strong>{ecran} cm</strong></div>
                  <div><span>Distance écran</span><strong>55–70 cm</strong></div>
                  <div><span>Angle siège recommandé</span><strong>90–100°</strong></div>
                  <div><span>Angle coudes</span><strong>90°</strong></div>
                </div>
              </div>
            </div>

            <div className="step-nav">
              <button className="btn-prev" onClick={precedent}>← Retour</button>
              <span className="step-counter">Étape 3 / 5</span>
              <button className="btn-next" onClick={suivant}>Continuer →</button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 3 — HOBBIES & PLANNING ══ */}
        {etape === 3 && (
          <div className="panel">
            <div className="panel-head">
              <div className="eyebrow">Étape 4 sur 5</div>
              <h2>Vos <em>hobbies</em> et votre planning</h2>
              <p>Les exercices de pause seront adaptés à vos centres d'intérêt pour maximiser votre adhésion.</p>
            </div>

            {form.hobbies.length < 2 && (
              <div className="hobby-hint">
                💡 Sélectionnez <strong>au moins 2 hobbies</strong> pour des pauses vraiment personnalisées.
              </div>
            )}

            <div className="hobbies-grid">
              {HOBBIES.map(h => (
                <div
                  key={h.id}
                  className={`hobby-card ${form.hobbies.includes(h.id) ? 'selected' : ''}`}
                  onClick={() => toggleHobbie(h.id)}
                >
                  <img src={h.img} alt={h.label} />
                  <h4>{h.label}</h4>
                  <p>{h.desc}</p>
                  {form.hobbies.includes(h.id) && <div className="hobby-check">✓</div>}
                </div>
              ))}
            </div>

            <div className="form-section">
              <h3>Planning de travail</h3>
              <div className="grid-2">
                <label>Heure d'arrivée habituelle
                  <input type="time" value={form.heureArrivee} onChange={e=>upd('heureArrivee',e.target.value)} />
                </label>
                <label>Heure de départ habituelle
                  <input type="time" value={form.heureDepart} onChange={e=>upd('heureDepart',e.target.value)} />
                </label>
              </div>
            </div>

            <div className="step-nav">
              <button className="btn-prev" onClick={precedent}>← Retour</button>
              <span className="step-counter">Étape 4 / 5</span>
              <button className="btn-next" onClick={suivant}>Voir le récapitulatif →</button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 4 — RÉCAPITULATIF ══ */}
        {etape === 4 && (
          <div className="panel">
            <div className="panel-head">
              <div className="eyebrow">Étape 5 sur 5</div>
              <h2><em>Récapitulatif</em> de votre profil</h2>
              <p>Vérifiez vos informations avant de créer votre compte. Vous pourrez tout modifier ensuite.</p>
            </div>

            <div className="review-grid">
              <div className="review-card">
                <h4>Identité & Poste</h4>
                <div className="rev-row"><span>Nom</span><strong>{form.prenom} {form.nom}</strong></div>
                <div className="rev-row"><span>Email</span><strong>{form.email}</strong></div>
                <div className="rev-row"><span>Département</span><strong>{form.departement}</strong></div>
                <div className="rev-row"><span>Poste</span><strong>{form.poste || '—'}</strong></div>
                <div className="rev-row"><span>Heures assises/j</span><strong>{form.heuresAssiParJour}</strong></div>
              </div>
              <div className="review-card">
                <h4>Morphologie & Poste recommandé</h4>
                <div className="rev-row"><span>Taille</span><strong>{form.tailleCm} cm</strong></div>
                <div className="rev-row"><span>Longueur jambes</span><strong>{form.longueurJambeCm} cm</strong></div>
                <div className="rev-row"><span>Hauteur siège</span><strong>{siege} cm</strong></div>
                <div className="rev-row"><span>Hauteur bureau</span><strong>{bureau} cm</strong></div>
                <div className="rev-row"><span>Hauteur écran</span><strong>{ecran} cm</strong></div>
              </div>
              <div className="review-card">
                <h4>Photos posture ({nbPhotos}/4)</h4>
                <div className="review-photos">
                  {VUES_PHOTO.map(v => (
                    <div key={v.id} className="rev-photo">
                      <img src={photoPreviews[v.id] || v.img} alt={v.label} />
                      <span>{photoPreviews[v.id] ? '✓' : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="review-card">
                <h4>Hobbies ({form.hobbies.length})</h4>
                <div className="review-hobbies">
                  {form.hobbies.length > 0
                    ? form.hobbies.map(h => <span key={h} className="hobby-tag">{HOBBIES.find(hb=>hb.id===h)?.label}</span>)
                    : <span className="hint">Aucun hobby sélectionné</span>
                  }
                </div>
                <h4 style={{marginTop:14}}>Planning</h4>
                <div className="rev-row"><span>Arrivée</span><strong>{form.heureArrivee}</strong></div>
                <div className="rev-row"><span>Départ</span><strong>{form.heureDepart}</strong></div>
              </div>
            </div>

            <div className="step-nav">
              <button className="btn-prev" onClick={precedent}>← Modifier</button>
              <button
                className="btn-submit-final"
                onClick={soumettre}
                disabled={loading}
              >
                {loading ? 'Création en cours…' : '✓ Créer mon profil'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
