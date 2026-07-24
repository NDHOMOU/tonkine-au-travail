package cm.tonkine.backend.dto.request;

import cm.tonkine.backend.enums.ZoneCorps;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExerciceRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "La zone est obligatoire")
    private ZoneCorps zone;

    @NotNull @Min(1)
    private Integer dureeMinutes;

    private String frequenceRecommandee;

    @Min(1) @Max(3)
    private Integer niveauDifficulte = 1;

    private String hobbiesAssocies;

    /** URL YouTube ou autre vidéo de démonstration */
    private String urlVideo;

    private String urlImage;
}
