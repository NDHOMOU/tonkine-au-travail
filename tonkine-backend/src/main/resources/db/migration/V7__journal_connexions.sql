-- ═══════════════════════════════════════════════════════════════
-- V7 — Journal des connexions : sécurité, savoir qui s'est connecté,
-- quand, depuis quelle adresse IP.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE journal_connexions (
    id              BIGSERIAL PRIMARY KEY,
    utilisateur_id  BIGINT       NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    adresse_ip      VARCHAR(60),
    date_connexion  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_utilisateur ON journal_connexions(utilisateur_id);
CREATE INDEX idx_journal_date        ON journal_connexions(date_connexion);
