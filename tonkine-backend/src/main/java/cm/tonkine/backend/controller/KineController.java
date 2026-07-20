package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.response.DashboardKineResponse;
import cm.tonkine.backend.dto.response.PatientSuiviKineResponse;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.service.KineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Tableau de bord clinique du kinésithérapeute.
 * Toutes les routes nécessitent le rôle KINESITHERAPEUTE.
 * Base URL : /api/kine
 *
 * Endpoints :
 *  GET  /kine/dashboard            — Vue globale : KPIs + patients à risque + conseils
 *  GET  /kine/patients             — Liste complète des employés avec leur état postural
 *  GET  /kine/patients/{id}        — Détail d'un patient
 *  GET  /kine/patients/inactifs    — Employés sans app active aujourd'hui
 *  POST /kine/rdv/{rdvId}/notes    — Ajouter des notes de séance après un RDV
 */
@RestController
@RequestMapping("/kine")
@PreAuthorize("hasRole('KINESITHERAPEUTE')")
@RequiredArgsConstructor
public class KineController {

    private final KineService kineService;

    /**
     * GET /api/kine/dashboard
     * Tableau de bord complet :
     *  - KPIs (actifs, score moyen, alertes)
     *  - Patients à risque postural
     *  - File de conseils en attente (urgents d'abord)
     *  - Prochains RDV (aujourd'hui + 7 jours)
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardKineResponse> getDashboard(
            @AuthenticationPrincipal Utilisateur kine) {
        return ResponseEntity.ok(kineService.getDashboard(kine));
    }

    /**
     * GET /api/kine/patients/{employeId}
     * Fiche détaillée d'un patient pour le kiné.
     */
    @GetMapping("/patients/{employeId}")
    public ResponseEntity<PatientSuiviKineResponse> getDetailPatient(
            @PathVariable Long employeId,
            @AuthenticationPrincipal Utilisateur kine) {
        return ResponseEntity.ok(kineService.getDetailPatient(employeId, kine));
    }

    /**
     * POST /api/kine/rdv/{rdvId}/notes
     * Le kiné ajoute ses notes cliniques après une séance.
     */
    @PostMapping("/rdv/{rdvId}/notes")
    public ResponseEntity<Map<String, String>> ajouterNotes(
            @PathVariable Long rdvId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Utilisateur kine) {

        String notes = body.get("notes");
        if (notes == null || notes.isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("erreur", "Les notes ne peuvent pas être vides"));
        }

        kineService.ajouterNotesSeance(rdvId, notes, kine);
        return ResponseEntity.ok(Map.of("message", "Notes enregistrées avec succès"));
    }
}
