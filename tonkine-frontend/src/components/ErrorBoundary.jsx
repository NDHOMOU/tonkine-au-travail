/**
 * ErrorBoundary — Capture les erreurs React inattendues
 * Affiche une page de secours propre au lieu d'un écran blanc.
 */
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // En production : envoyer à Sentry ou votre service de monitoring
    console.error('[TonKiné] Erreur non capturée :', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: 40,
        fontFamily: 'Inter, system-ui, sans-serif', background: '#F7F8FC',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚕️</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: '1.6rem',
          color: '#0F1923', marginBottom: 12 }}>
          Une erreur inattendue s'est produite
        </h1>
        <p style={{ color: 'rgba(15,25,35,.6)', fontSize: '.9rem', maxWidth: 480,
          lineHeight: 1.65, marginBottom: 28 }}>
          L'application a rencontré un problème. Vos données sont en sécurité.
          Rechargez la page pour continuer.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 28px', background: '#1353A4', color: 'white',
            border: 'none', borderRadius: 10, fontSize: '.9rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
          ↩ Retour à l'accueil
        </button>
        {import.meta.env.DEV && this.state.error && (
          <pre style={{
            marginTop: 24, padding: 16, background: '#FDECEA', borderRadius: 8,
            fontSize: '.72rem', color: '#C0392B', maxWidth: 600, textAlign: 'left',
            overflow: 'auto', whiteSpace: 'pre-wrap',
          }}>
            {this.state.error.toString()}
          </pre>
        )}
      </div>
    );
  }
}
