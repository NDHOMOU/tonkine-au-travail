package cm.tonkine.backend.entity;

import cm.tonkine.backend.enums.ZoneCorps;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Une mesure de posture instantanée prise par TensorFlow.js (webcam).
 * Envoyée depuis le frontend React toutes les X secondes.
 */
@Entity
@Table(name = "mesures_posture",
       indexes = @Index(name = "idx_mesure_session", columnList = "session_id"))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MesurePosture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private SessionTravail session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ZoneCorps zone;

    /** Score de 0 à 100 calculé par TensorFlow.js */
    @Column(nullable = false)
    private Double score;

    /** Angle mesuré en degrés (ex: inclinaison cervicale = 32°) */
    private Double angleDegres;

    /** Angle de référence pour cette zone selon la morphologie de l'employé */
    private Double angleReferenceNorme;

    /** true = posture conforme à la norme de cet employé */
    @Column(nullable = false)
    @Builder.Default
    private Boolean conforme = true;

    @Column(nullable = false)
    private LocalDateTime horodatage;

    @PrePersist
    protected void onCreate() {
        horodatage = LocalDateTime.now();
    }
}
