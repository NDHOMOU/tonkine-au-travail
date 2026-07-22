package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Profil morphologique et ergonomique d'un employé.
 * Contient toutes les mesures pour calculer la configuration
 * optimale du poste de travail.
 */
@Entity
@Table(name = "profils_ergonomiques")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProfilErgonomique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;

    // ── Mesures corporelles ──
    /** Taille en centimètres */
    @Column(nullable = false)
    private Integer tailleCm;

    /** Longueur jambe : sol → genou en cm */
    private Integer longueurJambeCm;

    /** Longueur avant-bras : coude → poignet en cm */
    private Integer longueurAvantBrasCm;

    /** Poids en kg (facultatif) */
    private Integer poidsKg;

    @Column(length = 50)
    private String categorieMorphologique; // ectomorphe, mésomorphe, endomorphe

    // ── Configuration poste actuel ──
    @Column(length = 100)
    private String typeSiege;

    @Column(length = 100)
    private String typeEcran;

    @Column(nullable = false)
    @Builder.Default
    private Boolean bureauReglable = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean reposePieds = false;

    /** Heures assises par jour en moyenne */
    @Column(length = 20)
    private String heuresAssiParJour;

    // ── Douleurs déclarées à l'inscription ──
    @Column(columnDefinition = "TEXT")
    private String douleursDeclarees;

    // ── Configuration optimale calculée par le système ──
    private Integer hauteurSiegeRecommandeCm;
    private Integer hauteurBureauRecommandeCm;
    private Integer hauteurEcranRecommandeCm;

    // ── Hobbies (sérialisés en JSON-like, stockés en texte) ──
    /** Ex : "musique,sport,gastronomie" */
    @Column(length = 500)
    private String hobbies;

    // ── Planning de travail ──
    /** Jours travaillés : "1,2,3,4,5" (lundi=1 ... dimanche=7) */
    @Column(length = 20)
    private String joursTravailes;

    @Column(length = 5)
    private String heureArrivee; // "08:00"

    @Column(length = 5)
    private String heureDepart;  // "17:00"

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;

    // ── Photos posture (relation 1-N) ──
    @OneToMany(mappedBy = "profil", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PhotoPosture> photos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        calculerConfigurationOptimale();
    }

    @PreUpdate
    protected void onUpdate() {
        dateMiseAJour = LocalDateTime.now();
        calculerConfigurationOptimale();
    }

    /**
     * Calcule la configuration ergonomique optimale selon les mesures.
     * Formules basées sur les normes ISO 9241 et EN 1335.
     */
    public void calculerConfigurationOptimale() {
        if (longueurJambeCm != null) {
            // Hauteur siège = longueur jambe (angle 90° aux genoux)
            hauteurSiegeRecommandeCm = longueurJambeCm;

            // Hauteur bureau = hauteur siège + longueur avant-bras
            if (longueurAvantBrasCm != null) {
                hauteurBureauRecommandeCm = longueurJambeCm + longueurAvantBrasCm;
            }

            // Hauteur sommet écran = hauteur siège + 70 cm (yeux à ~63 cm du siège + marge)
            hauteurEcranRecommandeCm = longueurJambeCm + 70;
        }
    }
}
