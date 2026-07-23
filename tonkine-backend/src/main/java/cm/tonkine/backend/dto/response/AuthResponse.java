package cm.tonkine.backend.dto.response;

import cm.tonkine.backend.enums.Role;
import lombok.Builder;
import lombok.Data;

/**
 * Réponse renvoyée après connexion ou inscription réussie.
 * Contient les données de personnalisation de l'entreprise
 * pour que le frontend adapte l'interface dès la connexion.
 */
@Data
@Builder
public class AuthResponse {

    // ── Authentification ──
    private String  token;

    /** true = mot de passe correct, mais code de l'appli d'authentification requis pour finaliser */
    @Builder.Default
    private boolean requiert2FA = false;

    private Long    userId;
    private String  prenom;
    private String  nom;
    private String  email;
    private Role    role;
    private String  langue;

    /** false = photos posture pas encore uploadées (wizard incomplet) */
    private boolean profilComplet;

    /** true = mot de passe généré par un admin — le frontend doit forcer le changement */
    private boolean motDePasseTemporaire;

    /** Photo de profil (identification professionnelle), encodée en base64 */
    private String  photoProfilBase64;

    /** true = la 2FA est active sur ce compte */
    private boolean deuxFAActif;

    /** true = doit configurer la 2FA avant tout accès (nouveau compte, première connexion) */
    private boolean doitConfigurer2FA;

    // ── Personnalisation entreprise ──
    private Long    entrepriseId;
    private String  nomEntreprise;
    private String  nomApp;          // Ex : "KinéSanté Douala" au lieu de "TonKiné au Travail"
    private String  couleurPrimaire;
    private String  couleurSecondaire;
    private String  logoUrl;
}
