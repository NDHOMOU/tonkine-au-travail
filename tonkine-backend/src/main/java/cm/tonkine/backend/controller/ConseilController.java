package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.request.ConseilSanteRequest;
import cm.tonkine.backend.dto.request.ReponseConseilRequest;
import cm.tonkine.backend.dto.response.ConseilSanteResponse;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.service.ConseilService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Consultations en ligne employé ↔ kinésithérapeute.
 * Base URL : /api/conseils
 *
 * Employé  → POST   /conseils              — pose une question
 * Employé  → GET    /conseils/mes-conseils — historique de ses questions
 * Kiné     → GET    /conseils/file         — file d'attente (urgents d'abord)
 * Kiné     → PUT    /conseils/{id}/vu      — marque comme "vu"
 * Kiné     → POST   /conseils/{id}/reponse — envoie la réponse
 */
@RestController
@RequestMapping("/conseils")
@RequiredArgsConstructor
public class ConseilController {

    private final ConseilService conseilService;

    /**
     * POST /api/conseils
     * L'employé pose une question kinésithérapique depuis son poste.
     * Le kiné de l'entreprise est automatiquement déterminé.
     */
    @PostMapping
    public ResponseEntity<ConseilSanteResponse> poserQuestion(
            @Valid @RequestBody ConseilSanteRequest req,
            @AuthenticationPrincipal Utilisateur employe) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(conseilService.poserQuestion(employe, req));
    }

    /**
     * GET /api/conseils/mes-conseils
     * Historique des demandes de conseil de l'employé connecté.
     * Accessible par les EMPLOYE.
     */
    @GetMapping("/mes-conseils")
    public ResponseEntity<List<ConseilSanteResponse>> getMesConseils(
            @AuthenticationPrincipal Utilisateur employe) {
        return ResponseEntity.ok(conseilService.getMesConseils(employe));
    }

    /**
     * GET /api/conseils/file
     * File d'attente du kinésithérapeute (urgents d'abord, puis chronologique).
     * Accessible par les KINESITHERAPEUTE uniquement.
     */
    @GetMapping("/file")
    public ResponseEntity<List<ConseilSanteResponse>> getFileKine(
            @AuthenticationPrincipal Utilisateur kine) {
        return ResponseEntity.ok(conseilService.getFileKine(kine));
    }

    /**
     * PUT /api/conseils/{id}/vu
     * Le kiné ouvre la demande → statut passe à VU.
     * Déclenché automatiquement quand le kiné clique sur la demande.
     */
    @PutMapping("/{id}/vu")
    public ResponseEntity<ConseilSanteResponse> marquerVu(
            @PathVariable Long id,
            @AuthenticationPrincipal Utilisateur kine) {
        return ResponseEntity.ok(conseilService.marquerVu(id, kine));
    }

    /**
     * POST /api/conseils/{id}/reponse
     * Le kiné envoie sa réponse kinésithérapique → statut passe à REPONDU.
     */
    @PostMapping("/{id}/reponse")
    public ResponseEntity<ConseilSanteResponse> repondre(
            @PathVariable Long id,
            @Valid @RequestBody ReponseConseilRequest req,
            @AuthenticationPrincipal Utilisateur kine) {
        return ResponseEntity.ok(conseilService.repondre(id, kine, req));
    }
}
