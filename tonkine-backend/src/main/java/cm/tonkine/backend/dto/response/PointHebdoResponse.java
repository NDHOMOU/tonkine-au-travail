package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PointHebdoResponse {
    private String semaine;
    private Double valeur;
}
