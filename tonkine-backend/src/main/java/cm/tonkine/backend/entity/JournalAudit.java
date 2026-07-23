package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Journal d'audit — trace les actions administratives sensibles
 * (création de compte, réinitialisation de mot de passe, modification
 * des paramètres entreprise, alerte collective…), pour savoir qui a
 * fait quoi et quand.
 */
@Entity
@Table(name = "journal_audit")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JournalAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acteur_id", nullable = false)
    private Utilisateur acteur;

    /** Code court de l'action, ex : CREATION_COMPTE_ADMIN, RESET_MOT_DE_PASSE */
    @Column(nullable = false, length = 60)
    private String action;

    /** Description lisible, ex : "Compte créé pour paul@entreprise.cm" */
    @Column(length = 500)
    private String details;

    @Column(nullable = false)
    private LocalDateTime dateAction;

    @PrePersist
    protected void onCreate() {
        dateAction = LocalDateTime.now();
    }
}
