package cm.tonkine.backend.dto.response;

import cm.tonkine.backend.enums.StatutAlerte;
import cm.tonkine.backend.enums.TypeAlerte;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class AlerteAdminResponse {
    private Long          id;
    private String        nomEmploye;
    private String        departement;
    private String        urlPhotoEmploye;
    private TypeAlerte    type;
    private StatutAlerte  statut;
    private Double        scorePosture;
    private Long          dureeAssiSecondes;
    private LocalDateTime dateEnvoi;
}
