/**
 * MotDePasseOublie — demande d'envoi d'un lien de réinitialisation par e-mail.
 * La réponse est toujours la même, que l'e-mail corresponde à un compte ou non.
 */
import { useState }          from 'react';
import { Link }              from 'react-router-dom';
import { authApi }           from '../../api/authApi';
import './auth.css';

export default function MotDePasseOublie() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [envoye, setEnvoye]     = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.motDePasseOublie(email);
      setEnvoye(true);
    } catch {
      setError('Une erreur est survenue. Réessayez dans un instant.');
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
        <h1>Mot de passe<br /><em>oublié ?</em></h1>

        {envoye ? (
          <>
            <p>
              Si un compte existe avec l'adresse <strong>{email}</strong>, un e-mail
              contenant un lien de réinitialisation vient d'être envoyé. Le lien est
              valable 60 minutes.
            </p>
            <p className="form-footer">
              <Link to="/connexion">← Revenir à la connexion</Link>
            </p>
          </>
        ) : (
          <>
            <p>
              Indiquez l'adresse e-mail de votre compte : si elle existe, vous recevrez
              un lien pour choisir un nouveau mot de passe.
            </p>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label>
                Adresse e-mail professionnelle
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="prenom.nom@entreprise.cm"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </label>

              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Envoi…' : 'Envoyer le lien de réinitialisation →'}
              </button>
            </form>

            <p className="form-footer">
              <Link to="/connexion">← Revenir à la connexion</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
