CREATE TABLE jetons_reinitialisation_mdp (
    id              BIGSERIAL PRIMARY KEY,
    utilisateur_id  BIGINT NOT NULL REFERENCES utilisateurs(id),
    jeton           VARCHAR(100) NOT NULL UNIQUE,
    date_expiration TIMESTAMP NOT NULL,
    utilise         BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jetons_reinitialisation_jeton ON jetons_reinitialisation_mdp(jeton);
