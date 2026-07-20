/**
 * Page Connexion — utilise l'API réelle Spring Boot
 */
import { useState }            from 'react';
import { useNavigate, Link }   from 'react-router-dom';
import { useAuth }             from '../../context/AuthContext';
import { authApi }             from '../../api/authApi';
import toast                   from 'react-hot-toast';
import './auth.css';

export default function Connexion() {
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ email: '', motDePasse: '', role: 'EMPLOYE' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.connecter(form.email, form.motDePasse);

      // Vérifie que le rôle correspond à la sélection
      if (data.role !== form.role) {
        setError('Rôle incorrect — vérifiez votre sélection.');
        return;
      }

      login(data);
      toast.success(`Bonjour ${data.prenom} !`);

      // Redirection selon le rôle
      const destination =
        data.role === 'ADMIN_RH'         ? '/admin/dashboard' :
        data.role === 'KINESITHERAPEUTE' ? '/kine/dashboard'  :
                                           '/employe/dashboard';
      navigate(destination);

    } catch (err) {
      const msg = err.response?.data?.message || err.response?.status === 401
        ? 'Identifiant ou mot de passe incorrect.'
        : 'Erreur de connexion. Vérifiez votre réseau.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connexion-layout">
      {/* Panneau gauche : photo + citation */}
      <div className="connexion-photo">
        <img
          src="https://images.unsplash.com/photo-1688578735972-b61ec274df7b?w=900&h=1200&fit=crop"
          alt="Poste de travail ergonomique en entreprise"
        />
        <div className="connexion-quote">
          <blockquote>
            «&nbsp;Votre corps passe 8 heures par jour à votre bureau.
            Il mérite autant d'attention que votre travail.&nbsp;»
          </blockquote>
          <div className="quote-author">
            <img
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&h=80&fit=crop&crop=face"
              alt="Dr Geneviève Ndhomou"
            />
            <div>
              <strong>Dr. Geneviève Ndhomou</strong>
              <span>Kinésithérapeute d'entreprise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau droit : formulaire */}
      <div className="connexion-form-panel">
        <Link to="/" className="back-link">← Retour à l'accueil</Link>

        <h1>Bon retour,<br /><em>connectez-vous</em></h1>
        <p>Accédez à votre espace selon votre rôle dans l'entreprise.</p>

        {/* Sélecteur rôle */}
        <div className="role-tabs">
          {[
            { value: 'EMPLOYE',          label: '👨‍💻 Employé'          },
            { value: 'ADMIN_RH',         label: '🏢 Admin RH'          },
            { value: 'KINESITHERAPEUTE', label: '🩺 Kinésithérapeute'  },
          ].map(r => (
            <button
              key={r.value}
              type="button"
              className={`role-tab ${form.role === r.value ? 'active' : ''}`}
              onClick={() => setForm(f => ({ ...f, role: r.value }))}
            >
              {r.label}
            </button>
          ))}
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Adresse e-mail professionnelle
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
              onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Vérification…' : 'Se connecter →'}
          </button>
        </form>

        <p className="form-footer">
          Première connexion ?{' '}
          <Link to="/inscription">Créer mon profil →</Link>
        </p>
      </div>
    </div>
  );
}
