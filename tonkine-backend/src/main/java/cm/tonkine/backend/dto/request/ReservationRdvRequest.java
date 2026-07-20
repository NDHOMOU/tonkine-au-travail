package cm.tonkine.backend.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Réservation d'un rendez-vous avec le kinésithérapeute de l'entreprise.
 * Le kiné n'est plus choisi par l'employé — il est automatiquement
 * déterminé à partir de l'entreprise de l'employé connecté.
 */
@Data
public class ReservationRdvRequest {

    @NotNull(message = "La date du RDV est obligatoire")
    @Future(message = "La date doit être dans le futur")
    private LocalDate dateRdv;

    @NotNull(message = "L'heure de début est obligatoire")
    private LocalTime heureDebut;

    /** Motif principal (douleurs, prévention, bilan...) */
    private String motif;
}
