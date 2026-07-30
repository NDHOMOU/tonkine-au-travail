package cm.tonkine.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Jeton à usage unique pour la réinitialisation de mot de passe
 * ("mot de passe oublié"), envoyé par e-mail.
 */
@Entity
@Table(name = "jetons_reinitialisation_mdp")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JetonReinitialisationMotDePasse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(nullable = false, unique = true, length = 100)
    private String jeton;

    @Column(nullable = false)
    private LocalDateTime dateExpiration;

    @Builder.Default
    @Column(nullable = false)
    private boolean utilise = false;

    @Column(nullable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
