package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Suivi de la progression d'un employé dans un protocole curatif.
 */
@Entity
@Table(name = "progressions_protocole",
       uniqueConstraints = @UniqueConstraint(columnNames = {"utilisateur_id", "protocole_id"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProgressionProtocole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protocole_id", nullable = false)
    private Protocole protocole;

    /** Date de début du protocole */
    @Column(nullable = false)
    private LocalDate dateDebut;

    /** Semaine courante */
    @Column(nullable = false)
    @Builder.Default
    private Integer semaineCourante = 1;

    /** Nombre d'étapes complétées */
    @Column(nullable = false)
    @Builder.Default
    private Integer etapesCompletees = 0;

    /** Nombre total d'étapes du protocole */
    @Column(nullable = false)
    private Integer etapesTotales;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    private LocalDateTime dateDerniereMaj;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateDerniereMaj = LocalDateTime.now();
    }

    /** Calcul du pourcentage de progression */
    public int getPourcentageProgression() {
        if (etapesTotales == null || etapesTotales == 0) return 0;
        return (int) Math.round((etapesCompletees * 100.0) / etapesTotales);
    }
}
