package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Personnalisation en libre-service par l'admin — pas les champs de licence
 * (nombreEmployesMax, dateExpirationLicence), qui restent gérés côté plateforme.
 */
@Data
public class MettreAJourEntrepriseRequest {

    @NotBlank
    private String nom;

    private String nomApp;
    private String slogan;
    private String logoUrl;
    private String couleurPrimaire;
    private String couleurSecondaire;
    private String adresse;
    private String ville;
    private String pays;
    private String telephone;
    private String emailContact;
    private String siteWeb;
    private String secteurActivite;
}
