package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class EmployeCompteResponse {
    private Long           id;
    private String         prenom;
    private String         nom;
    private String         email;
    private String         departement;
    private String         poste;
    private boolean        actif;
    private LocalDateTime  dateCreation;
}
