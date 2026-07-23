-- ═══════════════════════════════════════════════════════════════
-- V5 — Gestion des comptes : changement de mot de passe obligatoire
-- à la première connexion (comptes créés par un admin) + photo de
-- profil pour l'identification professionnelle.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE utilisateurs
    ADD COLUMN mot_de_passe_temporaire BOOLEAN NOT NULL DEFAULT FALSE;

-- Photo de profil stockée en base64 directement en base (pas de disque
-- persistant garanti sur l'hébergeur — évite de perdre les photos à
-- chaque redéploiement).
ALTER TABLE utilisateurs
    ADD COLUMN photo_profil_base64 TEXT;
