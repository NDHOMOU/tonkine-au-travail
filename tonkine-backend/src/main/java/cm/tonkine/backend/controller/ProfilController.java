package cm.tonkine.backend.controller;

import cm.tonkine.backend.dto.request.ChangerMotDePasseRequest;
import cm.tonkine.backend.dto.request.Confirmer2FARequest;
import cm.tonkine.backend.dto.request.PhotoProfilRequest;
import cm.tonkine.backend.dto.response.Activer2FAResponse;
import cm.tonkine.backend.entity.Utilisateur;
import cm.tonkine.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Actions en libre-service sur son propre compte (tous rôles confondus).
 * Base URL : /api/profil
 */
@RestController
@RequestMapping("/profil")
@RequiredArgsConstructor
public class ProfilController {

    private final AuthService authService;

    /**
     * PUT /api/profil/mot-de-passe
     * Change son propre mot de passe. Utilisé notamment lors du changement
     * obligatoire à la première connexion (compte créé/réinitialisé par un admin).
     */
    @PutMapping("/mot-de-passe")
    public ResponseEntity<Map<String, String>> changerMotDePasse(
            @Valid @RequestBody ChangerMotDePasseRequest request,
            @AuthenticationPrincipal Utilisateur utilisateur) {

        authService.changerMotDePasse(utilisateur, request.getNouveauMotDePasse());
        return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour"));
    }

    /**
     * PUT /api/profil/avatar
     * Met à jour sa photo de profil (identification professionnelle).
     * Distinct de /profil/photos (les 4 photos posture pour l'analyse IA).
     */
    @PutMapping("/avatar")
    public ResponseEntity<Map<String, String>> mettreAJourPhoto(
            @Valid @RequestBody PhotoProfilRequest request,
            @AuthenticationPrincipal Utilisateur utilisateur) {

        authService.mettreAJourPhotoProfil(utilisateur, request.getPhotoBase64());
        return ResponseEntity.ok(Map.of("message", "Photo de profil mise à jour"));
    }

    /**
     * POST /api/profil/2fa/activer
     * Démarre l'activation de la 2FA : génère un secret, à saisir manuellement
     * dans une appli d'authentification (Google Authenticator, Authy…).
     * Pas encore actif tant que /confirmer n'a pas validé un premier code.
     */
    @PostMapping("/2fa/activer")
    public ResponseEntity<Activer2FAResponse> activerDeuxFA(
            @AuthenticationPrincipal Utilisateur utilisateur) {
        return ResponseEntity.ok(authService.demarrerActivationDeuxFA(utilisateur));
    }

    /**
     * POST /api/profil/2fa/confirmer
     * Valide le premier code généré par l'appli — active définitivement la 2FA.
     */
    @PostMapping("/2fa/confirmer")
    public ResponseEntity<Map<String, String>> confirmerDeuxFA(
            @Valid @RequestBody Confirmer2FARequest request,
            @AuthenticationPrincipal Utilisateur utilisateur) {

        authService.confirmerDeuxFA(utilisateur, request.getCode());
        return ResponseEntity.ok(Map.of("message", "Double authentification activée"));
    }

    /**
     * POST /api/profil/2fa/desactiver
     */
    @PostMapping("/2fa/desactiver")
    public ResponseEntity<Map<String, String>> desactiverDeuxFA(
            @AuthenticationPrincipal Utilisateur utilisateur) {

        authService.desactiverDeuxFA(utilisateur);
        return ResponseEntity.ok(Map.of("message", "Double authentification désactivée"));
    }
}
