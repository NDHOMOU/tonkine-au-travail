-- ═══════════════════════════════════════════════════════════════
-- TonKiné au Travail — V3 : Multi-tenant + Rôle Kiné + Conseils
-- Compatible PostgreSQL
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. TABLE ENTREPRISES (multi-tenant)
--    Chaque entreprise a son propre kiné, ses propres couleurs,
--    son propre nom d'application et sa limite de licence.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE entreprises (
    id                       BIGSERIAL PRIMARY KEY,
    nom                      VARCHAR(200) NOT NULL,
    nom_app                  VARCHAR(200) NOT NULL DEFAULT 'TonKiné au Travail',
    slogan                   VARCHAR(300),
    logo_url                 VARCHAR(500),
    couleur_primaire         VARCHAR(10)  NOT NULL DEFAULT '#1353A4',
    couleur_secondaire       VARCHAR(10)  NOT NULL DEFAULT '#0B9B8A',
    adresse                  VARCHAR(300),
    ville                    VARCHAR(100),
    pays                     VARCHAR(100) NOT NULL DEFAULT 'Cameroun',
    telephone                VARCHAR(30),
    email_contact            VARCHAR(200),
    site_web                 VARCHAR(300),
    secteur_activite         VARCHAR(150),
    nombre_employes_max      INTEGER      NOT NULL DEFAULT 50,
    date_expiration_licence  DATE,
    actif                    BOOLEAN      NOT NULL DEFAULT TRUE,
    date_creation            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────────────────────────
-- 2. AJOUTER entreprise_id DANS UTILISATEURS
--    Clé d'isolation multi-tenant sur tous les utilisateurs.
-- ────────────────────────────────────────────────────────────────
ALTER TABLE utilisateurs
    ADD COLUMN entreprise_id BIGINT REFERENCES entreprises(id) ON DELETE SET NULL;

CREATE INDEX idx_user_entreprise ON utilisateurs(entreprise_id);

-- Mettre à jour la contrainte CHECK du rôle pour inclure KINESITHERAPEUTE
-- (PostgreSQL ne supporte pas ALTER CHECK facilement — on drop et recrée)
ALTER TABLE utilisateurs
    DROP CONSTRAINT IF EXISTS utilisateurs_role_check;

ALTER TABLE utilisateurs
    ADD CONSTRAINT utilisateurs_role_check
    CHECK (role IN ('EMPLOYE','ADMIN_RH','KINESITHERAPEUTE'));

-- ────────────────────────────────────────────────────────────────
-- 3. REFONTE TABLE RENDEZ_VOUS
--    Le kiné n'est plus un enregistrement "annuaire" externe,
--    mais un utilisateur de l'application (rôle KINESITHERAPEUTE).
-- ────────────────────────────────────────────────────────────────

-- Supprimer l'ancienne table rendez_vous (liée à l'annuaire kiné)
DROP TABLE IF EXISTS rendez_vous;

-- Recréer rendez_vous avec kine_id → utilisateurs
CREATE TABLE rendez_vous (
    id                  BIGSERIAL PRIMARY KEY,
    employe_id          BIGINT       NOT NULL REFERENCES utilisateurs(id),
    kine_id             BIGINT       NOT NULL REFERENCES utilisateurs(id),
    entreprise_id       BIGINT       NOT NULL REFERENCES entreprises(id),
    date_rdv            DATE         NOT NULL,
    heure_debut         TIME         NOT NULL,
    duree_minutes       INTEGER      NOT NULL DEFAULT 45,
    statut              VARCHAR(20)  NOT NULL DEFAULT 'EN_ATTENTE'
                        CHECK (statut IN ('EN_ATTENTE','CONFIRME','EFFECTUE','ANNULE')),
    motif               TEXT,
    notes_seance        TEXT,
    date_reservation    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour    TIMESTAMP
);

CREATE INDEX idx_rdv_employe    ON rendez_vous(employe_id);
CREATE INDEX idx_rdv_kine       ON rendez_vous(kine_id);
CREATE INDEX idx_rdv_entreprise ON rendez_vous(entreprise_id);
CREATE INDEX idx_rdv_date       ON rendez_vous(date_rdv);

-- ────────────────────────────────────────────────────────────────
-- 4. SUPPRIMER L'ANCIENNE TABLE KINESITHERAPEUTES (annuaire)
--    Remplacée par le rôle KINESITHERAPEUTE dans utilisateurs.
-- ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS kinesitherapeutes;

-- ────────────────────────────────────────────────────────────────
-- 5. TABLE CONSEILS_SANTE
--    Consultation en ligne employé ↔ kiné (sans déplacement).
--    L'employé pose une question kinésithérapique depuis son poste,
--    le kiné répond depuis le sien en temps différé.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE conseils_sante (
    id                BIGSERIAL PRIMARY KEY,
    employe_id        BIGINT       NOT NULL REFERENCES utilisateurs(id),
    kine_id           BIGINT       NOT NULL REFERENCES utilisateurs(id),
    entreprise_id     BIGINT       NOT NULL REFERENCES entreprises(id),
    question          TEXT         NOT NULL,
    zone_concernee    VARCHAR(30),
    niveau_urgence    VARCHAR(10)  NOT NULL DEFAULT 'NORMAL'
                      CHECK (niveau_urgence IN ('NORMAL','URGENT')),
    statut            VARCHAR(20)  NOT NULL DEFAULT 'EN_ATTENTE'
                      CHECK (statut IN ('EN_ATTENTE','VU','REPONDU')),
    reponse           TEXT,
    date_question     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_vue          TIMESTAMP,
    date_reponse      TIMESTAMP
);

CREATE INDEX idx_conseil_employe    ON conseils_sante(employe_id);
CREATE INDEX idx_conseil_kine       ON conseils_sante(kine_id);
CREATE INDEX idx_conseil_entreprise ON conseils_sante(entreprise_id);
CREATE INDEX idx_conseil_statut     ON conseils_sante(statut);

-- ────────────────────────────────────────────────────────────────
-- 6. DONNÉES DE DÉMO — 1 entreprise exemple + 1 kiné
--    À supprimer en production ou à remplacer par le vrai onboarding.
-- ────────────────────────────────────────────────────────────────
INSERT INTO entreprises (
    nom, nom_app, slogan, couleur_primaire, couleur_secondaire,
    adresse, ville, pays, telephone, email_contact,
    secteur_activite, nombre_employes_max
) VALUES (
    'Acme Corporation Cameroun',
    'TonKiné au Travail',
    'Prévention des TMS pour vos équipes',
    '#1353A4', '#0B9B8A',
    'Rue de la Réunification, Bonapriso',
    'Douala', 'Cameroun',
    '+237 6XX XXX XXX',
    'rh@acme-cm.com',
    'Services & Conseil',
    100
);
