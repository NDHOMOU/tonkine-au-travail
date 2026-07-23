-- ═══════════════════════════════════════════════════════════════
-- V9 — Journal d'audit des actions administratives.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE journal_audit (
    id          BIGSERIAL PRIMARY KEY,
    acteur_id   BIGINT       NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    action      VARCHAR(60)  NOT NULL,
    details     VARCHAR(500),
    date_action TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_acteur ON journal_audit(acteur_id);
CREATE INDEX idx_audit_date   ON journal_audit(date_action);
