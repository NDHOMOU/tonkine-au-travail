package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EtapeProtocoleRequest {

    @NotNull(message = "L'exercice de cette étape est obligatoire")
    private Long exerciceId;

    @NotNull @Min(1)
    private Integer semaine;

    @NotNull @Min(1)
    private Integer ordre;

    private String labelSemaine;
    private String frequence;
    private Boolean verrouille = false;
}
