package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EntrepriseResponse {
    private Long   id;
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
