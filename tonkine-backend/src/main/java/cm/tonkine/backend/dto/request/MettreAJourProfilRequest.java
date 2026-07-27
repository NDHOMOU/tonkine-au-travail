package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MettreAJourProfilRequest {

    @NotNull @Min(100) @Max(250)
    private Integer tailleCm;

    @Min(20) @Max(80)
    private Integer longueurJambeCm;

    @Min(15) @Max(50)
    private Integer longueurAvantBrasCm;

    private Integer poidsKg;

    private String  typeSiege;
    private String  typeEcran;
    private Boolean bureauReglable;
    private Boolean reposePieds;
    private String  heuresAssiParJour;

    private String douleursDeclarees;

    /** Séparés par virgules, ex "sport,lecture" */
    private String hobbies;

    private String joursTravailes;
    private String heureArrivee;
    private String heureDepart;
}
