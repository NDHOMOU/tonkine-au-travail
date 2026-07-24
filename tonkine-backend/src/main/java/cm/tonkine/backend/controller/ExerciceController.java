package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.response.ExerciceResponse;
import cm.tonkine.backend.entity.Exercice;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.enums.ZoneCorps;
import cm.tonkine.backend.repository.ExerciceRepository;
import cm.tonkine.backend.repository.ProfilErgonomiqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Bibliothèque d'exercices.
 * Base URL : /api/exercices
 */
@RestController
@RequestMapping("/exercices")
@RequiredArgsConstructor
public class ExerciceController {

    private final ExerciceRepository       exerciceRepository;
    private final ProfilErgonomiqueRepository profilRepository;

    /**
     * GET /api/exercices
     * Exercices actifs visibles par l'employé (bibliothèque globale + celle
     * ajoutée par le kiné de son entreprise), avec filtre optionnel par zone.
     */
    @GetMapping
    public ResponseEntity<List<ExerciceResponse>> getExercices(
            @RequestParam(required = false) ZoneCorps zone,
            @AuthenticationPrincipal Utilisateur utilisateur) {

        Long entrepriseId = utilisateur.getEntreprise() != null ? utilisateur.getEntreprise().getId() : null;

        List<Exercice> exercices = (zone != null)
            ? exerciceRepository.findVisiblesParEntrepriseEtZone(entrepriseId, zone)
            : exerciceRepository.findVisiblesParEntreprise(entrepriseId);

        return ResponseEntity.ok(
            exercices.stream().map(this::toResponse).collect(Collectors.toList())
        );
    }

    /**
     * GET /api/exercices/personnalises
     * Exercices filtrés selon les hobbies du profil de l'employé connecté.
     */
    @GetMapping("/personnalises")
    public ResponseEntity<List<ExerciceResponse>> getExercicesPersonnalises(
            @AuthenticationPrincipal Utilisateur utilisateur) {

        Long entrepriseId = utilisateur.getEntreprise() != null ? utilisateur.getEntreprise().getId() : null;

        return profilRepository.findByUtilisateurId(utilisateur.getId())
            .map(profil -> {
                if (profil.getHobbies() == null) {
                    return ResponseEntity.ok(exerciceRepository.findVisiblesParEntreprise(entrepriseId)
                        .stream().map(this::toResponse).collect(Collectors.toList()));
                }
                // Récupère les exercices pour chaque hobbie déclaré
                List<ExerciceResponse> resultats = Arrays
                    .stream(profil.getHobbies().split(","))
                    .map(String::trim)
                    .flatMap(h -> exerciceRepository.findByHobbieContaining(entrepriseId, h).stream())
                    .distinct()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
                return ResponseEntity.ok(resultats);
            })
            .orElseGet(() -> ResponseEntity.ok(List.of()));
    }

    private ExerciceResponse toResponse(Exercice e) {
        return ExerciceResponse.builder()
            .id(e.getId())
            .titre(e.getTitre())
            .description(e.getDescription())
            .zone(e.getZone())
            .dureeMinutes(e.getDureMinutes())
            .frequenceRecommandee(e.getFrequenceRecommandee())
            .niveauDifficulte(e.getNiveauDifficulte())
            .hobbiesAssocies(e.getHobbiesAssocies())
            .etapesJson(e.getEtapesJson())
            .urlVideo(e.getUrlVideo())
            .urlImage(e.getUrlImage())
            .build();
    }
}
