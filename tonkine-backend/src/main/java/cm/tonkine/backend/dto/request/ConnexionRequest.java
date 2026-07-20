package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConnexionRequest {

    @NotBlank @Email
    private String email;

    @NotBlank
    private String motDePasse;
}
