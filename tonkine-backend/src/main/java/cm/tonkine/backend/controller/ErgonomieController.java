package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.request.EvaluationPosteRequest;
import cm.tonkine.backend.dto.response.EvaluationPosteResponse;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.service.ErgonomieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Aide au choix de mobilier ergonomique — scan webcam en direct ou saisie
 * manuelle des mesures d'un siège/bureau candidat.
 * Base URL : /api/ergonomie
 */
@RestController
@RequestMapping("/ergonomie")
@RequiredArgsConstructor
public class ErgonomieController {

    private final ErgonomieService ergonomieService;

    /**
     * POST /api/ergonomie/evaluer-poste
     */
    @PostMapping("/evaluer-poste")
    public ResponseEntity<EvaluationPosteResponse> evaluerPoste(
            @Valid @RequestBody EvaluationPosteRequest req,
            @AuthenticationPrincipal Utilisateur utilisateur) {
        return ResponseEntity.ok(ergonomieService.evaluerPoste(req, utilisateur));
    }
}
