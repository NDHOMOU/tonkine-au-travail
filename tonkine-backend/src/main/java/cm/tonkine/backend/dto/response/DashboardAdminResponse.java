package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/** Vue d'ensemble RH — tableau de bord administrateur. */
@Data @Builder
public class DashboardAdminResponse {

    // ── KPIs globaux ──
    private long   totalEmployesInscrits;
    private long   totalEmployesActifsAujourdhui;
    private double scoreMoyenEquipe;
    private long   alertesActivesNonTraitees;
    private long   employesARisqueEleve;       // score < 60

    // ── Statistiques semaine ──
    private long   pausesEffectuesSemaine;
    private long   alertesIgnoreesSemaine;
    private double evolutionScoreSemaine;      // en %

    // ── Suivi par département ──
    private List<StatDepartementResponse> statsDepartements;

    // ── Employés actifs avec leur suivi temps réel ──
    private List<SuiviEmployeResponse> employes;

    // ── Alertes récentes non traitées ──
    private List<AlerteAdminResponse> alertesRecentes;
}
