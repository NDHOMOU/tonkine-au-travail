package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhotoProfilRequest {

    /** Image encodée en base64 (data URL ou base64 brut) */
    @NotBlank
    private String photoBase64;
}
