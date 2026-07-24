-- Permet à chaque kiné d'ajouter du contenu propre à son entreprise, en plus
-- de la bibliothèque globale existante (entreprise_id NULL = visible partout).
ALTER TABLE exercices ADD COLUMN entreprise_id BIGINT REFERENCES entreprises(id) ON DELETE CASCADE;
ALTER TABLE exercices ADD COLUMN cree_par_kine_id BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL;

ALTER TABLE protocoles ADD COLUMN entreprise_id BIGINT REFERENCES entreprises(id) ON DELETE CASCADE;
ALTER TABLE protocoles ADD COLUMN cree_par_kine_id BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL;

-- Catalogue de recommandations produits (orthèses, coussins ergonomiques...) —
-- simples fiches avec lien externe, pas de vente/paiement dans l'application.
CREATE TABLE recommandations_produits (
    id               BIGSERIAL PRIMARY KEY,
    titre            VARCHAR(200)  NOT NULL,
    description      TEXT,
    categorie        VARCHAR(100),
    zone             VARCHAR(30),
    url_image        VARCHAR(500),
    url_externe      VARCHAR(500),
    prix_indicatif   VARCHAR(100),
    actif            BOOLEAN       NOT NULL DEFAULT TRUE,
    entreprise_id    BIGINT        NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
    cree_par_kine_id BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    date_creation    TIMESTAMP     NOT NULL DEFAULT now()
);
CREATE INDEX idx_produit_entreprise ON recommandations_produits(entreprise_id);
