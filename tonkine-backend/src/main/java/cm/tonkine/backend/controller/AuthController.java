package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.request.ConnexionRequest;
import cm.tonkine.backend.dto.request.InscriptionRequest;
import cm.tonkine.backend.dto.response.AuthResponse;
import cm.tonkine.backend.entity.Entreprise;
import cm.tonkine.backend.repository.EntrepriseRepository;
import cm.tonkine.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Endpoints publics d'authentification et d'onboarding.
 * Base URL : /api/auth
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService        authService;
    private final EntrepriseRepository entrepriseRepository;

    /**
     * POST /api/auth/connexion
     * Corps : { "email": "...", "motDePasse": "..." }
     * Réponse : AuthResponse avec token JWT + personnalisation entreprise
     */
    @PostMapping("/connexion")
    public ResponseEntity<AuthResponse> connecter(
            @Valid @RequestBody ConnexionRequest request) {
        return ResponseEntity.ok(authService.connecter(request));
    }

    /**
     * POST /api/auth/inscription
     * Corps : InscriptionRequest (données du wizard en 3 étapes)
     * Réponse : AuthResponse avec token JWT
     */
    @PostMapping("/inscription")
    public ResponseEntity<AuthResponse> inscrire(
            @Valid @RequestBody InscriptionRequest request) {
        AuthResponse response = authService.inscrire(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/auth/entreprises
     * Liste des entreprises actives — utilisée dans le formulaire d'inscription
     * pour que l'employé choisisse son entreprise.
     * Route PUBLIQUE (pas de token requis).
     */
    @GetMapping("/entreprises")
    public ResponseEntity<List<Map<String, Object>>> getEntreprises() {
        List<Entreprise> entreprises = entrepriseRepository.findAll()
            .stream()
            .filter(e -> Boolean.TRUE.equals(e.getActif()))
            .collect(Collectors.toList());

        List<Map<String, Object>> result = entreprises.stream().map(e ->
            Map.<String, Object>of(
                "id",                e.getId(),
                "nom",               e.getNom(),
                "nomApp",            e.getNomApp(),
                "ville",             e.getVille() != null ? e.getVille() : "",
                "couleurPrimaire",   e.getCouleurPrimaire(),
                "couleurSecondaire", e.getCouleurSecondaire(),
                "logoUrl",           e.getLogoUrl() != null ? e.getLogoUrl() : ""
            )
        ).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
