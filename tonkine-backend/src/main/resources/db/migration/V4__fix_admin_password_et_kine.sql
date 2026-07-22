-- ═══════════════════════════════════════════════════════════════
-- V4 — Corrige le mot de passe admin (le hash de V2 ne correspondait
-- à aucun mot de passe documenté) et ajoute le compte kinésithérapeute.
-- ═══════════════════════════════════════════════════════════════

-- Mot de passe admin : TonKine-Admin-2026!
UPDATE utilisateurs
SET mot_de_passe = '$2b$12$ueDhUs3VfbV3nrV5kK5kQuaqav1SykW4QO23LRT1Fogb8ngaDeTN6'
WHERE email = 'admin@tonkine.cm';

-- Compte kinésithérapeute — Geneviève Ndhomou, seule kiné de l'application,
-- rattachée à l'entreprise démo créée en V3.
-- Mot de passe : GNdhomou-Kine-2026!
INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role, departement, poste, langue, entreprise_id)
VALUES (
  'Geneviève', 'Ndhomou',
  'genevieve.ndhomou@tonkine.cm',
  '$2b$12$Orjdf6AVKbc7icKzWtZqE.0yi7/QQoPhPILOHNhnQx2xTTULzgiRy',
  'KINESITHERAPEUTE',
  NULL,
  'Kinésithérapeute d''entreprise',
  'fr',
  1
);
