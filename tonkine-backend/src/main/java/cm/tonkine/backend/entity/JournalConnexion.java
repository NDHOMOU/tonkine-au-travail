package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Journal des connexions — sécurité : savoir qui s'est connecté, quand,
 * depuis quelle adresse IP.
 */
@Entity
@Table(name = "journal_connexions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JournalConnexion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(length = 60)
    private String adresseIp;

    @Column(nullable = false)
    private LocalDateTime dateConnexion;

    @PrePersist
    protected void onCreate() {
        dateConnexion = LocalDateTime.now();
    }
}
