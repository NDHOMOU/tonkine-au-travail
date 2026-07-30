/**
 * PasswordInput — champ mot de passe avec icône œil pour afficher/masquer
 * la saisie. Remplace un <input type="password"> classique n'importe où
 * dans l'app (mêmes props transmises telles quelles).
 */
import { useState } from 'react';

export default function PasswordInput({ style, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        style={{ paddingRight: 40, width: '100%', ...style }}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        tabIndex={-1}
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink-60, rgba(15,25,35,.5))', padding: 4, fontSize: '.85rem',
          display: 'flex', alignItems: 'center',
        }}
      >
        <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}`} />
      </button>
    </div>
  );
}
