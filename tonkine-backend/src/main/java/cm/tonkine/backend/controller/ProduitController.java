package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.response.RecommandationProduitResponse;
import cm.tonkine.backend.entity.RecommandationProduit;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.repository.RecommandationProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Catalogue de recommandations produits (orthèses, coussins ergonomiques...)
 * curé par le kiné de l'entreprise — fiches consultables, lien externe vers
 * le vendeur, aucune vente ni paiement dans l'application.
 * Base URL : /api/produits
 */
@RestController
@RequestMapping("/produits")
@RequiredArgsConstructor
public class ProduitController {

    private final RecommandationProduitRepository produitRepository;

    /**
     * GET /api/produits
     * Recommandations actives de l'entreprise de l'employé connecté.
     */
    @GetMapping
    public ResponseEntity<List<RecommandationProduitResponse>> getProduits(
            @AuthenticationPrincipal Utilisateur utilisateur) {

        if (utilisateur.getEntreprise() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<RecommandationProduit> produits = produitRepository
            .findByEntrepriseIdAndActifTrueOrderByTitreAsc(utilisateur.getEntreprise().getId());

        return ResponseEntity.ok(produits.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    private RecommandationProduitResponse toResponse(RecommandationProduit p) {
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
