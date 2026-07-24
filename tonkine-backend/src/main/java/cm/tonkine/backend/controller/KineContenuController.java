package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.request.EtapeProtocoleRequest;
import cm.tonkine.backend.dto.request.ExerciceRequest;
import cm.tonkine.backend.dto.request.ProtocoleRequest;
import cm.tonkine.backend.dto.request.RecommandationProduitRequest;
import cm.tonkine.backend.dto.response.EtapeProtocoleResponse;
import cm.tonkine.backend.dto.response.ExerciceResponse;
import cm.tonkine.backend.dto.response.ProtocoleResponse;
import cm.tonkine.backend.dto.response.RecommandationProduitResponse;
import cm.tonkine.backend.entity.EtapeProtocole;
import cm.tonkine.backend.entity.Exercice;
import cm.tonkine.backend.entity.Protocole;
import cm.tonkine.backend.entity.RecommandationProduit;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.repository.ExerciceRepository;
import cm.tonkine.backend.repository.ProtocoleRepository;
import cm.tonkine.backend.repository.RecommandationProduitRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Gestion du contenu propre à l'entreprise du kiné : bibliothèque d'exercices,
 * protocoles curatifs, catalogue de recommandations produits (orthèses...).
 * Le contenu global (entreprise = null) reste en lecture seule ici — chaque
 * kiné ne gère que ce qu'il a ajouté pour sa propre entreprise.
 * Base URL : /api/kine
 */
@RestController
@RequestMapping("/kine")
@PreAuthorize("hasRole('KINESITHERAPEUTE')")
@RequiredArgsConstructor
public class KineContenuController {

    private final ExerciceRepository             exerciceRepository;
    private final ProtocoleRepository             protocoleRepository;
    private final RecommandationProduitRepository produitRepository;

    // ── Exercices ──

    @GetMapping("/exercices")
    public ResponseEntity<List<ExerciceResponse>> listerExercices(@AuthenticationPrincipal Utilisateur kine) {
        Long entrepriseId = entrepriseId(kine);
        return ResponseEntity.ok(exerciceRepository.findByEntrepriseIdOrderByTitreAsc(entrepriseId)
            .stream().map(this::toExerciceResponse).collect(Collectors.toList()));
    }

    @PostMapping("/exercices")
    @Transactional
    public ResponseEntity<ExerciceResponse> creerExercice(
            @Valid @RequestBody ExerciceRequest req, @AuthenticationPrincipal Utilisateur kine) {

        Exercice exercice = Exercice.builder()
            .titre(req.getTitre())
            .description(req.getDescription())
            .zone(req.getZone())
            .dureMinutes(req.getDureeMinutes())
            .frequenceRecommandee(req.getFrequenceRecommandee())
            .niveauDifficulte(req.getNiveauDifficulte() != null ? req.getNiveauDifficulte() : 1)
            .hobbiesAssocies(req.getHobbiesAssocies())
            .urlVideo(req.getUrlVideo())
            .urlImage(req.getUrlImage())
            .actif(true)
            .entreprise(kine.getEntreprise())
            .creeParKine(kine)
            .build();

        return ResponseEntity.ok(toExerciceResponse(exerciceRepository.save(exercice)));
    }

    @PutMapping("/exercices/{id}")
    @Transactional
    public ResponseEntity<ExerciceResponse> modifierExercice(
            @PathVariable Long id, @Valid @RequestBody ExerciceRequest req,
            @AuthenticationPrincipal Utilisateur kine) {

        Exercice exercice = trouverExercicePourKine(id, kine);
        exercice.setTitre(req.getTitre());
        exercice.setDescription(req.getDescription());
        exercice.setZone(req.getZone());
        exercice.setDureMinutes(req.getDureeMinutes());
        exercice.setFrequenceRecommandee(req.getFrequenceRecommandee());
        exercice.setNiveauDifficulte(req.getNiveauDifficulte() != null ? req.getNiveauDifficulte() : 1);
        exercice.setHobbiesAssocies(req.getHobbiesAssocies());
        exercice.setUrlVideo(req.getUrlVideo());
        exercice.setUrlImage(req.getUrlImage());

        return ResponseEntity.ok(toExerciceResponse(exerciceRepository.save(exercice)));
    }

    /** Retire l'exercice de la bibliothèque (désactivation, pas de suppression physique). */
    @DeleteMapping("/exercices/{id}")
    @Transactional
    public ResponseEntity<Void> retirerExercice(@PathVariable Long id, @AuthenticationPrincipal Utilisateur kine) {
        Exercice exercice = trouverExercicePourKine(id, kine);
        exercice.setActif(false);
        exerciceRepository.save(exercice);
        return ResponseEntity.noContent().build();
    }

    // ── Protocoles curatifs ──

    @GetMapping("/protocoles")
    public ResponseEntity<List<ProtocoleResponse>> listerProtocoles(@AuthenticationPrincipal Utilisateur kine) {
        Long entrepriseId = entrepriseId(kine);
        return ResponseEntity.ok(protocoleRepository.findByEntrepriseIdOrderByTitreAsc(entrepriseId)
            .stream().map(this::toProtocoleResponse).collect(Collectors.toList()));
    }

    @PostMapping("/protocoles")
    @Transactional
    public ResponseEntity<ProtocoleResponse> creerProtocole(
            @Valid @RequestBody ProtocoleRequest req, @AuthenticationPrincipal Utilisateur kine) {

        Protocole protocole = Protocole.builder()
            .titre(req.getTitre())
            .description(req.getDescription())
            .zone(req.getZone())
            .dureeSemaines(req.getDureeSemaines())
            .avertissementMedical(req.getAvertissementMedical())
            .actif(true)
            .entreprise(kine.getEntreprise())
            .creeParKine(kine)
            .etapes(new ArrayList<>())
            .build();

        appliquerEtapes(protocole, req.getEtapes());

        return ResponseEntity.ok(toProtocoleResponse(protocoleRepository.save(protocole)));
    }

    @PutMapping("/protocoles/{id}")
    @Transactional
    public ResponseEntity<ProtocoleResponse> modifierProtocole(
            @PathVariable Long id, @Valid @RequestBody ProtocoleRequest req,
            @AuthenticationPrincipal Utilisateur kine) {

        Protocole protocole = trouverProtocolePourKine(id, kine);
        protocole.setTitre(req.getTitre());
        protocole.setDescription(req.getDescription());
        protocole.setZone(req.getZone());
        protocole.setDureeSemaines(req.getDureeSemaines());
        protocole.setAvertissementMedical(req.getAvertissementMedical());

        // orphanRemoval=true sur Protocole.etapes : vider puis reconstruire supprime
        // proprement les anciennes étapes et insère les nouvelles.
        protocole.getEtapes().clear();
        appliquerEtapes(protocole, req.getEtapes());

        return ResponseEntity.ok(toProtocoleResponse(protocoleRepository.save(protocole)));
    }

    @DeleteMapping("/protocoles/{id}")
    @Transactional
    public ResponseEntity<Void> retirerProtocole(@PathVariable Long id, @AuthenticationPrincipal Utilisateur kine) {
        Protocole protocole = trouverProtocolePourKine(id, kine);
        protocole.setActif(false);
        protocoleRepository.save(protocole);
        return ResponseEntity.noContent().build();
    }

    // ── Recommandations produits (orthèses...) ──

    @GetMapping("/produits")
    public ResponseEntity<List<RecommandationProduitResponse>> listerProduits(@AuthenticationPrincipal Utilisateur kine) {
        Long entrepriseId = entrepriseId(kine);
        return ResponseEntity.ok(produitRepository.findByEntrepriseIdOrderByTitreAsc(entrepriseId)
            .stream().map(this::toProduitResponse).collect(Collectors.toList()));
    }

    @PostMapping("/produits")
    @Transactional
    public ResponseEntity<RecommandationProduitResponse> creerProduit(
            @Valid @RequestBody RecommandationProduitRequest req, @AuthenticationPrincipal Utilisateur kine) {

        RecommandationProduit produit = RecommandationProduit.builder()
            .titre(req.getTitre())
            .description(req.getDescription())
            .categorie(req.getCategorie())
            .zone(req.getZone())
            .urlImage(req.getUrlImage())
            .urlExterne(req.getUrlExterne())
            .prixIndicatif(req.getPrixIndicatif())
            .actif(true)
            .entreprise(kine.getEntreprise())
            .creeParKine(kine)
            .build();

        return ResponseEntity.ok(toProduitResponse(produitRepository.save(produit)));
    }

    @PutMapping("/produits/{id}")
    @Transactional
    public ResponseEntity<RecommandationProduitResponse> modifierProduit(
            @PathVariable Long id, @Valid @RequestBody RecommandationProduitRequest req,
            @AuthenticationPrincipal Utilisateur kine) {

        RecommandationProduit produit = trouverProduitPourKine(id, kine);
        produit.setTitre(req.getTitre());
        produit.setDescription(req.getDescription());
        produit.setCategorie(req.getCategorie());
        produit.setZone(req.getZone());
        produit.setUrlImage(req.getUrlImage());
        produit.setUrlExterne(req.getUrlExterne());
        produit.setPrixIndicatif(req.getPrixIndicatif());

        return ResponseEntity.ok(toProduitResponse(produitRepository.save(produit)));
    }

    @DeleteMapping("/produits/{id}")
    @Transactional
    public ResponseEntity<Void> retirerProduit(@PathVariable Long id, @AuthenticationPrincipal Utilisateur kine) {
        RecommandationProduit produit = trouverProduitPourKine(id, kine);
        produit.setActif(false);
        produitRepository.save(produit);
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ──

    private Long entrepriseId(Utilisateur kine) {
        if (kine.getEntreprise() == null) {
            throw new IllegalStateException("Votre compte n'est pas rattaché à une entreprise.");
        }
        return kine.getEntreprise().getId();
    }

    private void appliquerEtapes(Protocole protocole, List<EtapeProtocoleRequest> etapesReq) {
        if (etapesReq == null) return;
        for (EtapeProtocoleRequest er : etapesReq) {
            Exercice exercice = exerciceRepository.findById(er.getExerciceId())
                .orElseThrow(() -> new IllegalArgumentException("Exercice introuvable : " + er.getExerciceId()));
            protocole.getEtapes().add(EtapeProtocole.builder()
                .protocole(protocole)
                .exercice(exercice)
                .semaine(er.getSemaine())
                .ordre(er.getOrdre())
                .labelSemaine(er.getLabelSemaine())
                .frequence(er.getFrequence())
                .verrouille(er.getVerrouille() != null ? er.getVerrouille() : false)
                .build());
        }
    }

    private Exercice trouverExercicePourKine(Long id, Utilisateur kine) {
        Exercice exercice = exerciceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Exercice introuvable"));
        Long entrepriseExercice = exercice.getEntreprise() != null ? exercice.getEntreprise().getId() : null;
        if (entrepriseExercice == null || !entrepriseExercice.equals(entrepriseId(kine))) {
            throw new AccessDeniedException("Vous ne pouvez modifier que les exercices ajoutés par votre entreprise");
        }
        return exercice;
    }

    private Protocole trouverProtocolePourKine(Long id, Utilisateur kine) {
        Protocole protocole = protocoleRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Protocole introuvable"));
        Long entrepriseProtocole = protocole.getEntreprise() != null ? protocole.getEntreprise().getId() : null;
        if (entrepriseProtocole == null || !entrepriseProtocole.equals(entrepriseId(kine))) {
            throw new AccessDeniedException("Vous ne pouvez modifier que les protocoles ajoutés par votre entreprise");
        }
        return protocole;
    }

    private RecommandationProduit trouverProduitPourKine(Long id, Utilisateur kine) {
        RecommandationProduit produit = produitRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Produit introuvable"));
        if (!produit.getEntreprise().getId().equals(entrepriseId(kine))) {
            throw new AccessDeniedException("Ce produit n'appartient pas à votre entreprise");
        }
        return produit;
    }

    private ExerciceResponse toExerciceResponse(Exercice e) {
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

    private RecommandationProduitResponse toProduitResponse(RecommandationProduit p) {
        return RecommandationProduitResponse.builder()
            .id(p.getId())
            .titre(p.getTitre())
            .description(p.getDescription())
            .categorie(p.getCategorie())
            .zone(p.getZone())
            .urlImage(p.getUrlImage())
            .urlExterne(p.getUrlExterne())
            .prixIndicatif(p.getPrixIndicatif())
            .actif(p.getActif())
            .dateCreation(p.getDateCreation())
            .build();
    }
}
