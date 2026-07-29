package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Inscription d'une nouvelle entreprise cliente — la personne qui remplit ce
 * formulaire devient automatiquement son premier Admin RH.
 */
@Data
public class InscrireEntrepriseRequest {

    @NotBlank(message = "Le nom de l'entreprise est obligatoire")
    private String nomEntreprise;

    private String ville;
    private String secteurActivite;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank @Email(message = "Email invalide")
    private String email;

    @NotBlank
    @Size(min = 8, message = "Mot de passe minimum 8 caractères")
    private String motDePasse;
}
