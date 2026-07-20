package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Données d'inscription d'un nouvel employé ou kinésithérapeute.
 * Wizard en 3 étapes côté frontend :
 *   Étape 1 — Informations personnelles + entreprise
 *   Étape 2 — Photos posture (upload séparé via /profil/photos)
 *   Étape 3 — Profil ergonomique et planning
 */
@Data
public class InscriptionRequest {

    // ── Étape 1 : Identité ──

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 100)
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100)
    private String nom;

    @NotBlank @Email(message = "Email invalide")
    private String email;

    @NotBlank
    @Size(min = 8, message = "Mot de passe minimum 8 caractères")
    private String motDePasse;

    @NotBlank(message = "Le département est obligatoire")
    private String departement;

    private String poste;
    private String langue = "fr";

    /**
     * Identifiant de l'entreprise à laquelle appartient cet utilisateur.
     * Obligatoire pour tous les rôles sauf super-admin.
     */
    @NotNull(message = "L'entreprise est obligatoire")
    private Long entrepriseId;

    // ── Étape 3 : Profil ergonomique ──

    @NotNull @Min(100) @Max(250)
    private Integer tailleCm;

    @Min(20) @Max(80)  private Integer longueurJambeCm;
    @Min(15) @Max(50)  private Integer longueurAvantBrasCm;

    private String typeSiege;
    private String typeEcran;
    private Boolean bureauReglable   = false;
    private Boolean reposePieds      = false;
    private String heuresAssiParJour;
    private String douleursDeclarees;

    // Hobbies (séparés par virgules) — personnalisent les exercices suggérés
    private String hobbies;

    // Planning de travail
    private String joursTravailes = "1,2,3,4,5";
    private String heureArrivee   = "08:00";
    private String heureDepart    = "17:00";
}
