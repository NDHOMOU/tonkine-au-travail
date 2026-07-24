package cm.tonkine.backend.dto.response;

import cm.tonkine.backend.enums.ZoneCorps;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class RecommandationProduitResponse {
    private Long           id;
    private String         titre;
    private String         description;
    private String         categorie;
    private ZoneCorps      zone;
    private String         urlImage;
    private String         urlExterne;
    private String         prixIndicatif;
    private Boolean        actif;
    private LocalDateTime  dateCreation;
}
