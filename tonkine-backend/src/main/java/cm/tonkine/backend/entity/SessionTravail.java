package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Session de travail d'un employé (entre connexion et déconnexion).
 * Accumule les mesures de posture et les alertes de la journée.
 */
@Entity
@Table(name = "sessions_travail",
       indexes = {
           @Index(name = "idx_session_utilisateur", columnList = "utilisateur_id"),
           @Index(name = "idx_session_debut",       columnList = "dateDebut")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SessionTravail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(nullable = false)
    private LocalDateTime dateDebut;

    private LocalDateTime dateFin;

    /** Durée assise totale en secondes */
    @Builder.Default
    private Long dureeAssisTotalSecondes = 0L;

    /** Nombre de pauses actives effectuées */
    @Builder.Default
    private Integer nombrePausesEffectuees = 0;

    /** Nombre d'alertes envoyées */
    @Builder.Default
    private Integer nombreAlertesEnvoyees = 0;

    /** Nombre d'alertes ignorées */
    @Builder.Default
    private Integer nombreAlertesIgnorees = 0;

    // ── Scores posture de la session (moyennes) ──
    private Double scoreDosColonne;
    private Double scoreNuque;
    private Double scoreEpaules;
    private Double scorePoignets;
    private Double scoreHanches;
    private Double scoreYeux;

    /** Score global calculé (moyenne pondérée) */
    private Double scoreGlobal;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Alerte> alertes = new ArrayList<>();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MesurePosture> mesures = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

    /**
     * Calcule le score global pondéré selon l'importance clinique de chaque zone.
     * Nuque et dos ont un poids plus important (zones les plus à risque).
     */
    public void calculerScoreGlobal() {
        if (scoreNuque == null && scoreDosColonne == null) return;
        double somme = 0;
        double poids = 0;
        if (scoreDosColonne != null) { somme += scoreDosColonne * 0.25; poids += 0.25; }
        if (scoreNuque      != null) { somme += scoreNuque      * 0.25; poids += 0.25; }
        if (scoreEpaules    != null) { somme += scoreEpaules    * 0.15; poids += 0.15; }
        if (scorePoignets   != null) { somme += scorePoignets   * 0.15; poids += 0.15; }
        if (scoreHanches    != null) { somme += scoreHanches    * 0.10; poids += 0.10; }
        if (scoreYeux       != null) { somme += scoreYeux       * 0.10; poids += 0.10; }
        this.scoreGlobal = poids > 0 ? Math.round((somme / poids) * 10.0) / 10.0 : null;
    }
}
