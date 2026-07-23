-- ═══════════════════════════════════════════════════════════════
-- V8 — Authentification à deux facteurs (TOTP, type Google
-- Authenticator/Authy). Opt-in pour l'instant, pas encore forcée
-- à la première connexion.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE utilisateurs ADD COLUMN secret_2fa   VARCHAR(64);
ALTER TABLE utilisateurs ADD COLUMN deux_fa_actif BOOLEAN NOT NULL DEFAULT FALSE;
