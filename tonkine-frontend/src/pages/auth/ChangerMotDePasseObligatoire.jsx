/**
 * Changement de mot de passe obligatoire — première connexion après
 * création du compte ou réinitialisation par un admin.
 */
import { useState }        from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth }         from '../../context/AuthContext';
import { profilApi }       from '../../api/profilApi';
import toast                from 'react-hot-toast';
import './auth.css';

export default function ChangerMotDePasseObligatoire() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  const [motDePasse, setMotDePasse]         = useState('');
  const [confirmation, setConfirmation]     = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (motDePasse !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await profilApi.changerMotDePasse(motDePasse);
      updateUser({ motDePasseTemporaire: false });
      toast.success('Mot de passe mis à jour !');

      const destination =
        user?.role === 'ADMIN_RH'         ? '/admin/dashboard' :
        user?.role === 'KINESITHERAPEUTE' ? '/kine/dashboard'  :
                                             '/employe/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.erreur || 'Erreur lors du changement de mot de passe.');
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
            «&nbsp;Votre corps passe 8 heures par jour à votre bureau.
            Il mérite autant d'attention que votre travail.&nbsp;»
          </blockquote>
        </div>
      </div>

      <div className="connexion-form-panel">
        <h1>Bienvenue,<br /><em>sécurisez votre compte</em></h1>
        <p>
          Ce mot de passe vous a été communiqué par un administrateur. Choisissez-en
          un nouveau, connu de vous seul(e), avant de continuer.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Nouveau mot de passe
            <input
              type="password"
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              placeholder="8 caractères minimum"
              required
              autoComplete="new-password"
              autoFocus
            />
          </label>

          <label>
            Confirmer le mot de passe
            <input
              type="password"
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Mise à jour…' : 'Définir mon mot de passe →'}
          </button>
        </form>
      </div>
    </div>
  );
}
