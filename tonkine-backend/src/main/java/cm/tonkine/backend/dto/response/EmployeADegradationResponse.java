package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeADegradationResponse {
    private String nomComplet;
    private String departement;
    private Double scoreRecent;
    private Double scorePrecedent;
    private Double variation;
}
