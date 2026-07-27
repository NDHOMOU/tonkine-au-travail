package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class MonProfilResponse {
    // ── Identité (lecture seule) ──
    private String prenom;
    private String nom;
    private String email;
    private String departement;
    private String poste;

    // ── Mesures corporelles ──
    private Integer tailleCm;
    private Integer longueurJambeCm;
    private Integer longueurAvantBrasCm;
    private Integer poidsKg;

    // ── Configuration poste actuel ──
    private String  typeSiege;
    private String  typeEcran;
    private Boolean bureauReglable;
    private Boolean reposePieds;
    private String  heuresAssiParJour;

    // ── Santé ──
    private String douleursDeclarees;

    // ── Hobbies (liste séparée par virgules, ex "sport,lecture") ──
    private String hobbies;

    // ── Planning ──
    private String joursTravailes;
    private String heureArrivee;
    private String heureDepart;

    // ── Configuration optimale calculée (lecture seule) ──
    private Integer hauteurSiegeRecommandeCm;
    private Integer hauteurBureauRecommandeCm;
    private Integer hauteurEcranRecommandeCm;
}
