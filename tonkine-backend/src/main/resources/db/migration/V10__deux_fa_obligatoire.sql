-- ═══════════════════════════════════════════════════════════════
-- V10 — 2FA obligatoire à la première connexion, pour les NOUVEAUX
-- comptes uniquement. DEFAULT FALSE ici pour que les comptes déjà
-- existants (déjà passés par leur première connexion) ne soient pas
-- bloqués rétroactivement — seuls inscrire()/creerCompteAdmin() dans
-- le code mettent ce drapeau à TRUE pour les comptes créés après ce
-- déploiement.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE utilisateurs ADD COLUMN doit_configurer_2fa BOOLEAN NOT NULL DEFAULT FALSE;
