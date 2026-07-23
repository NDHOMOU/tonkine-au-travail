package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Retourné une seule fois lors de la création d'un compte admin ou d'une
 * réinitialisation de mot de passe — l'admin doit le communiquer à
 * l'utilisateur concerné, il n'est jamais re-consultable ensuite.
 */
@Data
@Builder
public class MotDePasseTemporaireResponse {
    private Long   userId;
    private String email;
    private String motDePasseTemporaire;
}
