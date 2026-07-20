package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Tableau de bord clinique du kinésithérapeute.
 * Outil d'aide à la décision : vue temps réel sur toute l'entreprise.
 */
@Data
@Builder
public class DashboardKineResponse {

    // ── KPIs globaux ──
    private long totalEmployes;
    private long employesActifsAujourdhui;
    private long employesAppInactive;       // App non lancée aujourd'hui
    private double scoreMoyenEquipe;

    // ── Alertes / Urgences ──
    private long conseilsEnAttente;         // Questions sans réponse
    private long conseilsUrgents;           // Questions marquées URGENT
    private long employesARisquePostural;   // Score global < 60

    // ── Listes détaillées ──

    /** Employés avec mauvaise posture (score < 60) — priorité d'intervention */
    private List<PatientSuiviKineResponse> patientsARisque;

    /** Employés sans application active aujourd'hui */
    private List<PatientSuiviKineResponse> patientsInactifs;

    /** File de conseils en attente (urgents en premier) */
    private List<ConseilSanteResponse> conseilsFile;

    /** Prochains RDV du kiné (aujourd'hui + cette semaine) */
    private List<RdvKineResponse> prochainRdv;
}
