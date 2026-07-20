package cm.tonkine.backend.dto.response;

import cm.tonkine.backend.enums.StatutAlerte;
import cm.tonkine.backend.enums.TypeAlerte;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class AlerteResponse {
    private Long          id;
    private TypeAlerte    type;
    private StatutAlerte  statut;
    private String        message;
    private LocalDateTime dateEnvoi;
    private ExerciceResponse exerciceSuggere;
    private Long          dureeAssiAvantAlerteSecondes;
}
