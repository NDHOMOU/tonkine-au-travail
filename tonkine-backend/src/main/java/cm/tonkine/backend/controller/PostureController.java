package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.request.MesurePostureRequest;
import cm.tonkine.backend.dto.request.SignalerIndisponibiliteRequest;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Gestion des mesures posture et des alertes.
 * Base URL : /api/posture
 */
@RestController
@RequestMapping("/posture")
@RequiredArgsConstructor
public class PostureController {

    private final SessionService sessionService;

    /**
     * POST /api/posture/mesure
     * Reçoit chaque mesure posture envoyée par TensorFlow.js (React).
     * Appelé environ toutes les 5 secondes pendant la surveillance webcam.
     */
    @PostMapping("/mesure")
    public ResponseEntity<Void> enregistrerMesure(
            @Valid @RequestBody MesurePostureRequest req,
            @AuthenticationPrincipal Utilisateur utilisateur) {
        sessionService.enregistrerMesure(req, utilisateur);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/posture/alertes/{alerteId}/pause-confirmee
     * L'employé confirme qu'il a effectué sa pause.
     * Le minuteur 2h repart à zéro côté frontend.
     */
    @PostMapping("/alertes/{alerteId}/pause-confirmee")
    public ResponseEntity<Map<String, String>> confirmerPause(
            @PathVariable Long alerteId,
            @AuthenticationPrincipal Utilisateur utilisateur) {
        sessionService.confirmerPause(alerteId, utilisateur);
        return ResponseEntity.ok(Map.of("statut", "PAUSE_EFFECTUEE"));
    }

    /**
     * POST /api/posture/alertes/{alerteId}/snooze
     * L'employé demande un rappel dans X secondes (défaut : 600 = 10 min).
     */
    @PostMapping("/alertes/{alerteId}/snooze")
    public ResponseEntity<Map<String, String>> snoozerAlerte(
            @PathVariable Long alerteId,
            @RequestParam(defaultValue = "600") int delaiSecondes,
            @AuthenticationPrincipal Utilisateur utilisateur) {
        sessionService.snoozerAlerte(alerteId, delaiSecondes, utilisateur);
        return ResponseEntity.ok(Map.of("statut", "SNOOZEE", "delai", String.valueOf(delaiSecondes)));
    }

    /**
     * POST /api/posture/session/fermer
     * Ferme la session de travail (déconnexion ou fin de journée).
     */
    @PostMapping("/session/fermer")
    public ResponseEntity<Void> fermerSession(
            @RequestParam Long sessionId,
            @AuthenticationPrincipal Utilisateur utilisateur) {
        sessionService.fermerSession(sessionId, utilisateur);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/posture/alertes/surveillance-indisponible
     * Signale que la surveillance n'a pas pu démarrer (webcam refusée/absente,
     * modèle de détection non chargé...). Remonte une alerte à l'admin/kiné.
     */
    @PostMapping("/alertes/surveillance-indisponible")
    public ResponseEntity<Void> signalerSurveillanceIndisponible(
            @Valid @RequestBody SignalerIndisponibiliteRequest req,
            @AuthenticationPrincipal Utilisateur utilisateur) {
        sessionService.signalerSurveillanceIndisponible(req, utilisateur);
        return ResponseEntity.ok().build();
    }
}
