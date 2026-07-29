/**
 * InscrireEntreprise — Inscription d'une toute nouvelle entreprise cliente.
 * La personne qui remplit ce formulaire devient automatiquement le premier
 * Admin RH de son entreprise, qui vient d'être créée dans le système.
 */
import { useState }            from 'react';
import { useNavigate, Link }   from 'react-router-dom';
import { useAuth }             from '../../context/AuthContext';
import { authApi }             from '../../api/authApi';
import toast                   from 'react-hot-toast';
import './auth.css';

export default function InscrireEntreprise() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    nomEntreprise:'', ville:'', secteurActivite:'',
    prenom:'', nom:'', email:'', motDePasse:'',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const upd = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.inscrireEntreprise(form);
      login(data);
      toast.success(`Bienvenue ${data.prenom} ! Votre entreprise a été créée.`);
      navigate('/configurer-2fa');
    } catch (err) {
      setError(err.response?.data?.erreur || 'Impossible de créer votre entreprise pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connexion-layout">
      <div className="connexion-photo">
        <img
          src="https://images.unsplash.com/photo-1688578735972-b61ec274df7b?w=900&h=1200&fit=crop"
          alt="Poste de travail ergonomique en entreprise"
        />
        <div className="connexion-quote">
          <blockquote>
            «&nbsp;Chaque entreprise mérite un programme de prévention TMS
            à son image.&nbsp;»
          </blockquote>
        </div>
      </div>

      <div className="connexion-form-panel">
        <Link to="/connexion" className="back-link">← Retour à la connexion</Link>

        <h1>Votre entreprise,<br /><em>sur TonKiné au Travail</em></h1>
        <p>Créez le compte de votre entreprise — vous en serez le premier administrateur RH.</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Nom de l'entreprise
            <input
              type="text"
              value={form.nomEntreprise}
              onChange={e => upd('nomEntreprise', e.target.value)}
              placeholder="Ex : Acme Corporation Cameroun"
              required
            />
          </label>

          <label>
            Ville (facultatif)
            <input
              type="text"
              value={form.ville}
              onChange={e => upd('ville', e.target.value)}
              placeholder="Ex : Douala"
            />
          </label>

          <label>
            Secteur d'activité (facultatif)
            <input
              type="text"
              value={form.secteurActivite}
              onChange={e => upd('secteurActivite', e.target.value)}
              placeholder="Ex : Banque, Services, Industrie…"
            />
          </label>

          <div style={{ display:'flex', gap:12 }}>
            <label style={{ flex:1 }}>
              Votre prénom
              <input
                type="text"
                value={form.prenom}
                onChange={e => upd('prenom', e.target.value)}
                required
              />
            </label>
            <label style={{ flex:1 }}>
              Votre nom
              <input
                type="text"
                value={form.nom}
                onChange={e => upd('nom', e.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Votre e-mail professionnel
            <input
              type="email"
              value={form.email}
              onChange={e => upd('email', e.target.value)}
              placeholder="prenom.nom@entreprise.cm"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={form.motDePasse}
              onChange={e => upd('motDePasse', e.target.value)}
              placeholder="8 caractères minimum"
              required
              autoComplete="new-password"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Création…' : 'Créer mon entreprise →'}
          </button>
        </form>

        <p className="form-footer">
          Votre entreprise a déjà un compte ?{' '}
          <Link to="/inscription">Rejoindre en tant qu'employé →</Link>
        </p>
      </div>
    </div>
  );
}
