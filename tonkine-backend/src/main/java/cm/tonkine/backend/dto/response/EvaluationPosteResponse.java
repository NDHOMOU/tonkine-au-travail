package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class EvaluationPosteResponse {

    // ── Recommandation théorique, calculée depuis le profil de l'employé ──
    private Integer hauteurSiegeIdealeCm;
    private Integer hauteurBureauIdealeCm;
    private Integer hauteurEcranIdealeCm;

    // ── Résultat du scan webcam en direct (si angleGenouMesure fourni) ──
    /** CORRECT, SIEGE_TROP_BAS, SIEGE_TROP_HAUT */
    private String verdictAngleGenou;
    private String messageAngleGenou;

    // ── Résultat de l'évaluation par mesures manuelles (si fournies) ──
    /** Différence en cm avec la hauteur idéale (positif = trop haut) */
    private Integer ecartSiegeCm;
    /** CORRECT, TROP_HAUT, TROP_BAS */
    private String verdictSiege;

    private Integer ecartBureauCm;
    private String verdictBureau;
}
