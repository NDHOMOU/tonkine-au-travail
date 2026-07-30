package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DemandeReinitialisationRequest {

    @NotBlank(message = "L'e-mail est obligatoire")
    @Email(message = "E-mail invalide")
    private String email;
}
