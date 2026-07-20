package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Vue d'un patient (employé) dans le dashboard du kinésithérapeute.
 * Contient toutes les informations nécessaires pour la prise de décision clinique.
 */
@Data
@Builder
public class PatientSuiviKineResponse {

    private Long userId;
    private String nomComplet;
    private String departement;
    private String poste;

    // ── État posture ──
    private Double scorePostureGlobal;   // Score global de la session en cours
    private Double scoreDos;
    private Double scoreNuque;
    private Double scoreEpaules;
    private Double scorePoignets;

    // ── Temps assis ──
    private Long dureeAssisCourantSecondes;
    private boolean depassementTempsAssis; // > 7200s (2h)

    // ── Adhésion aux pauses ──
    private Integer pausesEffectueesAujourdhui;
    private Integer pausesObjectifAujourdhui;    // 4 pauses / jour
    private boolean respectePausesActives;

    // ── Exercices ──
    private Integer exercicesCompletesAujourdhui;
    private boolean appActive;                   // Session en cours ou non

    // ── Douleurs déclarées (profil) ──
    private String douleursDeclarees;

    // ── Conseil en attente pour cet employé ──
    private boolean aConseilEnAttente;
    private String niveauUrgenceConseil;         // NORMAL ou URGENT
}
