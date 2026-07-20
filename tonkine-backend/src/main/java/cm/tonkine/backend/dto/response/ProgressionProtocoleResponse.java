package cm.tonkine.backend.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProgressionProtocoleResponse {
    private Long      id;
    private Long      protocoleId;
    private String    protocoleTitle;
    private LocalDate dateDebut;
    private Integer   semaineCourante;
    private Integer   etapesCompletees;
    private Integer   etapesTotales;
    private Integer   pourcentageProgression;
}
