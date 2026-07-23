/**
 * App.jsx — Routage principal TonKiné au Travail
 *
 * Routes publiques       : / , /connexion , /inscription
 * Routes employé         : /employe/*  (EMPLOYE)
 * Routes admin RH        : /admin/*    (ADMIN_RH)
 * Routes kinésithérapeute: /kine/*     (KINESITHERAPEUTE)
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster }       from 'react-hot-toast';
import { AuthProvider }  from './context/AuthContext';
import ProtectedRoute    from './components/layout/ProtectedRoute';

// Pages publiques
import Connexion    from './pages/auth/Connexion';

// Lazy imports
import { lazy, Suspense } from 'react';
const Inscription               = lazy(() => import('./pages/auth/Inscription'));
const ChangerMotDePasseObligatoire = lazy(() => import('./pages/auth/ChangerMotDePasseObligatoire'));

// Employé
const DashboardEmploye   = lazy(() => import('./pages/employe/DashboardEmploye'));
const MaPosture          = lazy(() => import('./pages/employe/MaPosture'));
const Exercices          = lazy(() => import('./pages/employe/Exercices'));
const ProtocolesCuratifs = lazy(() => import('./pages/employe/ProtocolesCuratifs'));
const PriseRdvKine       = lazy(() => import('./pages/employe/PriseRdvKine'));

// Admin RH
const DashboardAdmin     = lazy(() => import('./pages/admin/DashboardAdmin'));

// Kinésithérapeute
const DashboardKine      = lazy(() => import('./pages/kine/DashboardKine'));

const Loading = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
    height:'100vh', gap:10, fontFamily:'system-ui, sans-serif', color:'#1353A4' }}>
    <span style={{ fontSize:'1.4rem' }}>↻</span> Chargement…
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* ── Public ── */}
            <Route path="/"            element={<Navigate to="/connexion" replace />} />
            <Route path="/connexion"   element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            {/* Accessible dès qu'on est authentifié, quel que soit le rôle — pas de ProtectedRoute
                (elle redirigerait ici même tant que le mot de passe est temporaire) */}
            <Route path="/changer-mot-de-passe" element={<ChangerMotDePasseObligatoire />} />

            {/* ── Espace Employé ── */}
            <Route element={<ProtectedRoute requiredRole="EMPLOYE" />}>
              <Route path="/employe/dashboard" element={<DashboardEmploye />} />
              <Route path="/employe/posture"   element={<MaPosture />} />
              <Route path="/employe/exercices" element={<Exercices />} />
              <Route path="/employe/curatif"   element={<ProtocolesCuratifs />} />
              {/* PriseRdvKine gère aussi l'onglet Conseils santé */}
              <Route path="/employe/rdv"       element={<PriseRdvKine />} />
              <Route path="/employe/conseils"  element={<PriseRdvKine defaultTab="conseils" />} />
            </Route>

            {/* ── Espace Admin RH ── */}
            <Route element={<ProtectedRoute requiredRole="ADMIN_RH" />}>
              <Route path="/admin/dashboard"   element={<DashboardAdmin />} />
            </Route>

            {/* ── Espace Kinésithérapeute ── */}
            <Route element={<ProtectedRoute requiredRole="KINESITHERAPEUTE" />}>
              <Route path="/kine/dashboard"    element={<DashboardKine />} />
              {/* Alias /kine/conseils redirige vers le tableau de bord onglet conseils */}
              <Route path="/kine/conseils"     element={<Navigate to="/kine/dashboard?tab=conseils" replace />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<Navigate to="/connexion" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
