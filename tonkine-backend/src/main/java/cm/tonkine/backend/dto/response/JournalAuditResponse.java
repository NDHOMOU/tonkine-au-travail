package cm.tonkine.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JournalAuditResponse {
    private String        acteur;
    private String        action;
    private String        details;
    private LocalDateTime dateAction;
}
