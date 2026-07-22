-- ═══════════════════════════════════════════════════════════════
-- TonKiné au Travail — V1 : Création de toutes les tables
-- ✅ Compatible MySQL 8.0+ et MariaDB 10.4+
-- ═══════════════════════════════════════════════════════════════

-- Utilisateurs (employés + admins RH + kinés)
CREATE TABLE utilisateurs (
    id                 BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    prenom             VARCHAR(100) NOT NULL,
    nom                VARCHAR(100) NOT NULL,
    email              VARCHAR(200) NOT NULL UNIQUE,
    mot_de_passe       VARCHAR(255) NOT NULL,
    role               VARCHAR(20)  NOT NULL,
    departement        VARCHAR(100),
    poste              VARCHAR(100),
    langue             VARCHAR(5)   NOT NULL DEFAULT 'fr',
    actif              BOOLEAN      NOT NULL DEFAULT TRUE,
    date_creation      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion DATETIME,
    entreprise_id      BIGINT,
    CONSTRAINT chk_role CHECK (role IN ('EMPLOYE','ADMIN_RH','KINESITHERAPEUTE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Profils ergonomiques (1-1 avec utilisateur)
CREATE TABLE profils_ergonomiques (
    id                            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id                BIGINT       NOT NULL UNIQUE,
    taille_cm                     INTEGER      NOT NULL,
    longueur_jambe_cm             INTEGER,
    longueur_avant_bras_cm        INTEGER,
    poids_kg                      INTEGER,
    categorie_morphologique       VARCHAR(50),
    type_siege                    VARCHAR(100),
    type_ecran                    VARCHAR(100),
    bureau_reglable               BOOLEAN      NOT NULL DEFAULT FALSE,
    repose_pieds                  BOOLEAN      NOT NULL DEFAULT FALSE,
    heures_assi_par_jour          VARCHAR(20),
    douleurs_declarees            TEXT,
    hauteur_siege_recommande_cm   INTEGER,
    hauteur_bureau_recommande_cm  INTEGER,
    hauteur_ecran_recommande_cm   INTEGER,
    hobbies                       VARCHAR(500),
    jours_travailes               VARCHAR(20),
    heure_arrivee                 VARCHAR(5),
    heure_depart                  VARCHAR(5),
    date_creation                 DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour              DATETIME,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Photos de posture
CREATE TABLE photos_posture (
    id             BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    profil_id      BIGINT       NOT NULL,
    vue            VARCHAR(20)  NOT NULL,
    chemin_fichier VARCHAR(500) NOT NULL,
    nom_original   VARCHAR(255),
    type_mime      VARCHAR(50),
    taille_octets  BIGINT,
    date_upload    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_vue CHECK (vue IN ('FACE','DOS','PROFIL_GAUCHE','PROFIL_DROIT')),
    FOREIGN KEY (profil_id) REFERENCES profils_ergonomiques(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions de travail
CREATE TABLE sessions_travail (
    id                            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id                BIGINT       NOT NULL,
    date_debut                    DATETIME     NOT NULL,
    date_fin                      DATETIME,
    duree_assis_total_secondes    BIGINT       NOT NULL DEFAULT 0,
    nombre_pauses_effectuees      INTEGER      NOT NULL DEFAULT 0,
    nombre_alertes_envoyees       INTEGER      NOT NULL DEFAULT 0,
    nombre_alertes_ignorees       INTEGER      NOT NULL DEFAULT 0,
    score_dos_colonne             DOUBLE,
    score_nuque                   DOUBLE,
    score_epaules                 DOUBLE,
    score_poignets                DOUBLE,
    score_hanches                 DOUBLE,
    score_yeux                    DOUBLE,
    score_global                  DOUBLE,
    date_creation                 DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_session_utilisateur ON sessions_travail(utilisateur_id);
CREATE INDEX idx_session_debut       ON sessions_travail(date_debut);

-- Mesures de posture (envoyées par TensorFlow.js)
CREATE TABLE mesures_posture (
    id                     BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_id             BIGINT       NOT NULL,
    zone                   VARCHAR(30)  NOT NULL,
    score                  DOUBLE NOT NULL,
    angle_degres           DOUBLE,
    angle_reference_norme  DOUBLE,
    conforme               BOOLEAN      NOT NULL DEFAULT TRUE,
    horodatage             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions_travail(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_mesure_session ON mesures_posture(session_id);

-- Exercices de pause active
CREATE TABLE exercices (
    id                      BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titre                   VARCHAR(200) NOT NULL,
    description             TEXT         NOT NULL,
    zone                    VARCHAR(30)  NOT NULL,
    dure_minutes            INTEGER      NOT NULL,
    frequence_recommandee   VARCHAR(50),
    niveau_difficulte       INTEGER      NOT NULL DEFAULT 1,
    hobbies_associes        VARCHAR(200),
    etapes_json             TEXT,
    url_video               VARCHAR(500),
    url_image               VARCHAR(500),
    actif                   BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_niveau CHECK (niveau_difficulte IN (1,2,3))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alertes
CREATE TABLE alertes (
    id                               BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id                   BIGINT       NOT NULL,
    session_id                       BIGINT,
    type                             VARCHAR(30)  NOT NULL,
    statut                           VARCHAR(20)  NOT NULL DEFAULT 'ENVOYEE',
    message                          TEXT,
    exercice_suggere_id              BIGINT,
    duree_assi_avant_alerte_secondes BIGINT,
    date_envoi                       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_reponse                     DATETIME,
    delai_snooze_secondes            INTEGER,
    FOREIGN KEY (utilisateur_id)    REFERENCES utilisateurs(id),
    FOREIGN KEY (session_id)        REFERENCES sessions_travail(id),
    FOREIGN KEY (exercice_suggere_id) REFERENCES exercices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_alerte_utilisateur ON alertes(utilisateur_id);
CREATE INDEX idx_alerte_session     ON alertes(session_id);

-- Protocoles curatifs
CREATE TABLE protocoles (
    id                    BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titre                 VARCHAR(200) NOT NULL,
    description           TEXT,
    zone                  VARCHAR(30)  NOT NULL,
    duree_semaines        INTEGER      NOT NULL,
    avertissement_medical TEXT,
    actif                 BOOLEAN      NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Étapes des protocoles
CREATE TABLE etapes_protocole (
    id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    protocole_id  BIGINT       NOT NULL,
    exercice_id   BIGINT       NOT NULL,
    semaine       INTEGER      NOT NULL,
    ordre         INTEGER      NOT NULL,
    label_semaine VARCHAR(200),
    frequence     VARCHAR(100),
    verrouille    BOOLEAN      NOT NULL DEFAULT FALSE,
    FOREIGN KEY (protocole_id) REFERENCES protocoles(id) ON DELETE CASCADE,
    FOREIGN KEY (exercice_id)  REFERENCES exercices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Progressions des employés dans les protocoles
CREATE TABLE progressions_protocole (
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id      BIGINT       NOT NULL,
    protocole_id        BIGINT       NOT NULL,
    date_debut          DATE         NOT NULL,
    semaine_courante    INTEGER      NOT NULL DEFAULT 1,
    etapes_completees   INTEGER      NOT NULL DEFAULT 0,
    etapes_totales      INTEGER      NOT NULL,
    date_creation       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_derniere_maj   DATETIME,
    UNIQUE KEY uq_prog_user_proto (utilisateur_id, protocole_id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    FOREIGN KEY (protocole_id)   REFERENCES protocoles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────
-- Multi-tenant : entreprises (inclus dès V1 pour MySQL)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE entreprises (
    id                       BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
    date_creation            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clé étrangère entre utilisateurs et entreprises
ALTER TABLE utilisateurs
    ADD CONSTRAINT fk_user_entreprise
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE SET NULL;

CREATE INDEX idx_user_entreprise ON utilisateurs(entreprise_id);

-- Rendez-vous (kiné = utilisateur avec rôle KINESITHERAPEUTE)
CREATE TABLE rendez_vous (
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employe_id          BIGINT       NOT NULL,
    kine_id             BIGINT       NOT NULL,
    entreprise_id       BIGINT       NOT NULL,
    date_rdv            DATE         NOT NULL,
    heure_debut         TIME         NOT NULL,
    duree_minutes       INTEGER      NOT NULL DEFAULT 45,
    statut              VARCHAR(20)  NOT NULL DEFAULT 'EN_ATTENTE',
    motif               TEXT,
    notes_seance        TEXT,
    date_reservation    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour    DATETIME,
    CONSTRAINT chk_statut_rdv CHECK (statut IN ('EN_ATTENTE','CONFIRME','EFFECTUE','ANNULE')),
    FOREIGN KEY (employe_id)    REFERENCES utilisateurs(id),
    FOREIGN KEY (kine_id)       REFERENCES utilisateurs(id),
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_rdv_employe    ON rendez_vous(employe_id);
CREATE INDEX idx_rdv_kine       ON rendez_vous(kine_id);
CREATE INDEX idx_rdv_entreprise ON rendez_vous(entreprise_id);
CREATE INDEX idx_rdv_date       ON rendez_vous(date_rdv);

-- Conseils santé (consultations en ligne employé ↔ kiné)
CREATE TABLE conseils_sante (
    id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employe_id        BIGINT       NOT NULL,
    kine_id           BIGINT       NOT NULL,
    entreprise_id     BIGINT       NOT NULL,
    question          TEXT         NOT NULL,
    zone_concernee    VARCHAR(30),
    niveau_urgence    VARCHAR(10)  NOT NULL DEFAULT 'NORMAL',
    statut            VARCHAR(20)  NOT NULL DEFAULT 'EN_ATTENTE',
    reponse           TEXT,
    date_question     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_vue          DATETIME,
    date_reponse      DATETIME,
    CONSTRAINT chk_urgence CHECK (niveau_urgence IN ('NORMAL','URGENT')),
    CONSTRAINT chk_statut_conseil CHECK (statut IN ('EN_ATTENTE','VU','REPONDU')),
    FOREIGN KEY (employe_id)    REFERENCES utilisateurs(id),
    FOREIGN KEY (kine_id)       REFERENCES utilisateurs(id),
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_conseil_employe    ON conseils_sante(employe_id);
CREATE INDEX idx_conseil_kine       ON conseils_sante(kine_id);
CREATE INDEX idx_conseil_entreprise ON conseils_sante(entreprise_id);
CREATE INDEX idx_conseil_statut     ON conseils_sante(statut);
