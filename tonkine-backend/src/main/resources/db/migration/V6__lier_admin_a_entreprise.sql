-- ═══════════════════════════════════════════════════════════════
-- V6 — Le compte admin@tonkine.cm n'a jamais été rattaché à
-- l'entreprise démo (entreprise_id restait NULL depuis V2, avant
-- même que la colonne n'existe). Conséquence : le tableau de bord RH
-- ne chargeait jamais de vraies données, et les nouvelles routes de
-- gestion des comptes (multi-tenant) le rejetaient avec un 403.
-- ═══════════════════════════════════════════════════════════════

UPDATE utilisateurs
SET entreprise_id = 1
WHERE email = 'admin@tonkine.cm' AND entreprise_id IS NULL;
