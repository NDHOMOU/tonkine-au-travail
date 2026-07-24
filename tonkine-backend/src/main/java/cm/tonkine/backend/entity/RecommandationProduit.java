package cm.tonkine.backend.entity;

import cm.tonkine.backend.enums.ZoneCorps;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Fiche produit recommandée par le kiné (orthèse, coussin ergonomique,
 * repose-pied...) — un lien externe vers le vendeur, pas de vente ni de
 * paiement dans l'application.
 */
@Entity
@Table(name = "recommandations_produits")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RecommandationProduit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Ex : "Orthèse", "Coussin ergonomique", "Repose-pied" */
    @Column(length = 100)
    private String categorie;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ZoneCorps zone;

    @Column(length = 500)
    private String urlImage;

    /** Lien vers la boutique/le vendeur externe */
    @Column(length = 500)
    private String urlExterne;

    /** Ex : "~15 000 FCFA" — indicatif, pas transactionnel */
    @Column(length = 100)
    private String prixIndicatif;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    private Entreprise entreprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cree_par_kine_id")
    private Utilisateur creeParKine;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
