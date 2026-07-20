package cm.tonkine.backend.dto.response;

import cm.tonkine.backend.enums.StatutConseil;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Réponse représentant une demande de conseil santé.
 * Utilisée côté employé ET côté kinésithérapeute.
 */
@Data
@Builder
public class ConseilSanteResponse {

    private Long id;

    // ── Employé ──
    private Long employeId;
    private String nomEmploye;
    private String departementEmploye;
    private String posteEmploye;

    // ── Contenu ──
    private String question;
    private String zoneConcernee;
    private String niveauUrgence;
    private StatutConseil statut;
    private String reponse;

    // ── Dates ──
    private LocalDateTime dateQuestion;
    private LocalDateTime dateVue;
    private LocalDateTime dateReponse;

    /** Durée depuis la question en minutes (pour afficher "il y a 20 min") */
    private Long minutesDepuisQuestion;
}
