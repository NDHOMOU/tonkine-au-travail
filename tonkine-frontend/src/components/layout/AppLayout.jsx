/**
 * AppLayout — Mise en page principale avec sidebar et topbar
 * Partagé par toutes les pages connectées (employé, admin RH, kiné).
 * La navigation s'adapte automatiquement selon le rôle.
 */
import { useRef }                from 'react';
import { NavLink, useNavigate }  from 'react-router-dom';
import { useAuth }               from '../../context/AuthContext';
import { profilApi }             from '../../api/profilApi';
import toast                     from 'react-hot-toast';
import './AppLayout.css';

const TAILLE_MAX_PHOTO = 2 * 1024 * 1024; // 2 Mo

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
  { to: '/admin/dashboard',          icon: 'fa-chart-line',       label: 'Tableau de bord' },
  { to: '/admin/decision',           icon: 'fa-lightbulb',        label: 'Aide à la décision' },
  { to: '/admin/comptes',            icon: 'fa-user-shield',      label: 'Comptes admin' },
  { to: '/admin/journal-connexions', icon: 'fa-clock-rotate-left', label: 'Journal des connexions' },
  { to: '/admin/entreprise',         icon: 'fa-building',         label: 'Paramètres entreprise' },
];

const NAV_KINE = [
  { to: '/kine/dashboard',  icon: 'fa-stethoscope',  label: 'Tableau de bord'  },
  { to: '/kine/conseils',   icon: 'fa-comment-medical', label: 'Conseils'      },
];

export default function AppLayout({ children, title = '' }) {
  const { user, logout, updateUser, isEmploye, isAdminRH, isKine, nomApp, couleurPrimaire, couleurSecondaire } = useAuth();
  const navigate = useNavigate();
  const inputPhotoRef = useRef(null);

  const navItems = isKine ? NAV_KINE : isAdminRH ? NAV_ADMIN : NAV_EMPLOYE;

  const handleLogout = () => {
    logout();
    navigate('/connexion', { replace: true });
  };

  const initiales = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : 'U';

  const roleLabel = isKine ? 'Kinésithérapeute' : isAdminRH ? 'Admin RH' : 'Employé';

  const choisirPhoto = () => inputPhotoRef.current?.click();

  const changerPhoto = (e) => {
    const fichier = e.target.files?.[0];
    e.target.value = ''; // permet de re-choisir le même fichier plus tard
    if (!fichier) return;
    if (!fichier.type.startsWith('image/')) {
      toast.error('Choisissez une image.'); return;
    }
    if (fichier.size > TAILLE_MAX_PHOTO) {
      toast.error('Image trop lourde (2 Mo maximum).'); return;
    }
    const lecteur = new FileReader();
    lecteur.onload = async () => {
      const base64 = lecteur.result;
      try {
        await profilApi.mettreAJourAvatar(base64);
        updateUser({ photoProfilBase64: base64 });
        toast.success('Photo de profil mise à jour.');
      } catch {
        toast.error('Impossible de mettre à jour la photo.');
      }
    };
    lecteur.readAsDataURL(fichier);
  };

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
          <button
            type="button"
            onClick={choisirPhoto}
            title="Changer ma photo de profil"
            className="sb-avatar"
            style={{ background: couleurPrimaire, padding: 0, border: 'none', cursor: 'pointer', overflow: 'hidden' }}
          >
            {user?.photoProfilBase64
              ? <img src={user.photoProfilBase64} alt="Photo de profil" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : initiales}
          </button>
          <input
            ref={inputPhotoRef}
            type="file"
            accept="image/*"
            onChange={changerPhoto}
            style={{ display: 'none' }}
          />
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
          <NavLink
            to="/parametres/securite"
            className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
            style={({ isActive }) => isActive ? { borderLeftColor: couleurSecondaire } : {}}
          >
            <i className="fa-solid fa-shield-halved" />
            Sécurité
          </NavLink>
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
            <div className="tb-avatar" style={{ background: couleurPrimaire, overflow: 'hidden' }}>
              {user?.photoProfilBase64
                ? <img src={user.photoProfilBase64} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : initiales}
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
