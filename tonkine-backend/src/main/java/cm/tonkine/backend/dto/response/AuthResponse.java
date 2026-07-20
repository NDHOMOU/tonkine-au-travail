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
    private Long    userId;
    private String  prenom;
    private String  nom;
    private String  email;
    private Role    role;
    private String  langue;

    /** false = photos posture pas encore uploadées (wizard incomplet) */
    private boolean profilComplet;

    // ── Personnalisation entreprise ──
    private Long    entrepriseId;
    private String  nomEntreprise;
    private String  nomApp;          // Ex : "KinéSanté Douala" au lieu de "TonKiné au Travail"
    private String  couleurPrimaire;
    private String  couleurSecondaire;
    private String  logoUrl;
}
