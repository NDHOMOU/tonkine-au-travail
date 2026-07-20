package cm.tonkine.backend.dto.response;

import cm.tonkine.backend.enums.ZoneCorps;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ExerciceResponse {
    private Long      id;
    private String    titre;
    private String    description;
    private ZoneCorps zone;
    private int       dureeMinutes;
    private String    frequenceRecommandee;
    private int       niveauDifficulte;
    private String    hobbiesAssocies;
    private String    etapesJson;
    private String    urlVideo;
    private String    urlImage;
}
