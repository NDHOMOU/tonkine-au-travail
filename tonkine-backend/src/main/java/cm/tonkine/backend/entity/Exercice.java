package cm.tonkine.backend.entity;

import cm.tonkine.backend.enums.ZoneCorps;
import jakarta.persistence.*;
import lombok.*;

/**
 * Exercice de pause active dans la bibliothèque.
 * Contenu réel en base de données (pas de mock data).
 * Chargé par Flyway au premier démarrage.
 */
@Entity
@Table(name = "exercices")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Exercice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ZoneCorps zone;

    /** Durée recommandée en minutes */
    @Column(nullable = false)
    private Integer dureMinutes;

    /** Fréquence recommandée : "2× / jour", "3× / semaine" */
    @Column(length = 50)
    private String frequenceRecommandee;

    /** Niveau 1=facile, 2=moyen, 3=difficile */
    @Column(nullable = false)
    @Builder.Default
    private Integer niveauDifficulte = 1;

    /** Hobbie(s) associé(s) : "musique", "yoga", "sport"... */
    @Column(length = 200)
    private String hobbiesAssocies;

    /**
     * Étapes de réalisation en JSON structuré (stocké en TEXT).
     * Format : [{"etape":1,"instruction":"..."},...]
     * Le frontend React parse ce JSON.
     */
    @Column(columnDefinition = "TEXT")
    private String etapesJson;

    /** URL ou chemin de la vidéo de démonstration */
    @Column(length = 500)
    private String urlVideo;

    /** URL ou chemin de l'image de couverture */
    @Column(length = 500)
    private String urlImage;

    /** true = exercice actif dans la bibliothèque */
    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    /** null = contenu global (bibliothèque de base) ; sinon visible uniquement par cette entreprise */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    /** Kiné qui a ajouté cet exercice (null pour le contenu global d'origine) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cree_par_kine_id")
    private Utilisateur creeParKine;
}
