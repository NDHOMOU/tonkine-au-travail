package cm.tonkine.backend.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gestionnaire centralisé des exceptions REST.
 *
 * Retourne des réponses JSON cohérentes sans exposer de stack traces
 * ni d'informations internes en production.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 400 — Validation des champs (@Valid / @Validated) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> erreurs = ex.getBindingResult()
            .getFieldErrors().stream()
            .collect(Collectors.toMap(
                fe -> fe.getField(),
                fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Valeur invalide",
                (a, b) -> a  // en cas de doublon, garder le premier message
            ));

        return ResponseEntity.badRequest().body(Map.of(
            "statut",  400,
            "erreur",  "Données invalides",
            "champs",  erreurs,
            "horodatage", LocalDateTime.now().toString()
        ));
    }

    /** 400 — Contrainte JPA (ex. unique, not null) */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraint(
            ConstraintViolationException ex) {
        return ResponseEntity.badRequest().body(Map.of(
            "statut", 400,
            "erreur", ex.getMessage()
        ));
    }

    /** 400 — Erreurs métier explicites (ex. email déjà pris) */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of(
            "statut", 400,
            "erreur", ex.getMessage()
        ));
    }

    /** 401 — Token manquant ou invalide */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(
            AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
            "statut", 401,
            "erreur", "Authentification requise"
        ));
    }

    /**
     * 403 — Accès refusé.
     * Cas typiques : mauvais rôle, ou tentative d'accéder aux données
     * d'un autre utilisateur (IDOR — ex. confirmerPause d'une alerte étrangère).
     *
     * IMPORTANT : on ne logue PAS le message complet en production
     * (il pourrait contenir des IDs internes). Seul un log WARN générique.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex) {
        log.warn("🔒 Accès refusé : {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
            "statut", 403,
            "erreur", "Accès refusé"
        ));
    }

    /** 500 — Erreur inattendue (ne jamais exposer de détails techniques) */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("💥 Erreur interne non gérée", ex);
        Throwable racine = ex;
        while (racine.getCause() != null) racine = racine.getCause();
        return ResponseEntity.internalServerError().body(Map.of(
            "statut", 500,
            "erreur", "Une erreur interne s'est produite. Veuillez réessayer.",
            "debugType", racine.getClass().getName(),
            "debugMessage", String.valueOf(racine.getMessage())
        ));
    }
}
