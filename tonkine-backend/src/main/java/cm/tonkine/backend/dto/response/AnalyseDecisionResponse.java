package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnalyseDecisionResponse {
    /** Évolution du score de posture moyen par département, semaine par semaine. */
    private List<TendanceDepartementResponse> tendanceParDepartement;
    /** Employés dont le score se dégrade entre les deux dernières semaines et les deux précédentes. */
    private List<EmployeADegradationResponse> employesADegradation;
    /** Taux d'alertes suivies d'une pause (vs ignorées), semaine par semaine. */
    private List<PointHebdoResponse> tauxSuiviAlertes;
    /** true si trop peu de données pour une analyse fiable (période < 2 semaines de sessions). */
    private boolean donneesInsuffisantes;
}
