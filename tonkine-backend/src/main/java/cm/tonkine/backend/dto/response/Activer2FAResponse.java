package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Secret TOTP en attente de confirmation — l'utilisateur doit l'ajouter dans
 * son appli d'authentification (saisie manuelle de la clé) puis renvoyer un
 * code pour confirmer avant que la 2FA ne devienne active.
 */
@Data
@Builder
public class Activer2FAResponse {
    private String secret;
    private String otpauthUri;
}
