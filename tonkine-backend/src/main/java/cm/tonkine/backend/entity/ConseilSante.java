package cm.tonkine.backend.entity;

import cm.tonkine.backend.enums.StatutConseil;
import cm.tonkine.backend.enums.ZoneCorps;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Demande de conseil kinésithérapique en ligne.
 *
 * Un employé pose une question depuis son poste de travail.
 * Le kinésithérapeute de l'entreprise répond depuis le sien,
 * sans déplacement physique.
 *
 * Cycle : EN_ATTENTE → VU → REPONDU
 */
@Entity
@Table(name = "conseils_sante",
       indexes = {
           @Index(name = "idx_conseil_employe",    columnList = "employe_id"),
           @Index(name = "idx_conseil_kine",       columnList = "kine_id"),
           @Index(name = "idx_conseil_entreprise", columnList = "entreprise_id"),
           @Index(name = "idx_conseil_statut",     columnList = "statut")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ConseilSante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Employé qui pose la question */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Utilisateur employe;

    /** Kinésithérapeute de l'entreprise (rôle KINESITHERAPEUTE) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kine_id", nullable = false)
    private Utilisateur kine;

    /** Entreprise propriétaire de la demande (isolation multi-tenant) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    private Entreprise entreprise;

    /** La question posée par l'employé */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    /** Zone du corps concernée (optionnel — aide le kiné à trier) */
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ZoneCorps zoneConcernee;

    /** Niveau d'urgence signalé par l'employé */
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String niveauUrgence = "NORMAL";  // NORMAL | URGENT

    /** Statut de traitement par le kiné */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutConseil statut = StatutConseil.EN_ATTENTE;

    /** Réponse du kinésithérapeute */
    @Column(columnDefinition = "TEXT")
    private String reponse;

    /** Date à laquelle l'employé a posé la question */
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateQuestion;

    /** Date à laquelle le kiné a ouvert la demande pour la première fois */
    private LocalDateTime dateVue;

    /** Date à laquelle le kiné a fourni sa réponse */
    private LocalDateTime dateReponse;

    @PrePersist
    protected void onCreate() {
        dateQuestion = LocalDateTime.now();
    }
}
