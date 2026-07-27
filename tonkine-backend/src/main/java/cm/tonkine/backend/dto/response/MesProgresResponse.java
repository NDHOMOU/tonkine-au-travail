package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class MesProgresResponse {
    /** Score de posture moyen, semaine par semaine */
    private List<PointHebdoResponse> tendanceScore;
    /** Nombre de pauses effectuées, semaine par semaine */
    private List<PointHebdoResponse> tendancePauses;
    /** true si trop peu de données pour une tendance fiable (moins de 2 semaines de sessions) */
    private boolean donneesInsuffisantes;
}
