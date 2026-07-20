package cm.tonkine.backend.dto.response;

import cm.tonkine.backend.enums.StatutRdv;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Rendez-vous dans la vue du kinésithérapeute.
 */
@Data
@Builder
public class RdvKineResponse {

    private Long id;

    // ── Patient ──
    private Long employeId;
    private String nomEmploye;
    private String departement;
    private String douleursDeclarees;  // Douleurs du profil — contexte pour le kiné

    // ── Créneau ──
    private LocalDate dateRdv;
    private LocalTime heureDebut;
    private Integer dureeMinutes;

    // ── RDV ──
    private StatutRdv statut;
    private String motif;
    private String notesSeance;
}
