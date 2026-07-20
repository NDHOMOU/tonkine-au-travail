package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class SuiviEmployeResponse {
    private Long   userId;
    private String nomComplet;
    private String departement;
    private String poste;
    private String urlPhoto;
    private Double scorePostureGlobal;
    private Long   dureeAssisCourantSecondes;
    private int    pausesEffectueesAujourdhui;
    private int    pausesObjectifAujourdhui;
    private boolean sessionActive;
}
