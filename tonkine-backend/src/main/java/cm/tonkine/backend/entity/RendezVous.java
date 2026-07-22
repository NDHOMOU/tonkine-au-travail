package cm.tonkine.backend.entity;

import cm.tonkine.backend.enums.StatutRdv;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Rendez-vous entre un employé et le kinésithérapeute de l'entreprise.
 *
 * Modèle simplifié (1 kiné par entreprise) :
 *  - employe_id  → l'employé qui réserve
 *  - kine_id     → le kinésithérapeute de l'entreprise (rôle KINESITHERAPEUTE)
 *  - entreprise_id → isolation multi-tenant
 *
 * Le kiné n'est plus une entité "annuaire" externe — c'est un utilisateur
 * à part entière de l'application avec son propre dashboard.
 */
@Entity
@Table(name = "rendez_vous",
       indexes = {
           @Index(name = "idx_rdv_employe",     columnList = "employe_id"),
           @Index(name = "idx_rdv_kine",        columnList = "kine_id"),
           @Index(name = "idx_rdv_entreprise",  columnList = "entreprise_id"),
           @Index(name = "idx_rdv_date",        columnList = "date_rdv")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Employé qui prend le rendez-vous */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Utilisateur employe;

    /** Kinésithérapeute de l'entreprise (rôle KINESITHERAPEUTE) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kine_id", nullable = false)
    private Utilisateur kine;

    /** Isolation multi-tenant */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    private Entreprise entreprise;

    @Column(name = "date_rdv", nullable = false)
    private LocalDate dateRdv;

    @Column(nullable = false)
    private LocalTime heureDebut;

    /** Durée de la séance en minutes (45 min par défaut) */
    @Column(nullable = false)
    @Builder.Default
    private Integer dureeMinutes = 45;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutRdv statut = StatutRdv.EN_ATTENTE;

    /** Motif déclaré par l'employé à la réservation */
    @Column(columnDefinition = "TEXT")
    private String motif;

    /** Notes cliniques du kinésithérapeute après la séance */
    @Column(columnDefinition = "TEXT")
    private String notesSeance;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateReservation;

    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;

    @PrePersist
    protected void onCreate() {
        dateReservation = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateMiseAJour = LocalDateTime.now();
    }
}
