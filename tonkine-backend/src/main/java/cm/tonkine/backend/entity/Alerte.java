package cm.tonkine.backend.entity;

import cm.tonkine.backend.enums.StatutAlerte;
import cm.tonkine.backend.enums.TypeAlerte;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Alerte envoyée à un employé (pause 2h, mauvaise posture, message RH...).
 */
@Entity
@Table(name = "alertes",
       indexes = {
           @Index(name = "idx_alerte_utilisateur", columnList = "utilisateur_id"),
           @Index(name = "idx_alerte_session",     columnList = "session_id")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Alerte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private SessionTravail session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TypeAlerte type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutAlerte statut = StatutAlerte.ENVOYEE;

    /** Message personnalisé affiché dans la popup (si MESSAGE_ADMIN) */
    @Column(columnDefinition = "TEXT")
    private String message;

    /** Exercice suggéré dans la popup de pause (peut être null) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercice_suggere_id")
    private Exercice exerciceSuggere;

    /** Durée de sédentarité en secondes au moment de l'alerte */
    private Long dureeAssiAvantAlerteSecondes;

    @Column(nullable = false)
    private LocalDateTime dateEnvoi;

    /** Quand l'employé a vu/agi sur l'alerte */
    private LocalDateTime dateReponse;

    /** Délai de snooze choisi en secondes (600 = 10 min) */
    private Integer delaiSnoozeSecondes;

    @PrePersist
    protected void onCreate() {
        dateEnvoi = LocalDateTime.now();
    }
}
