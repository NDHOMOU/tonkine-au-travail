/**
 * Configuration obligatoire de la 2FA — première connexion d'un nouveau
 * compte (créé après l'introduction de cette exigence). Les comptes déjà
 * actifs avant ce changement ne sont pas concernés.
 */
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth }   from '../../context/AuthContext';
import { profilApi } from '../../api/profilApi';
import QRCode         from '../../components/ui/QRCode';
import toast          from 'react-hot-toast';
import './auth.css';

export default function ConfigurerDeuxFAObligatoire() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activation, setActivation] = useState(null); // { secret, otpauthUri }
  const [code, setCode]             = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    profilApi.activerDeuxFA()
      .then(({ data }) => setActivation(data))
      .catch(() => toast.error('Impossible de préparer la double authentification.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  const confirmer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await profilApi.confirmerDeuxFA(code);
      updateUser({ deuxFAActif: true, doitConfigurer2FA: false });
      toast.success('Double authentification activée !');

      const destination =
        user?.role === 'ADMIN_RH'         ? '/admin/dashboard' :
        user?.role === 'KINESITHERAPEUTE' ? '/kine/dashboard'  :
                                             '/employe/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.erreur || 'Code incorrect.');
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
        <h1>Dernière étape,<br /><em>sécurisez votre compte</em></h1>
        <p>
          Pour protéger vos données, la double authentification est obligatoire
          à la première connexion. Elle ne prend qu'une minute à configurer.
        </p>

        {error && <div className="form-error">{error}</div>}

        {!activation ? (
          <p style={{ fontSize: '.85rem', color: 'var(--ink-60)' }}>Préparation…</p>
        ) : (
          <>
            <p style={{ fontSize: '.85rem', marginBottom: 12 }}>
              1. Ouvrez une application d'authentification (Google Authenticator, Authy…)<br />
              2. Scannez ce QR code :
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ padding: 12, background: 'white', border: '1px solid rgba(15,25,35,.1)', borderRadius: 10 }}>
                <QRCode value={activation.otpauthUri} size={170} />
              </div>
            </div>

            <details style={{ marginBottom: 16 }}>
              <summary style={{ fontSize: '.78rem', color: 'var(--ink-60)', cursor: 'pointer' }}>
                Impossible de scanner ? Saisir la clé manuellement
              </summary>
              <div style={{ background: 'var(--sand, #F5F1EB)', borderRadius: 8, padding: '12px 14px',
                fontFamily: 'monospace', fontSize: '.9rem', fontWeight: 700, letterSpacing: '.5px',
                userSelect: 'all', marginTop: 8, wordBreak: 'break-all' }}>
                {activation.secret}
              </div>
            </details>

            <p style={{ fontSize: '.85rem', marginBottom: 10 }}>
              3. Entrez le code à 6 chiffres généré par l'application :
            </p>

            <form onSubmit={confirmer}>
              <label>
                Code à 6 chiffres
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  autoFocus
                  style={{ letterSpacing: '.3em', fontSize: '1.2rem', textAlign: 'center' }}
                />
              </label>

              <button type="submit" disabled={loading || code.length !== 6} className="btn-submit">
                {loading ? 'Vérification…' : 'Activer et continuer →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
