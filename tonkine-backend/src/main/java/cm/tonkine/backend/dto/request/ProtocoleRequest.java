package cm.tonkine.backend.dto.request;

import cm.tonkine.backend.enums.ZoneCorps;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ProtocoleRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "La zone est obligatoire")
    private ZoneCorps zone;

    @NotNull @Min(1)
    private Integer dureeSemaines;

    private String avertissementMedical;

    @Valid
    private List<EtapeProtocoleRequest> etapes = new ArrayList<>();
}
