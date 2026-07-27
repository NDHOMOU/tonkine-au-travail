package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.response.DashboardEmployeResponse;
import cm.tonkine.backend.dto.response.MesProgresResponse;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.service.MesProgresService;
import cm.tonkine.backend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Tableau de bord employé.
 * Base URL : /api/dashboard
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SessionService sessionService;
    private final MesProgresService mesProgresService;

    /**
     * GET /api/dashboard/employe
     * Toutes les données de la page tableau de bord employé
     */
    @GetMapping("/employe")
    public ResponseEntity<DashboardEmployeResponse> getDashboardEmploye(
            @AuthenticationPrincipal Utilisateur utilisateur) {
        // Ouvre (ou récupère) la session de la journée
        sessionService.ouvrirSession(utilisateur);
        return ResponseEntity.ok(sessionService.getDashboard(utilisateur));
    }

    /**
     * GET /api/dashboard/mes-progres
     * Évolution du score de posture et des pauses de l'employé sur les
     * dernières semaines — sa propre tendance, pas celle de l'équipe.
     */
    @GetMapping("/mes-progres")
    public ResponseEntity<MesProgresResponse> getMesProgres(
            @AuthenticationPrincipal Utilisateur utilisateur) {
        return ResponseEntity.ok(mesProgresService.genererProgres(utilisateur));
    }
}
