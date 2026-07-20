/**
 * AppLayout — Mise en page principale avec sidebar et topbar
 * Partagé par toutes les pages connectées (employé, admin RH, kiné).
 * La navigation s'adapte automatiquement selon le rôle.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

// ── Navigation par rôle ──
const NAV_EMPLOYE = [
  { to: '/employe/dashboard',  icon: 'fa-gauge',       label: 'Tableau de bord'     },
  { to: '/employe/posture',    icon: 'fa-person-rays', label: 'Ma posture'           },
  { to: '/employe/exercices',  icon: 'fa-dumbbell',    label: 'Exercices'            },
  { to: '/employe/curatif',    icon: 'fa-kit-medical', label: 'Protocoles curatifs'  },
  { to: '/employe/rdv',        icon: 'fa-calendar-check', label: 'Mon kiné / RDV'   },
  { to: '/employe/conseils',   icon: 'fa-comment-medical', label: 'Conseils santé'  },
];

const NAV_ADMIN = [
  { to: '/admin/dashboard', icon: 'fa-chart-line', label: 'Tableau de bord' },
];

const NAV_KINE = [
  { to: '/kine/dashboard',  icon: 'fa-stethoscope',  label: 'Tableau de bord'  },
  { to: '/kine/conseils',   icon: 'fa-comment-medical', label: 'Conseils'      },
];

export default function AppLayout({ children, title = '' }) {
  const { user, logout, isEmploye, isAdminRH, isKine, nomApp, couleurPrimaire, couleurSecondaire } = useAuth();
  const navigate = useNavigate();

  const navItems = isKine ? NAV_KINE : isAdminRH ? NAV_ADMIN : NAV_EMPLOYE;

  const handleLogout = () => {
    logout();
    navigate('/connexion', { replace: true });
  };

  const initiales = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : 'U';

  const roleLabel = isKine ? 'Kinésithérapeute' : isAdminRH ? 'Admin RH' : 'Employé';

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Logo */}
        <a className="sb-logo" href="#" style={{ '--c-primary': couleurPrimaire }}>
          <div className="sb-logo-mark" style={{ background: couleurPrimaire }}>
            <span>{nomApp[0]}</span>
          </div>
          <div className="sb-logo-text">
            {nomApp}
            <small>Prévention TMS</small>
          </div>
        </a>

        {/* Utilisateur */}
        <div className="sb-user">
          <div className="sb-avatar" style={{ background: couleurPrimaire }}>
            {initiales}
          </div>
          <div>
            <div className="sb-user-name">{user?.prenom} {user?.nom}</div>
            <div className="sb-user-role">{roleLabel}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sb-nav">
          <div className="sb-section-label">Navigation</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
              style={({ isActive }) => isActive ? { borderLeftColor: couleurSecondaire } : {}}
            >
              <i className={`fa-solid ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="sb-bottom">
          <button className="sb-logout" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="app-main">
        {/* Topbar */}
        <header className="topbar">
          <h2 className="topbar-title">{title}</h2>
          <div className="topbar-right">
            <span className="tb-entreprise">{user?.nomEntreprise || ''}</span>
            <div className="tb-avatar" style={{ background: couleurPrimaire }}>
              {initiales}
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
