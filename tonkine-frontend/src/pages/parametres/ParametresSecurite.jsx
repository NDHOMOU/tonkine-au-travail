/**
 * ParametresSecurite — activer/désactiver la double authentification (2FA).
 * Accessible à tous les rôles (chacun gère son propre compte).
 */
import { useState } from 'react';
import { useAuth }  from '../../context/AuthContext';
import { profilApi } from '../../api/profilApi';
import AppLayout    from '../../components/layout/AppLayout';
import QRCode        from '../../components/ui/QRCode';
import PasswordInput from '../../components/ui/PasswordInput';
import toast         from 'react-hot-toast';

export default function ParametresSecurite() {
  const { user, updateUser } = useAuth();

  const [activation, setActivation]   = useState(null); // { secret, otpauthUri }
  const [code, setCode]               = useState('');
  const [enCours, setEnCours]         = useState(false);
  const [confirmationDesactivation, setConfirmationDesactivation] = useState(false);

  const [motDePasseForm, setMotDePasseForm] = useState({ ancien: '', nouveau: '', confirmation: '' });
  const [motDePasseEnCours, setMotDePasseEnCours] = useState(false);

  const soumettreChangementMotDePasse = async (e) => {
    e.preventDefault();
    if (motDePasseForm.nouveau.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (motDePasseForm.nouveau !== motDePasseForm.confirmation) {
      toast.error('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setMotDePasseEnCours(true);
    try {
      await profilApi.changerMotDePasse(motDePasseForm.ancien, motDePasseForm.nouveau);
      toast.success('Mot de passe mis à jour !');
      setMotDePasseForm({ ancien: '', nouveau: '', confirmation: '' });
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Mot de passe actuel incorrect.');
    } finally {
      setMotDePasseEnCours(false);
    }
  };

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
    setEnCours(true);
    try {
      await profilApi.desactiverDeuxFA();
      updateUser({ deuxFAActif: false });
      setConfirmationDesactivation(false);
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
              {!confirmationDesactivation ? (
                <div>
                  <button className="btn btn-outline" onClick={() => setConfirmationDesactivation(true)}>
                    Désactiver la 2FA
                  </button>
                </div>
              ) : (
                <div style={{ background: 'var(--sand)', borderRadius: 8, padding: '14px 16px' }}>
                  <p style={{ fontSize: '.85rem', marginBottom: 12 }}>
                    Confirmer la désactivation de la double authentification sur ce compte ?
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" disabled={enCours} onClick={desactiver}>
                      {enCours ? 'Désactivation…' : 'Oui, désactiver'}
                    </button>
                    <button className="btn btn-outline" disabled={enCours} onClick={() => setConfirmationDesactivation(false)}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : activation ? (
            <>
              <p style={{ fontSize: '.85rem', marginBottom: 12 }}>
                1. Ouvrez votre application d'authentification<br />
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
                <div style={{ background: 'var(--sand)', borderRadius: 8, padding: '12px 14px',
                  fontFamily: 'monospace', fontSize: '.9rem', fontWeight: 700, letterSpacing: '.5px',
                  userSelect: 'all', marginTop: 8, wordBreak: 'break-all' }}>
                  {activation.secret}
                </div>
              </details>
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

      <div className="card" style={{ maxWidth: 560, marginTop: 20 }}>
        <div className="card-head"><h3>Changer mon mot de passe</h3></div>
        <form onSubmit={soumettreChangementMotDePasse} style={{ padding: '0 20px 20px' }}>
          <label>
            Mot de passe actuel
            <PasswordInput
              value={motDePasseForm.ancien}
              onChange={e => setMotDePasseForm(f => ({ ...f, ancien: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </label>

          <label>
            Nouveau mot de passe
            <PasswordInput
              value={motDePasseForm.nouveau}
              onChange={e => setMotDePasseForm(f => ({ ...f, nouveau: e.target.value }))}
              placeholder="8 caractères minimum"
              required
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirmer le nouveau mot de passe
            <PasswordInput
              value={motDePasseForm.confirmation}
              onChange={e => setMotDePasseForm(f => ({ ...f, confirmation: e.target.value }))}
              required
              autoComplete="new-password"
            />
          </label>

          <button className="btn btn-primary" disabled={motDePasseEnCours} type="submit" style={{ marginTop: 6 }}>
            {motDePasseEnCours ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
