package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CompteAdminResponse {
    private Long          id;
    private String        prenom;
    private String        nom;
    private String        email;
    private boolean       actif;
    private boolean       motDePasseTemporaire;
    private LocalDateTime dateCreation;
}
