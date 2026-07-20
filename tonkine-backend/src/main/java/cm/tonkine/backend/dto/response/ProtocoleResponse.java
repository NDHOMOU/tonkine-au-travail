package cm.tonkine.backend.dto.response;

import cm.tonkine.backend.enums.ZoneCorps;
import lombok.*;

import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProtocoleResponse {
    private Long                       id;
    private String                     titre;
    private String                     description;
    private ZoneCorps                  zone;
    private Integer                    dureeSemaines;
    private String                     avertissementMedical;
    private List<EtapeProtocoleResponse> etapes;
}
