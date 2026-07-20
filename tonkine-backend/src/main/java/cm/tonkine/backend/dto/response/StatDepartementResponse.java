package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class StatDepartementResponse {
    private String departement;
    private int    nombreEmployes;
    private double scoreMoyen;
}
