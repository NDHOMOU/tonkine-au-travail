package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TendanceDepartementResponse {
    private String departement;
    private List<PointHebdoResponse> points;
}
