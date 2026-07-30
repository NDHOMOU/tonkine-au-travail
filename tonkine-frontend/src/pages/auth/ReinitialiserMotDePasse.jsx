/**
 * ReinitialiserMotDePasse — choix d'un nouveau mot de passe à partir du
 * jeton reçu par e-mail (lien "mot de passe oublié").
 */
import { useState }            from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi }             from '../../api/authApi';
import PasswordInput           from '../../components/ui/PasswordInput';
import toast                   from 'react-hot-toast';
import './auth.css';

export default function ReinitialiserMotDePasse() {
  const [searchParams] = useSearchParams();
  const jeton          = searchParams.get('jeton') || '';
  const navigate        = useNavigate();

  const [motDePasse, setMotDePasse]     = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

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
      await authApi.reinitialiserMotDePasse(jeton, motDePasse);
      toast.success('Mot de passe réinitialisé ! Vous pouvez vous connecter.');
      navigate('/connexion', { replace: true });
    } catch (err) {
      setError(err.response?.data?.erreur || 'Impossible de réinitialiser le mot de passe.');
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
        <h1>Choisissez<br /><em>un nouveau mot de passe</em></h1>

        {!jeton ? (
          <>
            <p>Ce lien est invalide ou incomplet.</p>
            <p className="form-footer">
              <Link to="/mot-de-passe-oublie">← Refaire une demande</Link>
            </p>
          </>
        ) : (
          <>
            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label>
                Nouveau mot de passe
                <PasswordInput
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
                <PasswordInput
                  value={confirmation}
                  onChange={e => setConfirmation(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </label>

              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Mise à jour…' : 'Réinitialiser mon mot de passe →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
