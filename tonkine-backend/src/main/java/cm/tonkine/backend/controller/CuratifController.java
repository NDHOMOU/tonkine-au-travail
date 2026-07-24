package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.response.EtapeProtocoleResponse;
import cm.tonkine.backend.dto.response.ProgressionProtocoleResponse;
import cm.tonkine.backend.dto.response.ProtocoleResponse;
import cm.tonkine.backend.entity.Protocole;
import cm.tonkine.backend.entity.ProgressionProtocole;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.ZoneCorps;
import cm.tonkine.backend.repository.ProgressionProtocoleRepository;
import cm.tonkine.backend.repository.ProtocoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Protocoles curatifs — programmes de rééducation multi-semaines.
 * Base URL : /api/curatif
 */
@RestController
@RequestMapping("/curatif")
@RequiredArgsConstructor
public class CuratifController {

    private final ProtocoleRepository          protocoleRepository;
    private final ProgressionProtocoleRepository progressionRepository;

    /**
     * GET /api/curatif/protocoles
     * Protocoles actifs visibles par l'employé (bibliothèque globale + celle
     * ajoutée par le kiné de son entreprise), filtrables par zone.
     */
    @GetMapping("/protocoles")
    public ResponseEntity<List<ProtocoleResponse>> getProtocoles(
            @RequestParam(required = false) ZoneCorps zone,
            @AuthenticationPrincipal Utilisateur utilisateur) {

        Long entrepriseId = utilisateur.getEntreprise() != null ? utilisateur.getEntreprise().getId() : null;
        List<Protocole> protocoles = protocoleRepository.findVisiblesParEntreprise(entrepriseId, zone);

        return ResponseEntity.ok(
            protocoles.stream().map(this::toProtocoleResponse).collect(Collectors.toList())
        );
    }

    /**
     * GET /api/curatif/mes-progressions
     * Progressions de l'employé connecté sur tous ses protocoles en cours.
     */
    @GetMapping("/mes-progressions")
    public ResponseEntity<List<ProgressionProtocoleResponse>> getMesProgressions(
            @AuthenticationPrincipal Utilisateur utilisateur) {

        List<ProgressionProtocole> progressions =
            progressionRepository.findByUtilisateurId(utilisateur.getId());

        return ResponseEntity.ok(
            progressions.stream().map(this::toProgressionResponse).collect(Collectors.toList())
        );
    }

    /**
     * POST /api/curatif/protocoles/{id}/demarrer
     * Démarre un protocole pour l'employé connecté (ou reprend si déjà existant).
     */
    @PostMapping("/protocoles/{id}/demarrer")
    public ResponseEntity<ProgressionProtocoleResponse> demarrerProtocole(
            @PathVariable Long id,
            @AuthenticationPrincipal Utilisateur utilisateur) {

        Protocole protocole = protocoleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Protocole introuvable : " + id));

        // Si déjà en cours → retourner la progression existante
        return progressionRepository
            .findByUtilisateurIdAndProtocoleId(utilisateur.getId(), id)
            .map(p -> ResponseEntity.ok(toProgressionResponse(p)))
            .orElseGet(() -> {
                int nbEtapes = protocole.getEtapes().size();
                ProgressionProtocole nouvelle = ProgressionProtocole.builder()
                    .utilisateur(utilisateur)
                    .protocole(protocole)
                    .dateDebut(LocalDate.now())
                    .semaineCourante(1)
                    .etapesCompletees(0)
                    .etapesTotales(nbEtapes)
                    .build();
                ProgressionProtocole sauvee = progressionRepository.save(nouvelle);
                return ResponseEntity.ok(toProgressionResponse(sauvee));
            });
    }

    // ── Helpers ──

    private ProtocoleResponse toProtocoleResponse(Protocole p) {
        List<EtapeProtocoleResponse> etapes = p.getEtapes().stream()
            .map(e -> EtapeProtocoleResponse.builder()
                .id(e.getId())
                .semaine(e.getSemaine())
                .ordre(e.getOrdre())
                .labelSemaine(e.getLabelSemaine())
                .frequence(e.getFrequence())
                .verrouille(e.getVerrouille())
                .exerciceId(e.getExercice() != null ? e.getExercice().getId() : null)
                .exerciceTitre(e.getExercice() != null ? e.getExercice().getTitre() : null)
                .exerciceDescription(e.getExercice() != null ? e.getExercice().getDescription() : null)
                .exerciceDureeMinutes(e.getExercice() != null ? e.getExercice().getDureMinutes() : null)
                .build())
            .collect(Collectors.toList());

        return ProtocoleResponse.builder()
            .id(p.getId())
            .titre(p.getTitre())
            .description(p.getDescription())
            .zone(p.getZone())
            .dureeSemaines(p.getDureeSemaines())
            .avertissementMedical(p.getAvertissementMedical())
            .etapes(etapes)
            .build();
    }

    private ProgressionProtocoleResponse toProgressionResponse(ProgressionProtocole pp) {
        return ProgressionProtocoleResponse.builder()
            .id(pp.getId())
            .protocoleId(pp.getProtocole().getId())
            .protocoleTitle(pp.getProtocole().getTitre())
            .dateDebut(pp.getDateDebut())
            .semaineCourante(pp.getSemaineCourante())
            .etapesCompletees(pp.getEtapesCompletees())
            .etapesTotales(pp.getEtapesTotales())
            .pourcentageProgression(pp.getPourcentageProgression())
            .build();
    }
}
