/**
 * ParametresSecurite — activer/désactiver la double authentification (2FA).
 * Accessible à tous les rôles (chacun gère son propre compte).
 */
import { useState } from 'react';
import { useAuth }  from '../../context/AuthContext';
import { profilApi } from '../../api/profilApi';
import AppLayout    from '../../components/layout/AppLayout';
import toast         from 'react-hot-toast';

export default function ParametresSecurite() {
  const { user, updateUser } = useAuth();

  const [activation, setActivation]   = useState(null); // { secret, otpauthUri }
  const [code, setCode]               = useState('');
  const [enCours, setEnCours]         = useState(false);

  const demarrerActivation = async () => {
    setEnCours(true);
    try {
      const { data } = await profilApi.activerDeuxFA();
      setActivation(data);
    } catch {
      toast.error('Impossible de démarrer l\'activation de la 2FA.');
    } finally {
      setEnCours(false);
    }
  };

  const confirmer = async (e) => {
    e.preventDefault();
    setEnCours(true);
    try {
      await profilApi.confirmerDeuxFA(code);
      updateUser({ deuxFAActif: true });
      setActivation(null);
      setCode('');
      toast.success('Double authentification activée !');
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Code incorrect.');
    } finally {
      setEnCours(false);
    }
  };

  const desactiver = async () => {
    if (!window.confirm('Désactiver la double authentification sur ce compte ?')) return;
    setEnCours(true);
    try {
      await profilApi.desactiverDeuxFA();
      updateUser({ deuxFAActif: false });
      toast.success('Double authentification désactivée.');
    } catch {
      toast.error('Impossible de désactiver la 2FA.');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <AppLayout title="Sécurité du compte">
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-head"><h3>Double authentification (2FA)</h3></div>
        <div style={{ padding: '0 20px 20px' }}>
          <p style={{ fontSize: '.85rem', color: 'var(--ink-60)', lineHeight: 1.6, marginBottom: 16 }}>
            Ajoute une vérification supplémentaire à chaque connexion, via une application
            d'authentification de votre choix (Google Authenticator, Authy, etc.).
          </p>

          {user?.deuxFAActif ? (
            <>
              <div className="badge green" style={{ marginBottom: 16 }}>● Activée</div>
              <div>
                <button className="btn btn-outline" disabled={enCours} onClick={desactiver}>
                  {enCours ? 'Désactivation…' : 'Désactiver la 2FA'}
                </button>
              </div>
            </>
          ) : activation ? (
            <>
              <p style={{ fontSize: '.85rem', marginBottom: 10 }}>
                1. Ouvrez votre application d'authentification<br />
                2. Ajoutez un compte manuellement et saisissez cette clé :
              </p>
              <div style={{ background: 'var(--sand)', borderRadius: 8, padding: '12px 14px',
                fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, letterSpacing: '.5px',
                userSelect: 'all', marginBottom: 16, wordBreak: 'break-all' }}>
                {activation.secret}
              </div>
              <p style={{ fontSize: '.85rem', marginBottom: 10 }}>
                3. Entrez le code à 6 chiffres généré par l'application pour confirmer :
              </p>
              <form onSubmit={confirmer} style={{ display: 'flex', gap: 10 }}>
                <input
                  className="form-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  autoFocus
                  style={{ maxWidth: 140, letterSpacing: '.3em', textAlign: 'center' }}
                />
                <button className="btn btn-primary" disabled={enCours || code.length !== 6} type="submit">
                  {enCours ? 'Vérification…' : 'Confirmer'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="badge gray" style={{ marginBottom: 16 }}>○ Désactivée</div>
              <div>
                <button className="btn btn-primary" disabled={enCours} onClick={demarrerActivation}>
                  {enCours ? 'Préparation…' : 'Activer la 2FA'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
