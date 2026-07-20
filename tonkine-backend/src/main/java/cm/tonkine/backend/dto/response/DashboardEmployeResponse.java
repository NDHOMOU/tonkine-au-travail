package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/** Toutes les données du tableau de bord employé, en un seul appel API. */
@Data @Builder
public class DashboardEmployeResponse {

    // ── Profil ──
    private Long    userId;
    private String  nomComplet;
    private String  departement;

    // ── Scores posture du jour ──
    private Double scoreDosColonne;
    private Double scoreNuque;
    private Double scoreEpaules;
    private Double scorePoignets;
    private Double scoreHanches;
    private Double scoreYeux;
    private Double scoreGlobal;

    // ── Session courante ──
    private Long   sessionId;
    private Long   dureeAssisCourantSecondes;
    private Long   dureeAssisTotaleSecondes;

    // ── Statistiques journalières ──
    private int    nombrePausesEffectuees;
    private int    nombrePausesObjectif;
    private int    nombreAlertesIgnorees;
    private int    joursConsecutifsSansAlerteCritique;

    // ── Exercices du jour ──
    private List<ExerciceResponse> exercicesDuJour;

    // ── Historique des alertes de la session ──
    private List<AlerteResponse> alertesSession;

    // ── Configuration poste recommandée ──
    private Integer hauteurSiegeRecommandeCm;
    private Integer hauteurBureauRecommandeCm;
    private Integer hauteurEcranRecommandeCm;
}
