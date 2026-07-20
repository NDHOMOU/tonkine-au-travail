package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entreprise cliente de TonKiné au Travail.
 *
 * Chaque entreprise dispose :
 *  - d'une personnalisation visuelle (logo, couleurs, nom de l'application)
 *  - d'un kinésithérapeute attitré (utilisateur avec rôle KINESITHERAPEUTE)
 *  - d'une licence avec limite d'employés et date d'expiration
 *
 * Principe multi-tenant : tous les utilisateurs (EMPLOYE, ADMIN_RH, KINESITHERAPEUTE)
 * appartiennent à une entreprise. Les données sont isolées par entreprise_id.
 */
@Entity
@Table(name = "entreprises")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Identité de l'entreprise ──
    @Column(nullable = false, length = 200)
    private String nom;

    /** Nom personnalisé de l'application pour cette entreprise */
    @Column(length = 200)
    @Builder.Default
    private String nomApp = "TonKiné au Travail";

    /** Slogan affiché dans l'interface */
    @Column(length = 300)
    private String slogan;

    /** URL du logo de l'entreprise (stocké dans /uploads/logos/) */
    @Column(length = 500)
    private String logoUrl;

    // ── Personnalisation des couleurs (hex CSS) ──
    @Column(length = 10)
    @Builder.Default
    private String couleurPrimaire = "#1353A4";

    @Column(length = 10)
    @Builder.Default
    private String couleurSecondaire = "#0B9B8A";

    // ── Coordonnées ──
    @Column(length = 300)
    private String adresse;

    @Column(length = 100)
    private String ville;

    @Column(length = 100)
    @Builder.Default
    private String pays = "Cameroun";

    @Column(length = 30)
    private String telephone;

    @Column(length = 200)
    private String emailContact;

    @Column(length = 300)
    private String siteWeb;

    @Column(length = 150)
    private String secteurActivite;

    // ── Licence SaaS ──
    /** Nombre maximum d'employés autorisés par la licence */
    @Column(nullable = false)
    @Builder.Default
    private Integer nombreEmployesMax = 50;

    /** Date d'expiration de la licence (null = illimitée) */
    private LocalDate dateExpirationLicence;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
