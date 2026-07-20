package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Envoyée depuis le frontend quand la surveillance posturale n'a pas pu
 * démarrer (webcam refusée/absente, modèle de détection non chargé...).
 * sessionId peut être null si aucune session n'est encore ouverte.
 */
@Data
public class SignalerIndisponibiliteRequest {

    private Long sessionId;

    @NotBlank
    private String motif;
}
