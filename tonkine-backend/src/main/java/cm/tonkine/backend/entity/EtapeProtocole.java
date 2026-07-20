package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Une étape (exercice) dans un protocole curatif.
 * Organisée par semaine et par ordre d'exécution.
 */
@Entity
@Table(name = "etapes_protocole")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EtapeProtocole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protocole_id", nullable = false)
    private Protocole protocole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercice_id", nullable = false)
    private Exercice exercice;

    /** Semaine du protocole (1, 2, 3...) */
    @Column(nullable = false)
    private Integer semaine;

    /** Ordre dans la semaine */
    @Column(nullable = false)
    private Integer ordre;

    /** Label de la semaine affiché : "Semaine 1 — Relâchement doux" */
    @Column(length = 200)
    private String labelSemaine;

    /** Fréquence spécifique pour cette étape */
    @Column(length = 100)
    private String frequence;

    /** true = débloqué seulement après validation des étapes précédentes */
    @Column(nullable = false)
    @Builder.Default
    private Boolean verrouille = false;
}
