package cm.tonkine.backend.entity;

import cm.tonkine.backend.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Entité principale : un utilisateur de TonKiné au Travail.
 * Implémente UserDetails pour Spring Security.
 */
@Entity
@Table(name = "utilisateurs",
       uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Utilisateur implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(length = 100)
    private String departement;

    @Column(length = 100)
    private String poste;

    /** Langue préférée : "fr" ou "en" */
    @Column(length = 5)
    @Builder.Default
    private String langue = "fr";

    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    private LocalDateTime derniereConnexion;

    /** true = mot de passe généré par un admin, doit être changé à la prochaine connexion */
    @Column(nullable = false)
    @Builder.Default
    private boolean motDePasseTemporaire = false;

    /** Photo de profil (identification professionnelle), encodée en base64 */
    @Column(columnDefinition = "TEXT")
    private String photoProfilBase64;

    /**
     * Entreprise à laquelle appartient cet utilisateur.
     * Null uniquement pour les super-admins de la plateforme.
     * Clé d'isolation multi-tenant : toutes les requêtes filtrent sur cette FK.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    /** Relation 1-1 avec le profil ergonomique (créé à l'inscription étape 3) */
    @OneToOne(mappedBy = "utilisateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ProfilErgonomique profil;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

    // ── Spring Security ──

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getPassword()   { return motDePasse; }
    @Override public String getUsername()   { return email; }
    @Override public boolean isEnabled()    { return actif; }
    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isAccountNonLocked()     { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }

    /** Nom complet affiché dans l'interface */
    public String getNomComplet() {
        return prenom + " " + nom;
    }
}
