-- ═══════════════════════════════════════════════════════════════
-- TonKiné au Travail — V1 : Création de toutes les tables
-- Compatible PostgreSQL et MySQL
-- ═══════════════════════════════════════════════════════════════

-- Utilisateurs (employés + admins RH)
CREATE TABLE utilisateurs (
    id                 BIGSERIAL PRIMARY KEY,
    prenom             VARCHAR(100)  NOT NULL,
    nom                VARCHAR(100)  NOT NULL,
    email              VARCHAR(200)  NOT NULL UNIQUE,
    mot_de_passe       VARCHAR(255)  NOT NULL,
    role               VARCHAR(20)   NOT NULL CHECK (role IN ('EMPLOYE','ADMIN_RH')),
    departement        VARCHAR(100),
    poste              VARCHAR(100),
    langue             VARCHAR(5)    NOT NULL DEFAULT 'fr',
    actif              BOOLEAN       NOT NULL DEFAULT TRUE,
    date_creation      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP
);

-- Profils ergonomiques (1-1 avec utilisateur)
CREATE TABLE profils_ergonomiques (
    id                            BIGSERIAL PRIMARY KEY,
    utilisateur_id                BIGINT        NOT NULL UNIQUE REFERENCES utilisateurs(id) ON DELETE CASCADE,
    taille_cm                     INTEGER       NOT NULL,
    longueur_jambe_cm             INTEGER,
    longueur_avant_bras_cm        INTEGER,
    poids_kg                      INTEGER,
    categorie_morphologique       VARCHAR(50),
    type_siege                    VARCHAR(100),
    type_ecran                    VARCHAR(100),
    bureau_reglable               BOOLEAN       NOT NULL DEFAULT FALSE,
    repose_pieds                  BOOLEAN       NOT NULL DEFAULT FALSE,
    heures_assi_par_jour          VARCHAR(20),
    douleurs_declarees            TEXT,
    hauteur_siege_recommande_cm   INTEGER,
    hauteur_bureau_recommande_cm  INTEGER,
    hauteur_ecran_recommande_cm   INTEGER,
    hobbies                       VARCHAR(500),
    jours_travailes               VARCHAR(20),
    heure_arrivee                 VARCHAR(5),
    heure_depart                  VARCHAR(5),
    date_creation                 TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour              TIMESTAMP
);

-- Photos de posture
CREATE TABLE photos_posture (
    id             BIGSERIAL PRIMARY KEY,
    profil_id      BIGINT        NOT NULL REFERENCES profils_ergonomiques(id) ON DELETE CASCADE,
    vue            VARCHAR(20)   NOT NULL CHECK (vue IN ('FACE','DOS','PROFIL_GAUCHE','PROFIL_DROIT')),
    chemin_fichier VARCHAR(500)  NOT NULL,
    nom_original   VARCHAR(255),
    type_mime      VARCHAR(50),
    taille_octets  BIGINT,
    date_upload    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions de travail
CREATE TABLE sessions_travail (
    id                            BIGSERIAL PRIMARY KEY,
    utilisateur_id                BIGINT    NOT NULL REFERENCES utilisateurs(id),
    date_debut                    TIMESTAMP NOT NULL,
    date_fin                      TIMESTAMP,
    duree_assis_total_secondes    BIGINT    NOT NULL DEFAULT 0,
    nombre_pauses_effectuees      INTEGER   NOT NULL DEFAULT 0,
    nombre_alertes_envoyees       INTEGER   NOT NULL DEFAULT 0,
    nombre_alertes_ignorees       INTEGER   NOT NULL DEFAULT 0,
    score_dos_colonne             DOUBLE PRECISION,
    score_nuque                   DOUBLE PRECISION,
    score_epaules                 DOUBLE PRECISION,
    score_poignets                DOUBLE PRECISION,
    score_hanches                 DOUBLE PRECISION,
    score_yeux                    DOUBLE PRECISION,
    score_global                  DOUBLE PRECISION,
    date_creation                 TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_utilisateur ON sessions_travail(utilisateur_id);
CREATE INDEX idx_session_debut       ON sessions_travail(date_debut);

-- Mesures de posture (envoyées par TensorFlow.js)
CREATE TABLE mesures_posture (
    id                     BIGSERIAL PRIMARY KEY,
    session_id             BIGINT        NOT NULL REFERENCES sessions_travail(id) ON DELETE CASCADE,
    zone                   VARCHAR(30)   NOT NULL,
    score                  DOUBLE PRECISION  NOT NULL,
    angle_degres           DOUBLE PRECISION,
    angle_reference_norme  DOUBLE PRECISION,
    conforme               BOOLEAN       NOT NULL DEFAULT TRUE,
    horodatage             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mesure_session ON mesures_posture(session_id);

-- Exercices de pause active
CREATE TABLE exercices (
    id                      BIGSERIAL PRIMARY KEY,
    titre                   VARCHAR(200)  NOT NULL,
    description             TEXT          NOT NULL,
    zone                    VARCHAR(30)   NOT NULL,
    dure_minutes            INTEGER       NOT NULL,
    frequence_recommandee   VARCHAR(50),
    niveau_difficulte       INTEGER       NOT NULL DEFAULT 1 CHECK (niveau_difficulte IN (1,2,3)),
    hobbies_associes        VARCHAR(200),
    etapes_json             TEXT,
    url_video               VARCHAR(500),
    url_image               VARCHAR(500),
    actif                   BOOLEAN       NOT NULL DEFAULT TRUE
);

-- Alertes
CREATE TABLE alertes (
    id                              BIGSERIAL PRIMARY KEY,
    utilisateur_id                  BIGINT       NOT NULL REFERENCES utilisateurs(id),
    session_id                      BIGINT       REFERENCES sessions_travail(id),
    type                            VARCHAR(30)  NOT NULL,
    statut                          VARCHAR(20)  NOT NULL DEFAULT 'ENVOYEE',
    message                         TEXT,
    exercice_suggere_id             BIGINT       REFERENCES exercices(id),
    duree_assi_avant_alerte_secondes BIGINT,
    date_envoi                      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_reponse                    TIMESTAMP,
    delai_snooze_secondes           INTEGER
);

CREATE INDEX idx_alerte_utilisateur ON alertes(utilisateur_id);
CREATE INDEX idx_alerte_session     ON alertes(session_id);

-- Protocoles curatifs
CREATE TABLE protocoles (
    id                    BIGSERIAL PRIMARY KEY,
    titre                 VARCHAR(200) NOT NULL,
    description           TEXT,
    zone                  VARCHAR(30)  NOT NULL,
    duree_semaines        INTEGER      NOT NULL,
    avertissement_medical TEXT,
    actif                 BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Étapes des protocoles
CREATE TABLE etapes_protocole (
    id           BIGSERIAL PRIMARY KEY,
    protocole_id BIGINT       NOT NULL REFERENCES protocoles(id) ON DELETE CASCADE,
    exercice_id  BIGINT       NOT NULL REFERENCES exercices(id),
    semaine      INTEGER      NOT NULL,
    ordre        INTEGER      NOT NULL,
    label_semaine VARCHAR(200),
    frequence    VARCHAR(100),
    verrouille   BOOLEAN      NOT NULL DEFAULT FALSE
);

-- Progressions des employés dans les protocoles
CREATE TABLE progressions_protocole (
    id                  BIGSERIAL PRIMARY KEY,
    utilisateur_id      BIGINT    NOT NULL REFERENCES utilisateurs(id),
    protocole_id        BIGINT    NOT NULL REFERENCES protocoles(id),
    date_debut          DATE      NOT NULL,
    semaine_courante    INTEGER   NOT NULL DEFAULT 1,
    etapes_completees   INTEGER   NOT NULL DEFAULT 0,
    etapes_totales      INTEGER   NOT NULL,
    date_creation       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_derniere_maj   TIMESTAMP,
    UNIQUE (utilisateur_id, protocole_id)
);

-- Kinésithérapeutes partenaires
CREATE TABLE kinesitherapeutes (
    id                  BIGSERIAL PRIMARY KEY,
    prenom              VARCHAR(100)  NOT NULL,
    nom                 VARCHAR(100)  NOT NULL,
    titre               VARCHAR(200),
    biographie          TEXT,
    specialites         VARCHAR(500),
    modes_intervention  VARCHAR(200),
    note_moyenne        DECIMAL(3,2),
    nombre_avis         INTEGER,
    adresse_cabinet     VARCHAR(200),
    ville               VARCHAR(100),
    telephone           VARCHAR(20),
    email               VARCHAR(200),
    url_photo           VARCHAR(500),
    actif               BOOLEAN       NOT NULL DEFAULT TRUE
);

-- Rendez-vous
CREATE TABLE rendez_vous (
    id                      BIGSERIAL PRIMARY KEY,
    employe_id              BIGINT    NOT NULL REFERENCES utilisateurs(id),
    kinesitherapeute_id     BIGINT    NOT NULL REFERENCES kinesitherapeutes(id),
    date_rdv                DATE      NOT NULL,
    heure_debut             TIME      NOT NULL,
    duree_minutes           INTEGER   NOT NULL DEFAULT 45,
    statut                  VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    motif                   TEXT,
    notes_seance            TEXT,
    date_reservation        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour        TIMESTAMP
);

CREATE INDEX idx_rdv_employe ON rendez_vous(employe_id);
CREATE INDEX idx_rdv_kine    ON rendez_vous(kinesitherapeute_id);
CREATE INDEX idx_rdv_date    ON rendez_vous(date_rdv);
