package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConnexionJournalResponse {
    private String        nomComplet;
    private String        email;
    private String        role;
    private String        adresseIp;
    private LocalDateTime dateConnexion;
}
