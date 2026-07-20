package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Réponse du kinésithérapeute à une demande de conseil.
 */
@Data
public class ReponseConseilRequest {

    @NotBlank(message = "La réponse ne peut pas être vide")
    @Size(min = 5, max = 5000, message = "La réponse doit contenir entre 5 et 5000 caractères")
    private String reponse;
}
