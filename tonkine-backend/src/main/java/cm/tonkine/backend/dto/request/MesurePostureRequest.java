package cm.tonkine.backend.dto.request;

import cm.tonkine.backend.enums.ZoneCorps;
import jakarta.validation.constraints.*;
import lombok.Data;

/** Envoyée depuis TensorFlow.js (React) pour chaque mesure webcam. */
@Data
public class MesurePostureRequest {

    @NotNull private Long sessionId;
    @NotNull private ZoneCorps zone;

    @NotNull @Min(0) @Max(100)
    private Double score;

    private Double angleDegres;
    private Double angleReferenceNorme;
}
