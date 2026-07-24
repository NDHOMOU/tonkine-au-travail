package cm.tonkine.backend.dto.request;

import cm.tonkine.backend.enums.ZoneCorps;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecommandationProduitRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    private String description;
    private String categorie;
    private ZoneCorps zone;
    private String urlImage;
    private String urlExterne;
    private String prixIndicatif;
}
