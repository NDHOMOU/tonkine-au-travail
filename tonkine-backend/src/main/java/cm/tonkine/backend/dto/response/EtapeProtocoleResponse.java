package cm.tonkine.backend.dto.response;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EtapeProtocoleResponse {
    private Long    id;
    private Integer semaine;
    private Integer ordre;
    private String  labelSemaine;
    private String  frequence;
    private Boolean verrouille;
    // Exercice lié (titre suffit)
    private Long    exerciceId;
    private String  exerciceTitre;
    private String  exerciceDescription;
    private Integer exerciceDureeMinutes;
}
