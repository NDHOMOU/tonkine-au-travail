package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreerCompteAdminRequest {

    @NotBlank
    private String prenom;

    @NotBlank
    private String nom;

    @NotBlank @Email
    private String email;
}
